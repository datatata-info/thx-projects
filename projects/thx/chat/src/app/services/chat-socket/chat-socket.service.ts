import { Injectable } from '@angular/core';
// socket
import { SocketService, Room, User } from '@thx/socket';
// uuid
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService extends SocketService {

  private rooms: any = {};
  joinedRooms: string[] = [];

  constructor() {
    super();
    this.appName = 'thx-chat';
    this.connect();
  }

  setUserNickname(nickname: string): void {
    this.user = {
      id: uuidv4(),
      nickname: nickname
    }
    this.login();
  }

  join(room: Room): void {
    this.rooms[room.id] = room;
    this.joinedRooms.push(room.id);
  }

  getRoom(roomId: string): Room {
    return this.rooms[roomId];
  }

  exitRoom(roomId: string): void {
    for (let i = 0; i < this.joinedRooms.length; i++) {
      const id = this.joinedRooms[i];
      if (id === roomId) this.joinedRooms.splice(i, 1);
    }
  }

  isRoomJoined(roomId: string): boolean {
    if (this.joinedRooms.includes(roomId)) return true;
    return false;
  }
}
