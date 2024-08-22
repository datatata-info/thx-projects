import { Injectable } from '@angular/core';
import { SocketService, Room, RoomConfig, User, Message } from '@thx/socket';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatStatsSocketService extends SocketService {

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
  
}
