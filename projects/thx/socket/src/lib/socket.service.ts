import { Injectable, inject, EnvironmentProviders, isDevMode } from '@angular/core';
// socket
import { io, Socket } from 'socket.io-client';
// uuid
import { v4 as uuidv4 } from 'uuid';
// rxjs
import { Subject, BehaviorSubject, Subscription, Observable } from 'rxjs';
// crypto service
import { CryptoService } from './crypto.service';
// push service
import { PushService } from './push.service';
// interfaces
import {
  SocketServerConfig,
  AppOptions,
  Room,
  User,
  RoomMessage,
  RoomConfig,
  SocketCallback,
  Message,
  MessageContent
} from './interfaces';

let HOST: string, PORT: number, USE_ENCRYPTION: boolean, PATH: string;


export function provideThxSocket(config: SocketServerConfig): EnvironmentProviders {
  // console.log('provideThxSocket', config);
  HOST = config.host;
  PORT = config.port;
  PATH = config.path ? config.path : '';
  USE_ENCRYPTION = config.useEncryption;
  const providers: any = [];
  return providers;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socketHost: string = '0.0.0.0';
  private socketPath: string = '';
  private socketPort: number = 3001;
  private socket!: Socket;

  private useEncryption: boolean = true;
  protected cryptoService!: CryptoService;
  private userPublicKeys: any = {};  

  // app options
  public appOptions!: AppOptions;
  // public appName: string = '';
  // public appTitle: string = '';
  // public appIcon: string = '';


  public user!: User;
  public connected: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // private _connected: boolean = false;

  public onCertPrepared: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public onNewRoom: Subject<Room> = new Subject();
  public onAvailableRooms: Subject<Room[]> = new Subject();
  public onRoomClosed: Subject<string> = new Subject();
  public onUserJoinedRoom: Subject<User> = new Subject();
  public onMessage: Subject<RoomMessage> = new Subject();
  public onPublicRoomClosed: Subject<string> = new Subject();
  public onPublicRoomUpdated: Subject<Room> = new Subject();
  public onError: Subject<ErrorEvent | Error> = new Subject();
  public onUserSet: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public onWrongOptions: Subject<any> = new Subject();
  
  // push service
  private pushService!: PushService;
  public onPush!: Observable<any>;
  public onPushClick!: Observable<any>;

  constructor() {
    // inject services this way to not have a necessity to inject them inside extensions
    this.cryptoService = inject(CryptoService);
    this.pushService = inject(PushService);
    this.onPush = this.pushService.onPush;
    this.onPushClick = this.pushService.onPushClick;
    // this.swPush.notificationClicks
    if (HOST) this.socketHost = HOST;
    if (PORT) this.socketPort = PORT;
    if (PATH) this.socketPath = PATH;
    if (USE_ENCRYPTION === false) this.useEncryption = false;
    if (this.useEncryption) {
      // check local storage
      // console.log('appName', this.appName);
      const keyPairSub: Subscription = this.cryptoService.setKeyPair().subscribe({
        next: (done: boolean) => {
          if (done) {
            this.onCertPrepared.next(done);
            // this.onCertPrepared.complete();
            // keyPairSub.unsubscribe();
          }
        },
        error: (e: any) => console.error(e)
      });
    }
  }
  

  connect(): void {
    console.log('appOptions', this.appOptions);
    let protocol = this.useEncryption ? 'https' : 'http';
    const url = `${protocol}://${this.socketHost}:${this.socketPort}`;
    this.socket = io(url, {
      path: this.socketPath ? this.socketPath + '/socket.io' : '/socket.io',
      query: {
        'options': JSON.stringify(this.appOptions)
        // 'appName': this.appName,
        // 'appTitle': this.appTitle
      }
    });
    
    // console.log('socket', this.socket);
    // console.log('socket url', url);
    // this.socket = manager.socket('/');
    this.setupSocketListeners();
  }

  login(user: User): void {
    this.user = user;
    this.onUserSet.next(this.user);
    console.log('login user', user);    
    this.socket.emit('login', this.user);
  }

  logout(): void {
    console.warn('add logout to server...');
    this.socket.emit('logout', this.user);
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
                this.sendHandshake(room.id);
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

  userIsActive(): void {
    this.socket.emit('user_active', this.user.id);
  }

  userIsNotActive(): void {
    this.socket.emit('user_not_active', this.user.id);
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
      appName: this.appOptions.appName,
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

  sendMessage(messageSubject: string | any, roomId: string, toUserId?: string, expiration: number = 60 * 1000): Message {
    const copyMessageSubject = JSON.parse(JSON.stringify(messageSubject)); // deep copy
    // console.log(`send message to roomId ${roomId}`, copyMessageSubject);
    const message: Message = {
      id: uuidv4(),
      user: this.user,
      time: new Date(),
      expiry: expiration,
      content: {
        subject: copyMessageSubject
      }
    }
    // message.value = 
    if (this.useEncryption) {
      const encodedMessageSubject = typeof copyMessageSubject === 'string' ? encodeURIComponent(copyMessageSubject) : encodeURIComponent(JSON.stringify(copyMessageSubject));
      // console.log('encodedMessageSubject', encodedMessageSubject);
      const userSpecificMessageSubjects: any = {};
      for (const userId in this.userPublicKeys) {
        // const userPublicKey = this.userPublicKeys[userId];
        const encryptedSharedSecret = this.cryptoService.encryptSharedSecretWithCustomKey(
          this.cryptoService.sharedSecret,
          this.userPublicKeys[userId]
        );
        // console.log('sharedSecret', encryptedSharedSecret);
        userSpecificMessageSubjects[userId] = {
          subject: btoa(this.cryptoService.encryptMessageWithAESKey(encodedMessageSubject, this.cryptoService.sharedSecret)),
          sharedSecret: encryptedSharedSecret
        };
        // console.log('encrypted message', MessageContentObject[userId]);
      }
      const encryptedMessage = JSON.parse(JSON.stringify(message)); // deep copy
      encryptedMessage.content = JSON.stringify(userSpecificMessageSubjects);
      // console.log('send_message', encryptedMessage.value);
      if (toUserId) {
        this.socket.emit('send_private_message', roomId, toUserId, encryptedMessage);
      } else {
        // console.log('send encrypted message', encryptedMessage);
        this.socket.emit('send_message', roomId, encryptedMessage);
      }
      
    } else {
      if (toUserId) {
        this.socket.emit('send_private_message', roomId, toUserId, message);
      } else {
        this.socket.emit('send_message', roomId, message);
      }
    }
    return message;
  }

  recieveMessage(message: Message, roomId: string): void {
    // console.log('on message', message);
      if (this.useEncryption) {
         // decrypt message
        const messageObj: any = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;
        // console.log('messageObj', messageObj);
        // console.log('messageObj', messageObj);
        if (messageObj[this.user.id]) {
          const m: MessageContent = messageObj[this.user.id];
          const encryptedMessageContent: string = atob(m.subject);
          // const MessageContent = this.keyPair.privateKey.decrypt(value, 'RSA-OAEP');
          if (m.sharedSecret) {
            const decryptedMessageContent = this.cryptoService.decryptMessageWithAESKey(
              encryptedMessageContent,
              this.cryptoService.decryptSharedSecret(m.sharedSecret)
            );
            // console.log('decrypted message', MessageContent);
            message.content = {
              subject: decodeURIComponent(decryptedMessageContent)
            }
            try {
              message.content.subject = JSON.parse(message.content.subject);
            } catch(e) {
              console.log('message not json');
            }
            // console.log('onMessage.next', {message: message, roomId: roomId});
            this.onMessage.next({message: message, roomId: roomId});
          } else {
            console.error('message sharedSecret missing :/');
          }          
        }
      } else {
        this.onMessage.next({message: message, roomId: roomId});
      }
  }

  sendHandshake(roomId: string): void {
    this.socket.emit('handshake', roomId, this.user.id, this.cryptoService.getPublicKeyPem());
  }

  // push
  hasPush(): Subject<boolean> {
    this.pushService.userHasPush(this.user, this.socket);
    return this.pushService.hasPush;
  }
  // request push
  requestPushNotifications(): void {
    this.pushService.requestPushNotifications(this.user, this.socket);
  }

  unsubscribePushNotifications(): void {
    const unsubSub: Subscription = this.pushService.unsubscribePushNotifications(this.user, this.socket).subscribe({
      next: (message: string) => {
        console.log('unsubscribePushNotifications', message);
      },
      error: (e: any) => {
        console.error('unsubscribePushNotifications', e);
        this.onError.next(e);
      },
      complete: () => unsubSub.unsubscribe()
    });
  }

  isSwUpdate(): Subject<any> {
    return this.pushService.isSwUpdate();
  }
  

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      // console.log('socket connected to server', this.socket.connected);
      this.connected.next(true);
      // this._connected = true;
      this.getAvailableRooms();
    });

    this.socket.on('disconnect', () => {
      console.log('socket disconnected');
      this.connected.next(false);
      // this._connected = false; 
    });

    this.socket.on('wrong_options', () => {
      this.onWrongOptions.next(true);
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

    // user want to join (share publicKey) and want to get encryptedSharedSecret
    this.socket.on('handshake', (roomId: string, senderId: string, publicKeyPem: any) => {
      // this.sendHandshake(roomId);
      this.userPublicKeys[senderId] = publicKeyPem;
      // console.log('recieved handshake (publicKey) from', senderId);
      this.socket.emit(
        'accept_handshake',
        roomId,
        senderId, 
        this.user.id, 
        this.cryptoService.getPublicKeyPem()
      );
      // this.socket.emit('handshake', roomId, this.user.id, this.cryptoService.getPublicKeyPem());
    });

    this.socket.on('accept_handshake', (roomId: string, fromUserId: string, publicKeyPem: string) => {
      this.userPublicKeys[fromUserId] = publicKeyPem;
      this.sendMessage('Joined chat.', roomId, fromUserId, 5 * 1000);
    });

    // message was recieved
    this.socket.on('message', (message: Message, roomId: string) => {
      // console.log('on message', message);
      this.recieveMessage(message, roomId);
    });
  }
  // http://joinme-muni.cz/data/articles/2021/06/04/60ba1ed8a3239/thx-javurek-jerabek-revize-final-format2.pdf
}
