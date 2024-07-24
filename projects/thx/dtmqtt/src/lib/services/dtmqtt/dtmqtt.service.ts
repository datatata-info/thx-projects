import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { MqttService } from '../mqtt/mqtt.service';
// import { SigmqttService } from '../sigmqtt/sigmqtt.service'
import { map, filter } from 'rxjs/operators';
import { share } from 'rxjs/operators';
// import { Paho } from 'ng2-mqtt/mqttws31';
import {SigmqttpubkeyService} from '../sigmqttpubkey/sigmqttpubkey.service';
import * as forge from 'node-forge';

const START_REQUEST_SIZE = 4;
const STOP_REQUEST_SIZE = 3;

export interface AppDataRequests {
  topic: string;
  command: string;
  params: any;
  timestamp: any;
}

@Injectable({
  providedIn: 'root'
})
export class DtmqttService {

  constructor(
    public mqttService: MqttService,
    public sigMqttService: SigmqttpubkeyService
  ) {
    this.startServiceTime = + new Date();
    this.applicationName = 'messenger';
    this.connect();
    this.createTimeGeneratorSubject();
  }
  public static appOptionsReqName: string[] = ['tmp1', 'tmp2', 'tmp3'];

  public useEncryption: boolean = false;
  public sharedKeys: any[] = new Array();
  public messages: Subject<any> = new Subject<any>();
  public requestedUsersData: Subject<any> = new Subject<any>();
  public startRequests: Subject<any> = new Subject<any>();
  public stopRequests: Subject<any> = new Subject<any>();
  public refreshRequests: Subject<any> = new Subject<any>();
  public topicUrlSafe!: string;

  public subscribedTopics: string[] = new Array();
  public subscribedTopicsCmdParams: string[] = [];
  protected applicationName: string;
  public myTopicRefreshIntervals: any[] = [];

  public appDataRequests: AppDataRequests[] = new Array();

  public timeGeneratorRefresherSubject: Subject<any> = new Subject<any>();
  public timeGeneratorRefresher: Subject<any> = new Subject<any>();
  public timeGeneratorInterval: any;
  public timeGeneratorTime: any;
  public startServiceTime: any = undefined;
  public isCreator: boolean = false;
  public isPrivate: boolean = false;
  public isReceiving: boolean = true;

  public getClientId(): string {
    return this.mqttService.clientId;
  }

  clean() {
    this.useEncryption = false;
    this.sharedKeys = new Array();
    this.topicUrlSafe = '';

    for (let i=0; i < this.subscribedTopics.length; i++) {
      this.unsubscribeTopic(this.subscribedTopics[i]);
    }

    this.subscribedTopics = new Array();
    this.subscribedTopicsCmdParams = [];
    this.applicationName = '';
    this.myTopicRefreshIntervals = [];

    this.appDataRequests = new Array();

    this.timeGeneratorInterval = undefined;
    this.timeGeneratorTime = undefined;
    this.startServiceTime = undefined;
    this.isCreator = false;
    this.isPrivate = false;


    this.timeGeneratorRefresherSubject.unsubscribe();
    this.timeGeneratorRefresher.unsubscribe();
    this.messages.unsubscribe();
    this.requestedUsersData.unsubscribe();
    this.startRequests.unsubscribe();
    this.stopRequests.unsubscribe();
    this.refreshRequests.unsubscribe();

    this.timeGeneratorRefresherSubject = new Subject<any>();
    this.timeGeneratorRefresher = new Subject<any>();
    this.messages = new Subject<any>();
    this.requestedUsersData = new Subject<any>();
    this.startRequests = new Subject<any>();
    this.stopRequests = new Subject<any>();
    this.refreshRequests = new Subject<any>();
  }

  private createTimeGeneratorSubject(): void {
    this.timeGeneratorRefresher = (this.timeGeneratorRefresherSubject
      .pipe(map((value: any): any => {
        for (let i = 0; i < this.appDataRequests.length; i++) {
          const diff = value - this.appDataRequests[i].timestamp;
          if (diff > 7500) {
              this.appDataRequests.splice(i, 1);
          }
        }

        this.timeGeneratorTime = + new Date();
        return value;
      }))
      .pipe(share()) as Subject<any>);

    this.timeGeneratorRefresher.subscribe();

    this.timeGeneratorTime = + new Date();

    this.timeGeneratorInterval = interval(7000).subscribe(x => {
      this.timeGeneratorRefresherSubject.next(this.timeGeneratorTime);
    });
  }

