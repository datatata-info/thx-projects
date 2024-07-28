import { Injectable } from '@angular/core';
// socket
import { SocketService, Room, User } from '@thx/socket';
import { Subscription } from 'rxjs';
// uuid
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService extends SocketService {

  private rooms: any = {};
  joinedRooms: string[] = [];

  private certGenSub: Subscription = new Subscription();

  constructor() {
    super();
    this.appName = 'thx-chat';
    this.connect();
    // console.log('...subscribe cert');
    this.onCertGenerated.subscribe({
      next: (done: boolean) => console.log('cert generated', done),
      complete: () => this.certGenSub.unsubscribe(),
      error: (e: any) => console.error(e)
    });
  }

  // setUserNickname(nickname: string): void {
  //   this.user = {
  //     id: uuidv4(),
  //     nickname: nickname
  //   }
  //   this.login();
  // }

  join(room: Room): void {
    this.rooms[room.id] = room;
    this.joinedRooms.push(room.id);
  }

  getRoom(roomId: string): Room {
    return this.rooms[roomId];
  }

  sendByAndLeaveRoom(roomId: string): void {
    for (let i = 0; i < this.joinedRooms.length; i++) {
      const id = this.joinedRooms[i];
      // console.log(`exit ${roomId}`, id);
      if (id === roomId) {
        this.sendMessage('👋 ...leaving chat', roomId);
        this.leaveRoom(roomId);
        this.joinedRooms.splice(i, 1);
        break;
      }
    }
  }

  isRoomJoined(roomId: string): boolean {
    if (this.joinedRooms.includes(roomId)) return true;
    return false;
  }
}