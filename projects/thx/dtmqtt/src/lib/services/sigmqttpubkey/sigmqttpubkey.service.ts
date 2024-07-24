import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { MqttService } from '../mqtt/mqtt.service';
import * as forge from 'node-forge';
import * as CryptoJS from 'crypto-js';

const START_SIGNAL_REQUEST_SIZE = 4;
const MAX_PASSWORD_RETRIES = 3;
const JOIN_PARAMS_ACK_EXPIRATION_DELAY = 5000; // in ms
const WANT_JOIN_EXPIRATION_DELAY = 5000; // in ms

export interface SignalStatusMessages {
  status: string;
  data: any;
  message: string;
}

export interface SignalState {
  state: string;
  retries: number;
  pubKey: any;
  timestamp: any[];
  verifier: any[];
}

export interface SignalClientState extends SignalState {
  creatorId: string;
  temporaryExpiration: any;
}

export interface SignalCreatorClientsState extends SignalState {
  clientId: string;
  failed: boolean;
}

@Injectable({
  providedIn: 'root'
})
  export class SigmqttpubkeyService {
  protected applicationName: string;
  public messages: Subject<any> = new Subject<any>();
  public signalRequests: Subject<any> = new Subject<any>();
  public subscribedTopics: string[] = new Array();
  public isCreator: boolean = false;
  // to save clients state trying to obtain key
  public creatorClientsState: SignalCreatorClientsState[] = new Array();
  public creatorStartTimer: any;
  public creatorStartVerifier: any;
  // to save client state localy if i am trying to obtain key
  public clientsState!: SignalClientState | undefined;
  public clientStartTimer: any;
  public requirePassword: boolean;
  public password!: string;
  public temporaryExpirationTimer: any;

  // shared secret
  public sharedSecretKey: any;
  public sharedSecretIV: any;
  public transformedSharedSecretKey: any;
  public transformedSharedSecretIV: any;

  // callback subject
  public signalMessagesSubject: Subject<any> = new Subject<any>();
  public toSignalMessagesSubject: Subject<any> = new Subject<any>();

  // timer subjects
  public signalConnectionTimerSubject: Subject<any> = new Subject<any>();
  public signalFeaturesTimerSubject: Subject<any> = new Subject<any>();

  constructor(
    private mqttService: MqttService
  ) {
    this.applicationName = 'signal';
    this.requirePassword = false;
    this.connect();
  }

  public getClientId(): string {
    return this.mqttService.clientId;
  }

  clean(): void {
    for (let i = 0; i < this.subscribedTopics.length; i++) {
      this.unsubscribeTopic(this.subscribedTopics[i]);
    }

    this.subscribedTopics = new Array();
    this.isCreator = false;
    // to save clients state trying to obtain key
    this.creatorClientsState = new Array();
    this.creatorStartTimer = undefined;
    this.creatorStartVerifier = undefined;
    // to save client state localy if i am trying to obtain key
    this.sharedSecretKey = undefined;
    this.sharedSecretIV = undefined;
    this.transformedSharedSecretKey = undefined;
    this.transformedSharedSecretIV = undefined;
    this.password = '';
    this.temporaryExpirationTimer = undefined;
    this.clientsState = undefined;
    this.clientStartTimer = undefined;

    this.disconnectSubjects();

    this.messages = new Subject<any>();
    this.signalRequests = new Subject<any>();

    this.signalConnectionTimerSubject = new Subject<any>();
    this.toSignalMessagesSubject = new Subject<any>();
    this.signalConnectionTimerSubject = new Subject<any>();
    this.signalFeaturesTimerSubject = new Subject<any>();

    this.connect();
  }

  disconnectSubjects(): void {
    this.messages.unsubscribe();
    this.signalRequests.unsubscribe();

    this.signalConnectionTimerSubject.unsubscribe();
    this.toSignalMessagesSubject.unsubscribe();
    this.signalConnectionTimerSubject.unsubscribe();
    this.signalFeaturesTimerSubject.unsubscribe();
  }

  /* connect/get observer for mqttconnection
   * filter and fill data structures (requests for data, requested data)
   * also create subscribeable pipes
   */
  connect() {
    this.messages = (this.mqttService
      .connect()
      .pipe(share()) as Subject<any>);

    this.signalConnectionTimerSubject.pipe(share());
    this.signalFeaturesTimerSubject.pipe(share());

    this.signalConnectionTimerSubject.subscribe((msg: any) => {
    });

    this.signalFeaturesTimerSubject.subscribe((msg: any) => {
      if (msg.status === 'expiration') {
        this.clean();
      }
      if (msg.status === 'join_params_ack_expired') {
        if (this.clientsState && this.clientsState.state === 'await_join_ack') {
          this.passwordRequest();
        }
      }
      if (msg.status === 'await_join_params_expired') {
        if (this.clientsState && this.clientsState.state === 'await_join_params_expired') {
          this.sendSignalMessageSubject(
            'signaling_failed',
            'No one responded to you!',
            undefined
          );
          // const snackData: SnackData = {
          //   type: 'error',
          //   message: 'No one responded to you!'
          // };
          // this.snackService.snackData.next(snackData);
        }
      }
    });

    this.signalRequests = (this.mqttService
      .connect()
      .pipe(filter((response: any) => response.destinationName.split('/')[1] === this.applicationName))
      .pipe(filter((response: any) => response.destinationName.split('/').length === 4))
      .pipe(filter((response: any) => response.payloadString.split('|').length === START_SIGNAL_REQUEST_SIZE))
      .pipe(filter((response: any) => response.payloadString.split('|')[response.payloadString.split('|').length - 1] === 'signal'))
      .pipe(filter((response: any) => this.subscribedTopics.includes(response.payloadString.split('|')[1])))
      .pipe(map((response: any): any => {
        console.log('signal requests', response);
        const splitMsg = response.payloadString.split('|');

        let tmpParams;
        if (this.isValidJSONString(splitMsg[2].split(/,(.+)/)[1])) {
          tmpParams = JSON.parse(splitMsg[2].split(/,(.+)/)[1]);
        }
        else {
          return undefined;
        }

        const req = {
          topic: splitMsg[1],
          command: splitMsg[2].split(',')[0],
          params: tmpParams,
          timestamp: + new Date()
        };

        return req;
      }))
      .pipe(share()) as Subject<any>);

    this.signalRequests.subscribe((msg: any) => {
      this.fsm(msg);
    });

    this.toSignalMessagesSubject.subscribe((msg: any) => {
      if (msg === 'new_password') {
        this.sendJoinParamsAck();
      }
    });
  }

  // creator 1.
  handleWantJoin(msg: any): void {
    let decryptedData = undefined;
    try {
      decryptedData = JSON.parse(this.mqttService.keyPair.privateKey.decrypt(atob(msg.params.data), 'RSA-OAEP'));
    }
    catch (Error) {
      return;
    }

    // if already has client id in list of states then skip (probably violation)
    const index = this.creatorClientsState.findIndex(obj => obj.clientId === msg.params.clientId);
    if (index !== -1) {
      return;
    }

    const pubkey = forge.pki.publicKeyFromPem(msg.params.pubKey);

    if (!this.mqttService.verifyValidator(
      pubkey,
      msg.params.verifier,
      msg.params.data
    )) {
      return;
    }

    const state: SignalCreatorClientsState = {
      state: 'await_join_params',
      clientId: decryptedData.clientId,
      timestamp: [],
      verifier: [],
      pubKey: pubkey,
      retries: 0,
      failed: false,
    };
    // udelat verifikaci clientId a timestampu oproti pubkeyi
    this.creatorClientsState.push(state);


    const data = {
      passRequired: this.requirePassword,
    };

    const params = {
      data: btoa(state.pubKey.encrypt(JSON.stringify(data), 'RSA-OAEP')),
      verifier: ''
    };
    params.verifier = this.mqttService.createValidator(params.data);

    this.sendSignalMsg('join_params', params);
    console.log('SENT JOIN_PARAMS', params);

  }

  // creator 2.
  handleJoinParamsAck(msg: any): void {
    console.log('HANDLE JOIN_PARAMS_ACK', msg);
    let decryptedData = undefined;
    try {
      decryptedData = JSON.parse(this.mqttService.keyPair['privateKey'].decrypt(atob(msg.params.data), 'RSA-OAEP'));
    }
    catch (Error) {
      return;
    }
    const index = this.creatorClientsState.findIndex(obj => obj.clientId === decryptedData.clientId);
    if (index === -1) {
      return;
    }

    const clientState = this.creatorClientsState[index];
    if (clientState.state !== 'await_join_params') {
      return;
    }

    if (clientState.failed) {
      return;
    }

    if (!this.mqttService.verifyValidator(
      clientState.pubKey,
      msg.params.verifier,
      msg.params.data
    )) {
      return;
    }


    if (this.requirePassword) {
      if (clientState.retries < MAX_PASSWORD_RETRIES) {
        if (this.password !== decryptedData.password) {
          // TODO: failed bad password, do something
          clientState.retries++;
          return;
        }
      }
      else {
        clientState.failed = true;
      }
    }

    const data = {
      secretKey: this.sharedSecretKey,
      iv: this.sharedSecretIV,
      temporaryExpirationTimer: this.temporaryExpirationTimer
    };

    const params = {
      data: btoa(clientState.pubKey.encrypt(JSON.stringify(data), 'RSA-OAEP')), // zasifrovat toto
      verifier: ''
    };
    params.verifier = this.mqttService.createValidator(params.data);

    this.sendSignalMsg('join_ack', params);
    clientState.state = 'successfully_joined';
    console.log('JOIN_ACK_SEND_SIGNAL');

    const sigStatMsg: SignalStatusMessages = {
      status: 'signal_successfully_joined_client',
      message: 'Successfully joined client',
      data: clientState.clientId
    };

    this.signalMessagesSubject.next(sigStatMsg);
  }

  handleLeave(msg: any): void {
    let decryptedData = undefined;
    try {
      decryptedData = JSON.parse(this.mqttService.keyPair['privateKey'].decrypt(atob(msg.params.data), 'RSA-OAEP'));
    }
    catch (Error) {
      return;
    }
    const index = this.creatorClientsState.findIndex(obj => obj.clientId === decryptedData.clientId);
    if (index === -1) {
      return;
    }

    this.creatorClientsState.splice(index, 1);
  }

  // client 1.
  handleJoinParams(msg: any): void {
    if (this.clientsState && this.clientsState.state !== 'await_join_params') {
      return;
    }
    let decryptedData = undefined;
    try {
      decryptedData = JSON.parse(this.mqttService.keyPair['privateKey'].decrypt(atob(msg.params.data), 'RSA-OAEP'));
    }
    catch (Error) {
      console.log("IN ERROR BECAUSE OF UNENCRYPTION");
      return;
    }

    if (this.clientsState && !this.mqttService.verifyValidator(
      this.clientsState.pubKey,
      msg.params.verifier,
      msg.params.data
    )) {
      return;
    }


    console.log('HANDLE JOIN_PARAMS', msg);


    if (this.clientsState) this.clientsState.state = 'await_join_ack';
    this.requirePassword = decryptedData.passRequired;
    if (decryptedData.passRequired) {
      this.passwordRequest();
    }
    else {
      this.sendJoinParamsAck();
    }
  }

  sendJoinParamsAck(): void {
    const data = {
      clientId: this.getClientId(),
      password: this.password
    };

    if (this.clientsState) {
      const params = {
        data: btoa(this.clientsState.pubKey.encrypt(JSON.stringify(data), 'RSA-OAEP')),
        verifier: ''
      };
      params.verifier = this.mqttService.createValidator(params.data);
  
      if (this.requirePassword) {
        if (this.clientsState.retries < MAX_PASSWORD_RETRIES) {
          this.sendExpirationTimerEvent(
            'join_params_ack_expired',
            '',
            undefined,
            JOIN_PARAMS_ACK_EXPIRATION_DELAY
          );
          this.sendSignalMsg('join_params_ack', params);
          this.clientsState.retries++;
        }
        else {
          this.sendSignalMessageSubject(
            'max_retries_exceeded',
            'Sorry, you have already exceeded max password retries!',
            undefined
          );
          // const snackData: SnackData = {
          //   type: 'error',
          //   message: 'Sorry, you have already exceeded max password retries!'
          // };
          // this.snackService.snackData.next(snackData);
        }
      }
      else {
        this.sendSignalMsg('join_params_ack', params);
      }
    }
    
  }

  passwordRequest(): void {
    this.sendSignalMessageSubject(
      'password_required',
      'Require password',
      undefined
    );
  }

  sendSignalMessageSubject(status: string, message: string, data: any): void {
    const sigStatMsg: SignalStatusMessages = {status, message, data};

    this.signalMessagesSubject.next(sigStatMsg);
  }

  // client 2.
  handleJoinAck(msg: any, clientsState: SignalClientState): void {
    if (clientsState.state !== 'await_join_ack') {
      return;
    }
    let decryptedData = undefined;
    try {
      decryptedData = JSON.parse(this.mqttService.keyPair['privateKey'].decrypt(atob(msg.params.data), 'RSA-OAEP'));
    }
    catch (Error) {
      return;
    }

    if (!this.mqttService.verifyValidator(
      clientsState.pubKey,
      msg.params.verifier,
      msg.params.data
    )) {
      return;
    }

    this.sharedSecretKey = decryptedData.secretKey;
    this.sharedSecretIV = decryptedData.iv;
    this.transformedSharedSecretKey = CryptoJS.enc.Base64.parse(this.sharedSecretKey);
    this.transformedSharedSecretIV = CryptoJS.enc.Base64.parse(this.sharedSecretIV);
    this.temporaryExpirationTimer = decryptedData.temporaryExpirationTimer;
    clientsState.temporaryExpiration = decryptedData.temporaryExpirationTimer;
    this.clientsState = clientsState;

    if (this.temporaryExpirationTimer !== undefined) {
      this.initExpirationEvent();
    }

    const sigStatMsg: SignalStatusMessages = {
      status: 'signal_successfully_finished',
      message: 'Successfully joined',
      data: undefined
    };

    this.clientsState.state = 'successfully_joined';

    this.signalMessagesSubject.next(sigStatMsg);

    // const snackData: SnackData = {
    //   type: 'success',
    //   message: 'You have successfully joined channel!'
    // };
    // this.snackService.snackData.next(snackData);

    // unsubscribe from signaling topic as client (do not need to listen anymore)
    this.mqttService.unsubscribeTopic(this.subscribedTopics[0]);
  }

  sendLeave(): void {
    const data = {
      clientId: this.getClientId(),
      salt: Math.floor(Math. random() * 123) + 1
    };
    if (this.clientsState) {
      const params = {
        data: btoa(this.clientsState.pubKey.encrypt(JSON.stringify(data), 'RSA-OAEP')),
        verifier: ''
      };
      params.verifier = this.mqttService.createValidator(params.data);
  
      this.sendSignalMsg('leave', params);
    }
  }

  initExpirationEvent(): void {
    const date1 = + new Date(this.temporaryExpirationTimer);
    const date2 = + new Date();
    const timer = Math.abs(date1 - date2);
    this.sendExpirationTimerEvent('expiration', 'Get OUT!', undefined, timer);
  }

  sendConnectionTimerEvent(status: string, message: string, data: any, timeout: any): void {
    const sigStatMsg: SignalStatusMessages = {status, message, data};
    setTimeout(this.sendTimerEvent, timeout, sigStatMsg, this.signalConnectionTimerSubject);
  }

  sendTimerEvent(msg: any, subject: any) {
    subject.next(msg);
  }

  sendExpirationTimerEvent(status: string, message: string, data: any, timeout: any): void {
    const sigStatMsg: SignalStatusMessages = {status, message, data};
    setTimeout(this.sendTimerEvent, timeout, sigStatMsg, this.signalFeaturesTimerSubject);
  }

  fsm(msg: any): void {
    console.log('FSM RECEIVED MESSAGE', this.applicationName, msg);
    if (msg !== undefined) {
      // creators part of fsm
      if (this.isCreator) {
        if (msg.command === 'want_join') {
          this.handleWantJoin(msg);
        }
        if (msg.command === 'join_params_ack') {
          this.handleJoinParamsAck(msg);
        }
        if (msg.command === 'leave') {
          this.handleLeave(msg);
        }
      }
      // client connecting to app part
      else {
        if (msg.command === 'join_params') {
          this.handleJoinParams(msg);
        }
        if (this.clientsState && msg.command === 'join_ack') {
          this.handleJoinAck(msg, this.clientsState);
        }
      }
    }
  }

  sendSignalMsg(reqCmd: string, params?: any): void {
    // console.log('sendReqest reqName', reqName);
    let tmpMessage = '';
    if (this.isValidJSON(params) && params !== undefined) {
      const tmpStringifiedParams = JSON.stringify(params);
      console.log('params', tmpStringifiedParams);
      tmpMessage = `${this.applicationName}|${this.subscribedTopics[0]}|${reqCmd},${tmpStringifiedParams}|signal`;
    }

    const message = {
      destinationName: this.subscribedTopics[0],
      message: tmpMessage
    };
    this.messages.next(message);
    console.log('SENT SIGNAL MESSAGE', this.applicationName, message);
  }

  sendWantJoin(signalTopic: string, signature: string, verifier: string): void {
    const pubkey = forge.pki.publicKeyFromPem(atob(verifier));

    const state: SignalClientState = {
      state: 'await_join_params',
      creatorId: '',
      pubKey: pubkey,
      retries: 0,
      timestamp: [],
      verifier: [],
      temporaryExpiration: undefined
    };
    this.clientsState = state;

    this.subscribeTopic(signalTopic);
    const tmpData = {
      clientId: this.getClientId(),
    };

    const tmpParams = {
      data: btoa(state.pubKey.encrypt(JSON.stringify(tmpData), 'RSA-OAEP')),
      pubKey: forge.pki.publicKeyToPem(this.mqttService.keyPair['publicKey']),
      verifier: ''
    };
    tmpParams.verifier = this.mqttService.createValidator(tmpParams.data);
    this.sendSignalMsg('want_join', tmpParams);

    this.sendExpirationTimerEvent(
      'await_join_params_expired',
      '',
      undefined,
      WANT_JOIN_EXPIRATION_DELAY
    );
    console.log('SENT WANT_JOIN', tmpParams);
  }

  replaceAppToSignalTopic(appName: string, appTopic: string): string {
    return appTopic.replace('/' + appName + '/', '/' + this.applicationName + '/');
  }

  generateSharedSecret(): void {
    // this.sharedSecretKey = forge.random.getBytesSync(16);
    // this.sharedSecretIV = forge.random.getBytesSync(8);
    // TODO: change this to something randomly generated
    const generateRandomString = function(length=6){
      return Math.random().toString(36).substr(2, length);
    };

    do {
      this.sharedSecretKey = generateRandomString(11) + generateRandomString(11);
    } while (this.sharedSecretKey.length !== 22);

    do {
      this.sharedSecretIV = generateRandomString(11) + generateRandomString(11);
    } while (this.sharedSecretIV.length !== 22);
    // this.sharedSecretKey = '6Le0DgMTAAAAANokdEEial'; // length=22
    // this.sharedSecretIV  = 'mHGFxENnZLbienLyANoi.e'; // length=22

    this.transformedSharedSecretKey = CryptoJS.enc.Base64.parse(this.sharedSecretKey); // key is now e8b7b40e031300000000da247441226a, length=32
    this.transformedSharedSecretIV = CryptoJS.enc.Base64.parse(this.sharedSecretIV); // iv is now 987185c4436764b6e27a72f2fffffffd, length=32

  }

  encryptShared(data: string): any {
    return CryptoJS.AES.encrypt(data, this.transformedSharedSecretKey, { iv: this.transformedSharedSecretIV }).toString();
  }

  decryptShared(encryptedData: any): any {
    return CryptoJS.AES.decrypt(encryptedData, this.transformedSharedSecretKey, { iv: this.transformedSharedSecretIV }).toString(CryptoJS.enc.Utf8);
  }

  leaveSignal(): void {
    this.unsubscribeTopic(this.subscribedTopics[0]);
    this.subscribedTopics.length = 0;
  }

  /* subscribe for topic
   */
  subscribeTopic(topic: string) {
    this.subscribedTopics.push(topic);
    this.mqttService.subscribeTopic(topic);
  }

  /* unsubscribe from topic
   */
  unsubscribeTopic(topic: string) {
    this.mqttService.unsubscribeTopic(topic);
  }

  isValidJSON(obj: any): boolean {
    try {
      JSON.stringify(obj);
      return true;
    } catch (e) {
      return false;
    }
  }

  isValidJSONString(obj: string): boolean {
    try {
      JSON.parse(obj);
      return true;
    } catch (e) {
      return false;
    }
  }

}