  setIsReceiving(isReceiving: boolean): void {
    this.isReceiving = isReceiving;
  }

  getIsReceiving(): boolean {
    return this.isReceiving;
  }


  /* connect/get observer for mqttconnection
     * filter and fill data structures (requests for data, requested data)
     * also create subscribeable pipes
     */
  connect() {
    this.messages = (this.mqttService
      .connect()
      .pipe(map((response: any): any => {
        // console.log("all", response);
        return response;
      }))
      .pipe(share()) as Subject<any>);

    this.requestedUsersData = (this.mqttService
      .connect()
      .pipe(filter((response: any) => response.destinationName.split('/')[1] === this.applicationName))
      .pipe(filter((response: any) => this.subscribedTopics.indexOf(response.destinationName) > -1))
      .pipe(map((response: any): any => {
        if (!this.isReceiving) {
          return null;
        }
        console.log('requested users data', response);
        var tmpResponse = response.payloadString;
        if (this.useEncryption && this.sigMqttService.sharedSecretKey != undefined) {
          try {
            tmpResponse = this.sigMqttService.decryptShared(response.payloadString);
          }
          catch (Error) {
            console.log("EEEEEEEEEERRROR", tmpResponse);
          }
          console.log("DTMQTT REQUESTEDUSERDATA", tmpResponse);
        }
        if (this.isValidJSONString(tmpResponse)) {
          return JSON.parse(tmpResponse);
        } else {
          return null;
        }
      }))
      .pipe(share()) as Subject<any>);


    this.startRequests = (this.mqttService
      .connect()
      .pipe(filter((response: any) => response.destinationName.split('/')[1] === this.applicationName))
      .pipe(filter((response: any) => response.destinationName.split('/').length < 3))
      .pipe(filter((response: any) => response.payloadString.split('|').length === START_REQUEST_SIZE))
      .pipe(filter((response: any) => response.payloadString.split('|')[response.payloadString.split('|').length - 1] === 'start'))
      .pipe(filter((response: any) => !this.appDataRequests.some(obj => obj.topic === response.payloadString.split('|')[2])))
      .pipe(filter((response: any) => !this.subscribedTopics.includes(response.payloadString.split('|')[1])))
      .pipe(map((response: any): any => {
         console.log('start requests', response);
         const splitMsg = response.payloadString.split('|');

         let params;
         console.log(splitMsg[2].split(/,(.+)/)[1]);
         if (this.isValidJSONString(splitMsg[2].split(/,(.+)/)[1])) {
          params = JSON.parse(splitMsg[2].split(/,(.+)/)[1]);
        }

         const req = {
          topic: splitMsg[1],
          command: splitMsg[2].split(',')[0],
          params,
          timestamp: + new Date()
        };

         this.appDataRequests.push(req);
         return req;
      }))
      .pipe(share()) as Subject<any>);

    this.refreshRequests = (this.mqttService
      .connect()
      .pipe(filter((response: any) => response.destinationName.split('/')[1] === this.applicationName))
      .pipe(filter((response: any) => response.destinationName.split('/').length < 3))
      .pipe(filter((response: any) => response.payloadString.split('|').length === START_REQUEST_SIZE))
      .pipe(filter((response: any) => response.payloadString.split('|')[response.payloadString.split('|').length - 1] === 'refresh'))
      .pipe(filter((response: any) => !this.appDataRequests.some(obj => obj.topic === response.payloadString.split('|')[2])))
      .pipe(map((response: any): any => {
        const splitMsg = response.payloadString.split('|');

        let params;
        console.log(splitMsg[2].split(/,(.+)/)[1]);
        if (this.isValidJSONString(splitMsg[2].split(/,(.+)/)[1])) {
          params = JSON.parse(splitMsg[2].split(/,(.+)/)[1]);
        }

        const req = {
          topic: splitMsg[1],
          command: splitMsg[2].split(',')[0],
          params,
          timestamp: + new Date()
        };

        const index = this.appDataRequests.findIndex(obj => obj.topic == req.topic);
        if (index > -1) {
          this.appDataRequests[index].timestamp = req.timestamp;
        }
        else {
          this.appDataRequests.push(req);
        }
        return req;

      }))
      .pipe(share()) as Subject<any>);

    this.stopRequests = (this.mqttService
      .connect()
      .pipe(filter((response: any) => response.destinationName.split('/')[1] === this.applicationName))
      .pipe(filter((response: any) => response.destinationName.split('/').length < 3))
      .pipe(filter((response: any) => response.payloadString.split('|').length === STOP_REQUEST_SIZE))
      .pipe(filter((response: any) => response.payloadString.split('|')[response.payloadString.split('|').length - 1] === 'stop'))
      .pipe(filter((response: any) => this.appDataRequests.findIndex(obj => obj.topic == response.payloadString.split('|')[1]) > -1))
      .pipe(map((response: any): any => {
        // console.log("stop requests", response);

        const tmpTopic = response.payloadString.split('|')[1];
        const index = this.appDataRequests.findIndex(obj => obj.topic == tmpTopic);
        if (index > -1) {
          this.appDataRequests.splice(index, 1);
        }
        const req = {
          topic: tmpTopic,
          timestamp: + new Date()
        };
        return req;
      }))
      .pipe(share()) as Subject<any>);

    this.requestedUsersData.subscribe();
    this.startRequests.subscribe();
    this.stopRequests.subscribe();
    this.refreshRequests.subscribe();
  }

