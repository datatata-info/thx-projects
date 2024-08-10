import { Injectable, inject, Provider, EnvironmentProviders, isDevMode } from '@angular/core';
// swPush
import { SwPush } from '@angular/service-worker';
// socket
import { io, Socket, Manager } from 'socket.io-client';
// forge
import * as forge from 'node-forge';
// uuid
import { v4 as uuidv4 } from 'uuid';
// rxjs
import { Subject, BehaviorSubject, Subscription, Observable } from 'rxjs';

let HOST: string, PORT: number, USE_ENCRYPTION: boolean, PATH: string;

export interface SocketServerConfig {
  host: string,
  path?: string,
  port: number,
  useEncryption: boolean
}

export function provideThxSocket(config: SocketServerConfig): EnvironmentProviders {
  // console.log('provideThxSocket', config);
  HOST = config.host;
  PORT = config.port;
  PATH = config.path ? config.path : '';
  USE_ENCRYPTION = config.useEncryption;
  const providers: any = [];
  return providers;
}

export interface Room {
  id: string,
  config: RoomConfig,
  appName: string,
  admin: string,
  size: number,
}

export interface RoomConfig {
  roomName: string,
  password: string,
  timer: number,
  public: boolean
}

export interface User {
  id: string,
  nickname: string,
  color?: string
}

export class User {
  id!: string;
  nickname!: string;
  color?: string;
  constructor(nickname: string, color?: string) {
    this.id = uuidv4();
    this.nickname = nickname;
    this.color = color ? color : ''
  }
}

export interface Message {
  id: string,
  user: User,
  time: Date,
  value: string,
  expiry: number
}

export class Message {
  id!: string;
  user!: User;
  time!: Date;
  value!: string;
  expiry!: number;
  constructor(user: User, value: string, expiry?: number) {
    this.id = uuidv4();
    this.time = new Date();
    this.expiry = expiry ? expiry : 60 * 1000;
    this.user = user;
    this.value = value;
  }
}

export interface RoomMessage {
  roomId: string,
  message: Message
}

interface SocketCallback {
  success: boolean,
  message: string,
  data?: any
}

interface LocalStorageCert {
  created: number,
  expiresAfter: number,
  publicPem: string,
  privatePem: string
}



