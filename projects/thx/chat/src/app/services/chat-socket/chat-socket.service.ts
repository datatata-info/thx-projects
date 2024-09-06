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
    // this.appName = 'thx-chat';
    // this.appTitle = '@thx/chat';
    this.appOptions = {
      appName: 'thx-chat',
      appTitle: '@thx/chat',
      appIcon: 'icons/icon-192x192.png',
      badge: 'icons/icon-72x72.png'
    }
    this.connect();
    // console.log('...subscribe cert');
    this.onCertPrepared.subscribe({
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
    console.log('sendBye', '👋 ...leaving chat');
    this.sendMessage('👋 ...leaving chat', roomId);
  }

}