  getVerifier(): void {
    return this.sigMqttService.creatorStartVerifier;
  }

  setVerifier(verifier: string): void {
    this.sigMqttService.creatorStartVerifier = verifier;
  }

  createUrlSafeHash(topic: string): void {
    if (this.getVerifier() != undefined) {
      this.topicUrlSafe = btoa(topic.replace(/\//g, '--') + '--' + this.getVerifier());
    }
    else {
      this.topicUrlSafe = btoa(topic.replace(/\//g, '--'));
    }
  }

  getUrlSafeHash(): string {
    return this.topicUrlSafe;
  }

  transformUrlHashBack(urlHash: string): any {
    var splitted = atob(urlHash).split('--');
    var result = {
      topic: '/'+splitted[1]+'/'+splitted[2]+'/'+splitted[3],
      verifier: ''
    };

    if (splitted && splitted.length > 4) {
      result.verifier = splitted[4];
    }

    return result;
  }

  setPrivate(): void {
    this.isPrivate = true;
  }

  getPrivate(): boolean {
    return this.isPrivate;
  }

  setPassword(pass: string): void {
    this.sigMqttService.requirePassword = true;
    this.sigMqttService.password = pass;
  }

  setTemporaryExpirationTimer(timer: any): void {
    this.sigMqttService.temporaryExpirationTimer = timer;
    this.sigMqttService.initExpirationEvent();
  }

  /* subscribe for topic
   */
  subscribeTopic(topic: string) {
    this.mqttService.subscribeTopic(topic);
  }

  /* subscribe for topic
   * differentiates if using encryption or not
   * if using encryption then serves as initial signaling point for client part
   */
  subscribePersonalTopic(topic: string, validator: string): void {
    if (this.isCreator || this.useEncryption == false) {
      this.mqttService.subscribeTopic(topic);
    }
    else {
      this.sendClientSignalWantJoin(topic, validator);
    }
  }

  sendClientSignalWantJoin(topic: string, validator: string): void {
    this.setVerifier(validator);
    this.sigMqttService.clientStartTimer = + new Date();
    this.sigMqttService.sendWantJoin(
      this.sigMqttService.replaceAppToSignalTopic(this.applicationName, topic),
      this.mqttService.createValidator(`${this.getClientId()}|${this.sigMqttService.clientStartTimer}`),
      validator
    );
  }

  /* unsubscribe from topic
   */
  unsubscribeTopic(topic: string) {
    this.mqttService.unsubscribeTopic(topic);
  }

  deauthenticate() {
    this.sigMqttService.sendLeave();
  }

  /* generate unique id for request
   */
  requestIdGenerator(): string {
    return 'xxxxxxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /* generate topic for unique request for data
   * format: /applicationName/clientId/uniqueGeneratedId
   */
  generateRequestTopic(reqName: string): string {
    // if (DtmqttService.appOptionsReqName.indexOf(reqName) > -1) {
      const tmp = this.requestIdGenerator();
      return `/${this.applicationName}/${this.mqttService.clientId}/${tmp}`;
    // }

    // return null;
  }

  /* send request for data to applicationName topic,
   * and subscribe to request topic to receive users data
   */
  sendRequest(reqName: string, params?: any): string {
    this.isCreator = true;
    // console.log('sendReqest reqName', reqName);
    let tmpCmdParams = ``;
    if (this.subscribedTopics.length < 1) {
      const reqTopic = this.generateRequestTopic(reqName);
      // console.log('sendRequest reqTopic', reqTopic);
      if (reqTopic) {
        this.subscribeTopic(reqTopic);
        let tmpMessage = ``;

        // if using encryption then add validator to parameters for start request
        if (this.useEncryption == true) {
          this.sigMqttService.isCreator = true;
          this.sigMqttService.generateSharedSecret();
          this.sigMqttService.subscribeTopic(this.sigMqttService.replaceAppToSignalTopic(this.applicationName, reqTopic));
          this.sigMqttService.creatorStartTimer = + new Date();
          this.sigMqttService.creatorStartVerifier = btoa(forge.pki.publicKeyToPem(this.mqttService.keyPair['publicKey']));
          if (params != undefined) {
            params.validator = this.sigMqttService.creatorStartVerifier;
          }
          else {
            params = {validator: this.sigMqttService.creatorStartVerifier};
          }
        }

        this.createUrlSafeHash(reqTopic);

        if (this.isPrivate === false) {
          if (this.isValidJSON(params) && params != undefined) {
            const tmpStringifiedParams = JSON.stringify(params);
            console.log("params", tmpStringifiedParams);
            tmpMessage = `${this.applicationName}|${reqTopic}|${reqName},${tmpStringifiedParams}|start`;
            tmpCmdParams = `${reqName},${tmpStringifiedParams}`;
          }
          else {
            tmpMessage = `${this.applicationName}|${reqTopic}|${reqName},|start`;
            tmpCmdParams = `${reqName},`;
          }

          const message = {
            destinationName: `/${this.applicationName}`,
            message: tmpMessage
          };
          console.log("dtmqtt sendRequest", message);

          this.createRefresher(0);
          this.messages.next(message);
        }
        this.subscribedTopicsCmdParams.push(tmpCmdParams);
        this.subscribedTopics.push(reqTopic);
        return reqTopic;
      }
    }
    return '';
  }

  createRefresher(index: number): void {

    const tmp = interval(5000).subscribe(x => {
      this.sendRefreshRequest(index);
    });
    // setup refresh
    this.myTopicRefreshIntervals.push(tmp);
  }

  deleteRefresher(index: number): void {
    this.myTopicRefreshIntervals[index].unsubscribe();
    this.myTopicRefreshIntervals.splice(index, 1);
  }

  sendRefreshRequest(index: number): void {
    if (this.subscribedTopics.length >= index + 1) {

      const tmpMessage = `${this.applicationName}|${this.subscribedTopics[index]}|${this.subscribedTopicsCmdParams[index]}|refresh`;
      const message = {
        destinationName: `/${this.applicationName}`,
        message: tmpMessage
      };

      this.messages.next(message);
    }
  }

  /* send request to stop sending requested data
   * and unsubscribe topic
   */
  sendStopRequest(topic: string) {
    console.log('sendStopRequest');
    const index = this.subscribedTopics.indexOf(topic);
    if (index !== -1) {
      this.deleteRefresher(index);
      this.subscribedTopics.splice(index, 1);

      const tmpMessage = `${this.applicationName}|${topic}|stop`;

      const message = {
        destinationName: `/${this.applicationName}`,
        message: tmpMessage
      };

      this.messages.next(message);
      this.unsubscribeTopic(topic);
      console.log('sendStopRequest sent ok finished');
      console.log('appname ' + this.applicationName);
      console.log('message ' + tmpMessage);
    }
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

  sendMessage(message: string) {
    this.messages.next(message);
  }

  sendMessageJSON(message: any): void {
    if (this.useEncryption && this.sigMqttService.sharedSecretKey != undefined) {
      message.message = this.sigMqttService.encryptShared(JSON.stringify(message.message));
    }
    else {
      message.message = JSON.stringify(message.message);
    }
    this.messages.next(message);
  }
}