@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private useEncryption: boolean = true;
  private keyPair!: forge.pki.rsa.KeyPair;
  private socketHost: string = '0.0.0.0';
  private socketPath: string = '';
  private socketPort: number = 3001;
  private socket!: Socket;
  private userKeys: any = {};

  public appName: string = '';
  public user!: User;
  public connected: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _connected: boolean = false;

  public onCertGenerated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public onNewRoom: Subject<Room> = new Subject();
  public onAvailableRooms: Subject<Room[]> = new Subject();
  public onRoomClosed: Subject<string> = new Subject();
  public onUserJoinedRoom: Subject<User> = new Subject();
  public onMessage: Subject<RoomMessage> = new Subject();
  public onPublicRoomClosed: Subject<string> = new Subject();
  public onPublicRoomUpdated: Subject<Room> = new Subject();
  public onError: Subject<ErrorEvent | Error> = new Subject();
  // push notifications
  public onPush: Observable<any> = new Observable();
  public onPushClick: Observable<any> = new Observable();

  readonly VAPID_PUBLIC_KEY: string = isDevMode() ? 'BPL2xam-UTRIqHD05cG-ZZHJFSrfVaRSz2FDGFXRhGyskNBN6RnxsrzJ09Ld1v0I66dVy57fac3IJRaD6Yqx8PM' : 'BPbN6dLz-JGZunRJymbIhU5PFWeXq6hGSWD6K4e1-pgZEjHsH_llP-OXq6sXVz8eIL0L8pA6cQC10Q5M7hKayus';
  protected swPush!: SwPush;
  constructor() {
    this.swPush = inject(SwPush);
    this.onPush = this.swPush.messages;
    this.onPushClick = this.swPush.notificationClicks;

    this.swPush.notificationClicks
    if (HOST) this.socketHost = HOST;
    if (PORT) this.socketPort = PORT;
    if (PATH) this.socketPath = PATH;
    if (USE_ENCRYPTION === false) this.useEncryption = false;
    if (this.useEncryption) {
      // check local storage
      // console.log('appName', this.appName);
      const savedCert = localStorage.getItem('thx-cert');
      if (savedCert) {
        const cert: LocalStorageCert = JSON.parse(savedCert);
        const now = Date.now();
        if (now >= cert.created + cert.expiresAfter) { // cert expired, generate new
          this.generateKeyPair();
        } else {
          this.keyPair = {
            publicKey: forge.pki.publicKeyFromPem(cert.publicPem),
            privateKey: forge.pki.privateKeyFromPem(cert.privatePem)
          }
          setTimeout(() => {
            this.onCertGenerated.next(true);
            // this.onCertGenerated.complete();
          }, 200);
          
        }

      } else { // generate new and save to localStorage
        this.generateKeyPair();
      }
    }
    // this.listenSocket();
  }

  private generateKeyPair(): void {
    forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 }, (error: any, keyPair: forge.pki.rsa.KeyPair) => {
      if (error) console.error(error);
      // console.log('keyPair generated');
      this.keyPair = keyPair;
      const localStorageCert: LocalStorageCert = {
        created: Date.now(),
        expiresAfter: 24 * 60 * 60 * 1000, // one day
        publicPem: forge.pki.publicKeyToPem(this.keyPair.publicKey),
        privatePem: forge.pki.privateKeyToPem(this.keyPair.privateKey)
      }
      this.onCertGenerated.next(true);
      // this.onCertGenerated.complete();
      localStorage.setItem('thx-cert', JSON.stringify(localStorageCert));
    });
  }

  

  private subscribeNotifications(): Subject<PushSubscription | null> {
    const subject: Subject<PushSubscription | null> = new Subject();
    console.log('........subscribeNotifications........');
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then((sub: PushSubscription) => {
        subject.next(sub);
        subject.complete();
        // console.log('PushSubscription', sub.toJSON());
        /* 
        const keys: SubscriptionObjectKeys = {
          auth: sub.toJSON().keys.auth,
          p256dh: sub.toJSON().keys.p256dh
        };
        const subscriptionObject: SubscriptionObject = {
          endpoint: sub.endpoint,
          expirationTime: 0,
          keys: keys
        };
        */

      })
      .catch((e: any) => {
        subject.next(null);
        subject.complete();
        console.error('PushSubscribption Error', e);
      });
    } else {
      console.log('notifications not enabled || isDevMode');
      subject.next(null);
      subject.complete();
    }
    return subject;
  }

  connect(): void {
    let protocol = this.useEncryption ? 'https' : 'http';
    const url = `${protocol}://${this.socketHost}:${this.socketPort}`;
    this.socket = io(url, {
      path: this.socketPath ? this.socketPath + '/socket.io' : '/socket.io',
      query: {
        "appName": this.appName
      }
    });
    
    // console.log('socket', this.socket);
    // console.log('socket url', url);
    // this.socket = manager.socket('/');
    this.listenSocket();
  }

  login(user: User): void {
    this.user = user;
    console.log('login user', user);    
    this.socket.emit('login', this.user);
  }

  logout(): void {
    console.warn('add logout to server...');
    this.socket.emit('logout', this.user);
  }

  requestPushNotifications(): void {
    console.warn('subsribeNotifications for user', this.user);
    // create swPush Subscription
    if (!isDevMode()) {
      const pushSub: Subscription = this.subscribeNotifications().subscribe({
        next: (sub: PushSubscription | null) => {
          // if subscribtion, then send with login
          console.log('!!!!! push subsbscribtion', sub);
          if (sub && sub.endpoint) { // no endpoint in Safari
            console.log('request_push', 'TODO on server');
            this.socket.emit('request_push', this.user, sub);
          } 
          pushSub.unsubscribe();
        },
        error: (e: any) => {
          pushSub.unsubscribe();
          console.error('PushSubscribtion Error', e);
        }
      })
    } 
  }

  getAvailableRooms(): void {
    this.socket.emit('get_available_rooms');
  }

  enterRoom(roomId: string, roomName?: string): Subject<Room | null> {
    const subject: Subject<any> = new Subject();
    // const statsRoomId: string = `${this.appName}-${roomId}`;
    // if room exist, join, else create
    const roomExistSub: Subscription = this.roomExist(roomId).subscribe({
      next: (exist: boolean) => {
        if (exist) {
          const joinSub: Subscription = this.joinRoom(roomId).subscribe({
            next: (room: Room | null) => {
              if (room) {
                subject.next(room);
                subject.complete();
                this.requestHandshake(room.id);
              } else {
                console.error('Something bad happend :/');
              }
              joinSub.unsubscribe();
            },
            error: (e: ErrorEvent) => this.onError.next(e)
          })
        } else { 
          if (roomName) { // create new room
            const config: RoomConfig = {
              roomName: roomName, // not necessary user readible
              password: '',
              timer: 0,
              public: false // always private for stats
            }
            const createSub: Subscription = this.createRoom(config, roomId).subscribe({
              next: (room: Room) => {
                subject.next(room);
                subject.complete();
                createSub.unsubscribe();
              }
            })
          } else { // no existing room with roomId
            subject.next(null);
            subject.complete();
          }
        }
        roomExistSub.unsubscribe();
      },
      error: (e: ErrorEvent) => this.onError.next(e)
    })

    return subject;
  }

  // disconnect(): void {
  //   console.log('disconnecting user', this.user);
  //   this.socket.emit('close', this.user.id);
  // }

  createRoom(roomConfig: RoomConfig, roomId?: string): Subject<Room> {
    console.log('createRoom socket.service');
    const subject: Subject<any> = new Subject();
    const room: Room = {
      id: roomId ? roomId : uuidv4(),
      config: roomConfig,
      appName: this.appName,
      admin: this.user.id,
      size: 1
    }
    // emit create_room
    this.socket.emit('create_room', room, (result: SocketCallback) => {
      if (result.success && result.data) {
        subject.next(result.data);
        subject.complete();
      }
    });    
    return subject;
  }

  joinRoom(roomId: string): Subject<Room | null> {
    const subject: Subject<any> = new Subject();
    // emit join_room
    this.socket.emit('join_room', roomId, this.user, (result: SocketCallback) => {
      if (result.success && result.data) {
        subject.next(result.data);
      } else {
        this.onError.next(new Error(result.message))
      }
    });
    return subject;
  }

  closeRoom(roomId: string): Subject<any> {
    const subject: Subject<any> = new Subject();
    this.socket.emit('close_room', roomId, this.user.id, (result: SocketCallback) => {
      if (result.success && result.data) {
        subject.next(result);
      } else {
        // emit error (cannot close room, im not an admin of room)
        subject.next(result.message);
      }
    });
    return subject;
  }

  leaveRoom(roomId: string): void {
    this.socket.emit('leave_room', roomId, this.user.id);
  }

  roomExist(roomId: string): Subject<boolean> {
    const subject: Subject<boolean> = new Subject();
    this.socket.emit('room_exist', roomId, (result: SocketCallback) => {
      subject.next(result.success);
    });
    return subject;
  }

  sendMessage(value: string | any, roomId: string): Message {
    const v = JSON.parse(JSON.stringify(value)); // deep copy
    console.log(`send message to roomId ${roomId}`, v);
    const message = {
      id: uuidv4(),
      user: this.user,
      time: new Date(),
      expiry: 60 * 1000,
      value: v
    }
    // message.value = 
    if (this.useEncryption) {
      const messageValue = typeof value === 'string' ? encodeURIComponent(message.value) : encodeURIComponent(JSON.stringify(message.value));
      console.log('message value', messageValue);
      const messageValueObject: any = {};
      for (const userId in this.userKeys) {
        const userPublicKey = this.userKeys[userId];
        messageValueObject[userId] = btoa(userPublicKey.encrypt(messageValue, 'RSA-OAEP'));
        // console.log('encrypted message', messageValueObject[userId]);
      }
      const encryptedMessage = JSON.parse(JSON.stringify(message)); // deep copy
      encryptedMessage.value = JSON.stringify(messageValueObject);
      // console.log('send_message', encryptedMessage.value);
      this.socket.emit('send_message', roomId, encryptedMessage);
    } else {
      this.socket.emit('send_message', roomId, message);
    }
    return message;
  }

  requestHandshake(roomId: string): void {
    this.socket.emit('request_handshake', roomId, this.user.id, forge.pki.publicKeyToPem(this.keyPair.publicKey));
  }

  

  private listenSocket(): void {
    this.socket.on('connect', () => {
      // console.log('socket connected to server', this.socket.connected);
      this.connected.next(true);
      this._connected = true;
      this.getAvailableRooms();
    });

    this.socket.on('disconnect', () => {
      console.log('socket disconnected');
      this.connected.next(false);
      this._connected = false; 
    });

    this.socket.on('reconnect', () => {
      console.log('socket reconnected');
    });

    this.socket.on('room_created', (room: Room) => {
      this.onNewRoom.next(room);
    });

    this.socket.on('available_rooms', (rooms: Room[]) => {
      if (rooms && rooms.length) {
        this.onAvailableRooms.next(rooms);
        // this.onAvailableRooms.complete();
      }
    });

    this.socket.on('user_joined_room', (user: User, roomId: string) => {
      this.onUserJoinedRoom.next(user);
      // console.log('user_joined_room', user.id);
    });

    this.socket.on('user_left_room', (userId: string) => {
      console.warn(`----- user ${userId} has left the room`);
    })

    this.socket.on('room_closed', (roomId: string) => {
      this.onRoomClosed.next(roomId);
    });

    this.socket.on('public_room_closed', (roomId: string) => {
      // console.log('public_room_closed', roomId);
      this.onPublicRoomClosed.next(roomId);
    });

    this.socket.on('public_room_updated', (room: Room) => {
      this.onPublicRoomUpdated.next(room);
    });

    // user want to join and send send publicKey
    this.socket.on('handshake', (roomId: string, senderId: string, publicKey: any) => {
      // console.log('on recieve handshake from sender', senderId);
      this.userKeys[senderId] = forge.pki.publicKeyFromPem(publicKey);
      // console.log('publicKey', this.userKeys[senderId]);
      // every user answer by sending theris publicKey to sender
      this.socket.emit('response_handshake', roomId, senderId, this.user.id, forge.pki.publicKeyToPem(this.keyPair.publicKey));
    });
    // accepting my handshake request
    this.socket.on('accept_handshake', (roomId: string, userId: string, publicKey: any) => {
      // console.log('accept_handshake by', userId);
      this.userKeys[userId] = forge.pki.publicKeyFromPem(publicKey);
      // send join message
      // TODO: `BUG` this fire as much time as users in room are
      // ... sending every time the handshake with all connected users where established :/
      // possible solve: SEND MESSAGE TO SPECIFIC USER or SEND JOIN ROOM FROM DIFFERENT PLACE
      this.sendMessage('Joined chat.', roomId);
    });

    this.socket.on('message', (message: Message, roomId: string) => {
      if (this.useEncryption) {
         // decrypt message
        const messageObj: any = JSON.parse(message.value);
        // console.log('messageObj', messageObj);
        if (messageObj[this.user.id]) {
          const value = atob(messageObj[this.user.id]);
          const messageValue = this.keyPair.privateKey.decrypt(value, 'RSA-OAEP');
          // console.log('decrypted message', messageValue);
          message.value = decodeURIComponent(messageValue);
          try {
            message.value = JSON.parse(message.value);
          } catch(e) {
            console.log('message not json');
          }
          this.onMessage.next({message: message, roomId: roomId});
        }
      } else {
        this.onMessage.next({message: message, roomId: roomId});
      } 
     

    });
  }

  
  // http://joinme-muni.cz/data/articles/2021/06/04/60ba1ed8a3239/thx-javurek-jerabek-revize-final-format2.pdf
  // Pokud chce Bob poslat zprávu Alici, zašifruje zprávu jejím veřejným klíčem
  // (pouze Alice ji pak dokáže dešifrovat pomocí svého soukromého klíče)
  // a zprávu podepíše svým soukromým klíčem (kdokoliv se znalostí Bobova veřejného klíče dokáže ověřit, že zpráva pochází od Boba).
  // [...] sharedKey
  // V případě symetrické kryptografie je nutné, aby obě komunikující strany, tedy v našem případě Alice a Bob, znaly sdílené tajemství (sdílený klíč). Pomocí tohoto klíče pak šifrují veškerou komunikaci mezi sebou navzájem.

  private createValidator(str: string): string {
    if (this.useEncryption) {
      const md: any = forge.md.sha1.create();
      if (str) {
        md.update(str, 'utf8');
      }
      var pss = forge.pss.create({
        md: forge.md.sha1.create(),
        mgf: forge.mgf.mgf1.create(md.sha1.create()),
        saltLength: 20
        // optionally pass 'prng' with a custom PRNG implementation
        // optionalls pass 'salt' with a forge.util.ByteBuffer w/custom salt
      });
      var signature = btoa(this.keyPair.privateKey.sign(md, pss));
      return signature;
    }
    return '';
  }
}
