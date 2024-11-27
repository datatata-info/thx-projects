import { Injectable, inject, EnvironmentProviders, Inject, ApplicationRef } from '@angular/core';
// services
import { SocketService } from './socket/socket.service';
import { WebrtcService } from './webrtc/webrtc.service';
import { CryptoService } from './crypto/crypto.service';
// interfaces
import {
  SocketServerConfig,
  AppOptions,
  Room,
  SocketMessage,
  PeerMessage,
  PeerConnectionObject,
  ThxMessage,
  User
} from './interfaces';
// rxjs
import { BehaviorSubject, Subscription, Subject } from 'rxjs';


// socket config
let SOCKET_CONFIG: SocketServerConfig;

export function provideThxProtocol(config: SocketServerConfig): EnvironmentProviders {
  // console.log('provideThxSocket', config);
  SOCKET_CONFIG = config;
  const providers: any = [];
  return providers;
}


@Injectable({
  providedIn: 'root'
})
export class ThxProtocolService {

  public user!: User;
  public socketConnected: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public onSocketRoom: Subject<Room> = new Subject();
  public onCert: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // public webrtcEstablished: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  public joinedRooms: Room[] = [];
  public availableRooms: Room[] = [];
  public roomsMessages: any = {};

  public appOptions!: AppOptions;

  protected socketService!: SocketService;
  protected webrtcService!: WebrtcService;
  protected cryptoService!: CryptoService;
  protected applicationRef!: ApplicationRef;

  // private socketConnectionSub: Subscription = new Subscription();
  private onSocketRoomSub: Subscription = new Subscription();
  private onSocketMessageSub: Subscription = new Subscription();
  private onSocketRoomJoinedSub: Subscription = new Subscription();
  private onRtcOfferSub: Subscription = new Subscription();
  private onRtcAnswerSub: Subscription = new Subscription();
  private onIceCandidateSub: Subscription = new Subscription();
  private onRtcConnectionEventSub: Subscription = new Subscription();
  private onPeerDataChannelSub: Subscription = new Subscription();
  private onPeerMessageSub: Subscription = new Subscription();
  private keyPairSub: Subscription = new Subscription();
  
  // private webrtcEstablished: boolean = false;

  constructor(
    @Inject('AppOptions') public options: AppOptions
  ) {
    // set app options
    this.appOptions = options;
    // setup socket service
    this.socketService = inject(SocketService);
    // immediatelly connect to socket server
    this.connectSocket();
    // setup webrtc service
    this.webrtcService = inject(WebrtcService);
    // setup crypto service
    this.cryptoService = inject(CryptoService);
    // change detection for peer message (MessageEvent)
    this.applicationRef = inject(ApplicationRef);
    // keypair generation
    this.keyPairSub = this.cryptoService.setKeyPair().subscribe({
      next: (done: boolean) => {
        this.onCert.next(done);
      }
    })
    // new socket room created
    this.onSocketRoomSub = this.onSocketRoom.subscribe({
      next: (room: Room) => {
        this.availableRooms.push(room)
      }
    });
    // socket room joined by someone -> create rtc conn and send offer
    this.onSocketRoomJoinedSub = this.socketService.onSocketRoomJoined.subscribe({
      next: async (socketMessage: SocketMessage) => {
        console.log('SOCKET ROOM JOINED', socketMessage);
        const roomId = socketMessage.body.room.id;
        const socketId = socketMessage.body.socketId;
        // establish webrtc connection
        const offer = await this.webrtcService.createOffer(roomId, socketId);
        console.log('WEBRTC OFFER', offer);
        const sm: SocketMessage = {
          cmd: 'rtc_offer',
          roomId: roomId,
          body: {
            offer: offer,
            socketId: socketId
          }
        }
        // if (!this.rtcConnections[roomId]) this.rtcConnections[roomId] = {};
        // if (!this.rtcConnections[roomId][socketId]) this.rtcConnections[roomId][socketId] = null;
        // this.rtcConnections[roomId][socketId] = con.pc;
        // console.log('rtcConnections', this.rtcConnections);

        this.socketService.sendSocketMessage(sm);
      }
    });

    this.onRtcOfferSub = this.socketService.onRtcOffer.subscribe({
      next: async (socketMessage: SocketMessage) => {
        // console.log('ON RTC OFFER', socketMessage);
        const roomId = socketMessage.roomId;
        const socketId = socketMessage.body.socketId;
        const answer = await this.webrtcService.createAnswer(roomId, socketId, socketMessage.body.offer);
        const sm: SocketMessage = {
          cmd: 'rtc_answer',
          roomId: roomId,
          body: {
            answer: answer,
            socketId: socketId
          }
        }
        this.socketService.sendSocketMessage(sm);
      }
    });
    this.onRtcAnswerSub = this.socketService.onRtcAnswer.subscribe({
      next: (socketMessage: SocketMessage) => {
        /* TODO */
        /* on offere, save rtc con { roomId: [{socketId: connection}]} */
        /* set remote description to connection */
        const roomId = socketMessage.roomId;
        const socketId = socketMessage.body.socketId;
        this.webrtcService.setRemoteDescription(roomId, socketId, socketMessage.body.answer);
      }
    });
    this.onIceCandidateSub = this.socketService.onIceCandidate.subscribe({
      next: (socketMessage: SocketMessage) => {
        const roomId = socketMessage.roomId;
        const socketId = socketMessage.body.socketId;
        console.log
        this.webrtcService.addIceCandidate(roomId, socketId, socketMessage.body.ice);        
      }
    });
    this.onRtcConnectionEventSub = this.webrtcService.onConnectionEvent.subscribe({
      next: (event: any) => {
        if (event.type === 'onicecandidate') {
          this.socketService.sendSocketMessage(event.response);
        }
      }
    });
    this.onPeerDataChannelSub = this.webrtcService.onPeerDataChannel.subscribe({
      next: (pco: PeerConnectionObject) => {
        /* HANDSHAKE PUBLIC KEYS WHEN DATA CHANNEL FIRE 'ondatachannel' */
        pco.dataChannel?.send(JSON.stringify({publicKey: this.cryptoService.getPublicKeyPem(), userId: this.user.id}));
      }
    })
    this.onPeerMessageSub = this.webrtcService.onPeerMessage.subscribe({
      next: (peerMessage: PeerMessage) => {
        // console.warn('onPeerMessage', peerMessage);
        const m = peerMessage.body;
        if (m.publicKey) {
          // console.warn('SET PUBLIC KEY TO PCO', m.publicKey);
          this.webrtcService.addPublicKeyToPCO(peerMessage.roomId, peerMessage.socketId, m.publicKey);
        }
        if (m.userId) {
          this.webrtcService.addUserIdToPCO(peerMessage.roomId, peerMessage.socketId, m.userId);
        }
        if (m.message) {
          if (!this.roomsMessages[peerMessage.roomId]) this.roomsMessages[peerMessage.roomId] = [];
          this.roomsMessages[peerMessage.roomId].push(m.message);
          // to show message immediately
          this.applicationRef.tick();
        } 
        
      }
    });
    // recieving messages over socket (not ideal), only if webrtc not established
    this.onSocketMessageSub = this.socketService.onSocketMessage.subscribe({
      next: (socketMessage: SocketMessage) => {
        if (!this.roomsMessages[socketMessage.roomId]) this.roomsMessages[socketMessage.roomId] = [];
        this.roomsMessages[socketMessage.roomId].push(socketMessage.body);
      }
    });
  }

