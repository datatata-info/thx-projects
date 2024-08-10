import { Injectable } from '@angular/core';
import { SocketService, Room, RoomConfig, User, Message } from '@thx/socket';
import { Subscription, Subject } from 'rxjs';
// uuid
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ChatStatsSocketService extends SocketService {

  dataPatterns: any = {
    touch: [],
    key: [],
    mouse: [],
    messaging: []
  }

  constructor() {
    super();
    this.appName = 'thx-chat-stats';
    this.connect();
  }

  subscribeRoom(roomId: string): Subject<Room | null> {
    // const subject: Subject<any> = new Subject();
    const statsRoomId: string = `${this.appName}-${roomId}`;
    return this.enterRoom(statsRoomId, statsRoomId);
  }
  
  touchPipe(e: TouchEvent): void {
    // console.log('touchPipe', e);
    const data = {
      type: e.type,
      changedTouches: new Array(),
      touches: new Array(),
      timeStamp: e.timeStamp,
      composed: e.composed
    };
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch: any = JSON.parse(JSON.stringify(e.changedTouches[i]));
      delete touch.target;
      data.changedTouches.push(touch);
    }
    for (let i = 0; i < e.touches.length; i++) {
      const touch: any = JSON.parse(JSON.stringify(e.touches[i]));
      delete touch.target;
      data.changedTouches.push(touch);
    }
    this.dataPatterns.touch.push({timestamp: performance.now(), data: data});
    // console.log('dataPattern.touch', this.dataPatterns.touch);
  }

  keyPipe(e: KeyboardEvent): void {
    // console.log('keyPipe', e);
    this.dataPatterns.key.push({timestamp: performance.now(), data: {
      type: e.type,
      timeStamp: e.timeStamp,
      code: e.code,
      key: e.key,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    }});
    // console.log('dataPatterns.key', this.dataPatterns.key);
  }

  mousePipe(e: MouseEvent): void {
    // console.log('mousePipe', e);
    this.dataPatterns.mouse.push({timestamp: performance.now(), data: {
      type: e.type,
      clientX: e.clientX,
      clientY: e.clientY,
      timeStamp: e.timeStamp,
      movementX: e.movementX,
      movementY: e.movementY
    }});
  }

  onChatMessageSent(): void {
    this.dataPatterns.messaging.push({sent: performance.now()});
    // console.log('dataPatterns.messaging', this.dataPatterns.messaging);
  }

  onChatMessageRecieve(): void {
    this.dataPatterns.messaging.push({recieve: performance.now()});
    // console.log('dataPatterns.messaging', this.dataPatterns.messaging);
  }

  // overriding is cool, but need on send message in thx-chat app, not thx-chat-stats app :/
  // override sendMessage(value: string | any, roomId: string): Message {
  //   const message = this.sendMessage(value, roomId);
  //   this.dataPatterns.messaging.push({sent: performance.now()});
  //   return message;
  // }
}