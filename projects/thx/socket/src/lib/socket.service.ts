import { Injectable, Inject, Provider, EnvironmentProviders } from '@angular/core';
// socket
import { io, Socket } from 'socket.io-client';
// forge
import * as forge from 'node-forge';
// uuid
import { v4 as uuidv4 } from 'uuid';
// rxjs
import { Subject, BehaviorSubject } from 'rxjs';

let HOST: string, PORT: number, USE_ENCRYPTION: boolean;

export interface SocketServerConfig {
  host: string,
  port: number,
  useEncryption: boolean
}

export function provideThxSocket(config: SocketServerConfig): EnvironmentProviders {
  console.log('provideThxSocket', config);
  HOST = config.host;
  PORT = config.port;
  USE_ENCRYPTION = config.useEncryption;
  const providers: any = [];
  return providers;
}

export interface Room {
  id: string,
  config: RoomConfig,
  appName: string,
  admin: string,
}

export interface RoomConfig {
  roomName: string,
  password: string,
  timer: number,
  public: boolean
}

export class User {
  id: string = uuidv4();
  nickname!: string;
  color?: string;
  constructor(nickname: string, color?: string) {
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
  private socketPort: number = 3001;
  private socket!: Socket;
  private userKeys: any = {};

  public appName: string = '';
  public user!: User;
  public connected: boolean = false;

  public onCertGenerated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public onNewRoom: Subject<Room> = new Subject();
  public onAvailableRooms: Subject<Room[]> = new Subject();
  public onRoomClosed: Subject<string> = new Subject();
  public onUserJoinedRoom: Subject<User> = new Subject();
  public onMessage: Subject<Message> = new Subject();

  constructor() {
    if (HOST) this.socketHost = HOST;
    if (PORT) this.socketPort = PORT;
    if (USE_ENCRYPTION === false) this.useEncryption = false;
    if (this.useEncryption) {
      // check local storage
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
      console.log('keyPair generated');
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

  connect(): void {
    let protocol = this.useEncryption ? 'https' : 'http';
    this.socket = io(`${protocol}://${this.socketHost}:${this.socketPort}`, {
      query: {
        "appName": this.appName
      }
    });
    this.listenSocket();
  }

  login(user: User): void {
    // if (user || this.user) {
      this.user = user;
      this.socket.emit('login', this.user);
    // }
  }

  getAvailableRooms(): void {
    this.socket.emit('get_available_rooms');
  }

  // disconnect(): void {
  //   console.log('disconnecting user', this.user);
  //   this.socket.emit('close', this.user.id);
  // }

  createRoom(roomConfig: RoomConfig): Subject<any> {
    const subject: Subject<any> = new Subject();
    const room: Room = {
      id: uuidv4(),
      config: roomConfig,
      appName: this.appName,
      admin: this.user.id,
    }
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
    this.socket.emit('join_room', roomId, this.user, (result: SocketCallback) => {
      if (result.success && result.data) {
        subject.next(result.data);
      } else {
        subject.next(null);
      }
    });
    return subject;
  }

  closeRoom(roomId: string): Subject<any> {
    const subject: Subject<any> = new Subject();
    this.socket.emit('close_room', roomId, this.user.id, (result: SocketCallback) => {
      if (result.success && result.data) {
        this.sendMessage(`🌘 Room is closing ...`, roomId);
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

  sendMessage(value: string, roomId: string): Message {
    const message = {
      id: uuidv4(),
      user: this.user,
      time: new Date(),
      expiry: 60 * 1000,
      value: value
    }
    // message.value = 
    if (this.useEncryption) {
      const messageValue = encodeURIComponent(message.value);
      // console.log('btoa value', messageValue);
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
      console.log('socket connected to server', this.socket.connected);
      this.connected = true;
      this.getAvailableRooms();
    });

    this.socket.on('disconnect', () => {
      console.log('socket disconnected');
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
      console.log('user_joined_room', user.id);
    });

    this.socket.on('user_leaved_room', (userId: string) => {
      console.warn(`----- user ${userId} leaved room`);
    })

    this.socket.on('room_closed', (roomId: string) => {
      this.onRoomClosed.next(roomId);
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

    this.socket.on('message', (message: Message) => {
      if (this.useEncryption) {
         // decrypt message
        const messageObj: any = JSON.parse(message.value);
        // console.log('messageObj', messageObj);
        if (messageObj[this.user.id]) {
          const value = atob(messageObj[this.user.id]);
          const messageValue = this.keyPair.privateKey.decrypt(value, 'RSA-OAEP');
          // console.log('decrypted message', messageValue);
          message.value = decodeURIComponent(messageValue);
          this.onMessage.next(message);
        }
      } else {
        this.onMessage.next(message);
      } 
     

    });
  }

  // private createValidator(str: string): string {
  //   if (this.useEncryption) {
  //     const md: any = forge.md.sha1.create();
  //     if (str) {
  //       md.update(str, 'utf8');
  //     }
  //     var pss = forge.pss.create({
  //       md: forge.md.sha1.create(),
  //       mgf: forge.mgf.mgf1.create(md.sha1.create()),
  //       saltLength: 20
  //       // optionally pass 'prng' with a custom PRNG implementation
  //       // optionalls pass 'salt' with a forge.util.ByteBuffer w/custom salt
  //     });
  //     var signature = btoa(this.keyPair.privateKey.sign(md, pss));
  //     return signature;
  //   }
  //   return '';
  // }
}