  private connectSocket(): void {
    // console.log('SOCKET_CONFIG', SOCKET_CONFIG);
    // console.log('appOptions', this.appOptions);
    if (SOCKET_CONFIG && this.appOptions) {
      this.socketService.CONFIG = SOCKET_CONFIG;
      this.socketService.APP_OPTIONS = this.appOptions;
    } else {
      throw Error('Check Socket Server Configuration and Application options!');
    }
    // subscribe socket connection 
    this.socketConnected = this.socketService.connected;
    // subscribe socket room
    this.onSocketRoom = this.socketService.onSocketRoom;
    // connect to socket
    this.socketService.connect();

    
  }

  /* 
    1. Connect to Socket (app)
    2. Establish peer connection between users
    3. Handshake public keys over peer connection
    4. Sending / recieving encrypted messages
  */

  createRoom(room: Room/* , userId: string */): void {
    this.joinedRooms.push(room);
    this.socketService.joinRoom(room);
  }

  joinRoom(room: Room/* , userId: string */): void {
    this.joinedRooms.push(room);
    this.socketService.joinRoom(room);
  }

  sendRoomMessage(roomId: string, message: ThxMessage): void {
    if (!this.isPeerEstablishedForRoom(roomId)) {
      /* send socket message */
      const socketMessage: SocketMessage = {
        cmd: 'message',
        roomId: roomId,
        body: message
      }
      this.socketService.sendSocketMessage(socketMessage);
    } else {
      /* add my message to */
      if (!this.roomsMessages[roomId]) this.roomsMessages[roomId] = [];
      this.roomsMessages[roomId].push(message);
      /* send webrtc message */
      this.webrtcService.broadcastMessageToRoom(roomId, message);
    }
  }
  sendUserMessage(roomId: string, userId: string, message: ThxMessage): void {
    if (!this.isPeerEstablishedForUserInRoom(roomId, userId)) {
      // TODO: fallback to send socket message
    } else {
      /* add my message to */
      if (!this.roomsMessages[roomId]) this.roomsMessages[roomId] = [];
      this.roomsMessages[roomId].push(message);
      /* send peer message to user */
      this.webrtcService.sendMessageToUserInRoom(roomId, userId, message);
    }
  }
  /* TODO: check for each user while send message */
  private isPeerEstablishedForRoom(roomId: string): boolean {
    // return false;
    return this.webrtcService.isPeerEstablishedForRoom(roomId);
  }

  private isPeerEstablishedForUserInRoom(roomId: string, userId: string): boolean {
    return this.webrtcService.isPeerEstablishedForUser(roomId, userId);
  }

  

  destroy(): void {
    // this.socketConnectionSub.unsubscribe();
    this.onSocketRoomSub.unsubscribe();
    this.onSocketMessageSub.unsubscribe();
    this.onSocketRoomJoinedSub.unsubscribe();
    this.onRtcOfferSub.unsubscribe();
    this.onRtcAnswerSub.unsubscribe();
    this.onIceCandidateSub.unsubscribe();
    this.onRtcConnectionEventSub.unsubscribe();
    this.onPeerMessageSub.unsubscribe();
    this.keyPairSub.unsubscribe();
    this.onPeerDataChannelSub.unsubscribe();
    // disconnect socket
    this.socketService.disconnect();
    // todo disconnect rtc peers (data channels + pcs)
    this.webrtcService.disconnect();
    // this.webrtcService.disconnect(); // <- TODO
  }


}
