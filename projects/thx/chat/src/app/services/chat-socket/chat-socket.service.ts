import { Injectable } from '@angular/core';
// socket
import { SocketService, Room, User } from '@thx/socket';
import { Subscription, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService extends SocketService {

  // private rooms: any = {};
  private certGenSub: Subscription = new Subscription();

  constructor() {
    super();
    this.appName = 'thx-chat';
    this.connect();
    // console.log('...subscribe cert');
    this.onCertGenerated.subscribe({
      next: (done: boolean) => {
        if (done) console.info('cert ready...', done)
      },
      complete: () => this.certGenSub.unsubscribe(),
      error: (e: any) => console.error(e)
    });
  }


  // getRoom(roomId: string): Room {
  //   return this.rooms[roomId];
  // }

  sendByeAndLeaveRoom(roomId: string): void {
    this.sendBye(roomId);
    this.leaveRoom(roomId);
  }

  private sendBye(roomId: string): void {
    this.sendMessage('👋 ...leaving chat', roomId);
  }

}
