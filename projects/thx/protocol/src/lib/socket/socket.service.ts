import { Injectable } from '@angular/core';
// interfaces
import {
  AppOptions,
  SocketServerConfig,
  SocketMessage,
  Room
} from '../interfaces';
// socket
import { io, Socket } from 'socket.io-client';
// rxjs
import { BehaviorSubject, Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class SocketService {

  public CONFIG!: SocketServerConfig;
  public APP_OPTIONS!: AppOptions;
  public connected: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public onSocketError: Subject<any> = new Subject();
  public onSocketRoom: Subject<Room> = new Subject();
  public onSocketRoomJoined: Subject<SocketMessage> = new Subject(); /* TODO: DEFINE TYPE (socketMessage.body => room, socketId) */
  public onSocketMessage: Subject<SocketMessage> = new Subject();
  public onRtcOffer: Subject<SocketMessage> = new Subject();
  public onRtcAnswer: Subject<SocketMessage> = new Subject();
  public onIceCandidate: Subject<SocketMessage> = new Subject();

  private socket!: Socket;
  

  constructor() {}

  connect(): void {
    // console.log('socket.service -> connect');
    if (!this.CONFIG && !this.APP_OPTIONS) {
      this.onSocketError.next(new Error('Configuration of Socket Server or App missing!'));
      throw Error('Configuration of Socket Server or App missing!');
    }
    const protocol = 'http'; // use https in production
    const url = `${protocol}://${this.CONFIG.host}:${this.CONFIG.port}`;
    this.socket = io(url, {
      path: this.CONFIG.path ? this.CONFIG.path + '/socket.io' : '/socket.io',
      query: {
        'options': JSON.stringify(this.APP_OPTIONS)
      }
    });
    // if (this.socket) this.connected.next(true);
    this.setupSocketListeners();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.connected.next(true);
    });
    this.socket.on('disconnect', () => {
      this.connected.next(false);
    });
    this.socket.on('reconnect', () => {
      console.log('socket reconnected');
    });
    this.socket.on('message', (socketMessage: SocketMessage) => {
      this.recieveSocketMessage(socketMessage);
    });
  };

  sendSocketMessage(socketMessage: SocketMessage): void {
    this.socket.emit('message', socketMessage);
  }

  private recieveSocketMessage(socketMessage: SocketMessage): void {
    // console.log('RECIEVED SOCKET MESSAGE', socketMessage);
    switch (socketMessage.cmd) {
      case 'room_created':
        this.onSocketRoom.next(socketMessage.body.room);
        break;
      case 'room_joined':
        /* establish webrtc connection with body.socketId */
        this.onSocketRoomJoined.next(socketMessage);
        break;
      case 'rtc_offer': 
        this.onRtcOffer.next(socketMessage);
        break;
      case 'rtc_answer':
        this.onRtcAnswer.next(socketMessage);
        break;
      case 'ice_candidate':
        this.onIceCandidate.next(socketMessage);
        break;
      case 'socket_message':
        // console.warn('SOCKET_MESSAGE', socketMessage);
        this.onSocketMessage.next(socketMessage);
        break;
    }
  }
  
  joinRoom(room: Room, /* userId: string */): void {
    this.sendSocketMessage({
      cmd: 'join_room', // join or create
      roomId: room.id,
      body: room
    });
  } // 'join_room'

}
