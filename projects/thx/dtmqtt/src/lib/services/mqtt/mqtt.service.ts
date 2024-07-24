import { Injectable, Inject } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';
import { Observable, Observer, Subject, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';
import * as forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';
// import * as CryptoJS from 'crypto-js';
// import {SnackService} from '@core/services/snack/snack.service';
// import {SnackData} from '@core/models/snack-data';

export interface Message {
  destinationName: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MqttService {

  public client;
  private subject: Subject<MessageEvent> = new Subject<MessageEvent>;
  public mqttConnectionStateSubject: Subject<any> = new Subject<any>();
  public clientId: string;
  public mqttHost: string;
  public mqttPort: number;
  public useEncryption: boolean = true;
  public connected: boolean;
  public keyPair!: forge.pki.rsa.KeyPair;
  public topicsToSubscribe: string[] = new Array();

  public onError: Subject<any> = new Subject();


  constructor(
    // public snackService: SnackService,
    @Inject('mqttHost') mqttHost?: string,
    @Inject('mqttPort') mqttPort?: number,
    @Inject('useEncryption') useEncryption: boolean = true
  ) {
    console.log('mqttHost', mqttHost);
    this.useEncryption = useEncryption;

    if (this.useEncryption) {
      this.keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
      /*var self = this;
      // maybe transform to a state approach
      forge.pki.rsa.generateKeyPair({bits: 2048, workers: 2}, (function(err, keypair) {
        // keypair.privateKey, keypair.publicKey
        self.keyPair = keypair;
      }));*/
    }


    this.connected = false;
    this.mqttHost = mqttHost || '0.0.0.0';
    this.mqttPort = mqttPort || 0;
    this.clientId = uuidv4(); // this.generateUID();
    this.client = new Paho.MQTT.Client(this.mqttHost, this.mqttPort, '/', this.clientId);
  }

  // public generateUID(): string {
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  //       const r = Math.random() * 16 | 0, v = c === 'x' ? r : ( r & 0x3 | 0x8 );
  //       return v.toString(16);
  //   });
  // }

  public connect(): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create();
    }
    return this.subject;
  }

  private create(): Subject<MessageEvent> {
    this.client.connect({
      onSuccess: this.onConnected.bind(this),
      // userName: "username",
      // password: "password",
      useSSL: true
    });

    const subject: Subject<MessageEvent> = new Subject();

    const onMessageArived = (message: Paho.MQTT.Message) => {
      if (this.client.isConnected()) {
        const packet = message;
        packet.qos = 2;
        this.client.send(packet);
        subject.next(new MessageEvent('message', {data: message})); // check message type
      }
    }

    this.client.onMessageArrived = onMessageArived;

    return subject;

    // const observer = new Observable((subscriber: Subscriber<any>) => {
    //   
    //   const onMessageArived = (message: Paho.MQTT.Message) => {
    //     subscriber.next(message);
    //   }
    //   this.client.onMessageArrived = onMessageArived;
    // })

    // let tmpObservable = Observable.create(
    //   (obs: Observer<MessageEvent>) => {
// 
    //     this.client.onMessageArrived = obs.next.bind(obs);
    //     return this.client.disconnect.bind(this.client);
    //   })
    // let observable = tmpObservable.pipe(share());
// 
    // let observer = {
    //   next: (data: Message) => {
    //     if (this.client.isConnected()) {
    //       let packet = new Paho.MQTT.Message(data.message);
    //       packet.destinationName = data.destinationName;
    //       packet.qos = 2;
    //       this.client.send(packet);
    //     }
    //   }
    // };

    // return observer;// Subject.create(observer, observable);
  }

  onConnected() {
    console.log('Connected');
    this.connected = true;
    this.mqttConnectionStateSubject.next({ state: "connected" });
    let num = this.topicsToSubscribe.length;
    for (let i = 0; i < num; i++) {
      let topic = this.topicsToSubscribe.pop();
      if (topic) this.client.subscribe(topic, {});
    }
  }

  subscribeTopic(topic: string) {
    console.log('subscribe to topic:', topic);
    if (this.connected === false) {
      this.topicsToSubscribe.push(topic);
    }
    else {
      this.client.subscribe(topic, {});
    }
  }

  unsubscribeTopic(topic: string) {
    console.log('unsubscribe to topic:', topic);
    this.client.unsubscribe(topic, {});
  }

  onConnectionLost() {
    this.client.onConnectionLost = (responseObject: Object) => {
      this.mqttConnectionStateSubject.next({ state: 'connection_lost' });
      console.log('Connection lost : ' + JSON.stringify(responseObject));

      this.onError.next('Connection lost!');
      // const snackData: SnackData = {
      //   type: 'error',
      //   message: 'Connection is lost!'
      // };
      // this.snackService.snackData.next(snackData);
    };
  }

  createValidator(str: string): string {
    if (this.useEncryption) {
      var md = forge.md.sha1.create();
      if (str) {
        md.update(str, 'utf8');
      }
      else {
        md.update(this.clientId, 'utf8');
      }
      var pss = forge.pss.create({
        md: forge.md.sha1.create(),
        mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
        saltLength: 20
        // optionally pass 'prng' with a custom PRNG implementation
        // optionalls pass 'salt' with a forge.util.ByteBuffer w/custom salt
      });
      var signature = btoa(this.keyPair.privateKey.sign(md, pss));
      return signature;
    }
    return '';
  }

  verifyValidator(publicKey: any, signature: string, str: string): boolean {
    if (this.useEncryption) {
      // convert a Forge public key to PEM-format
      //var pem = pki.publicKeyToPem(publicKey);

      // convert a PEM-formatted public key to a Forge public key
      //var publicKey = pki.publicKeyFromPem(pem);
      //var publicKeyResolved = forge.pki.publicKeyFromPem(publicKey);
      var pss = forge.pss.create({
        md: forge.md.sha1.create(),
        mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
        saltLength: 20
        // optionally pass 'prng' with a custom PRNG implementation
      });
      var md = forge.md.sha1.create();
      md.update(str, 'utf8');
      return publicKey.verify(md.digest().getBytes(), atob(signature), pss);
    }
    return false;
  }
}
