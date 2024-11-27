import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// services
import { ThxService } from './services/thx/thx.service';
// interfaces
import { Room, User, ThxMessage } from '@thx/protocol';
// uuid
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  socketConnected: boolean = false;
  certReady: boolean = false;

  get joinedRooms(): Room[] {
    return this.thxService.joinedRooms;
  }

  get availableRooms(): Room[] {
    return this.thxService.availableRooms;
  }

  get roomsMessages(): any {
    
    return this.thxService.roomsMessages;
  }

  constructor(
    private thxService: ThxService,
  ) {}

  ngOnInit(): void {
    this.thxService.socketConnected.subscribe({
      next: (connected: boolean) => {
        this.socketConnected = connected;
        console.log('SOCKET CONNECTED?', connected);
      }
    });
    this.thxService.onCert.subscribe({
      next: (certReady: boolean) => this.certReady = certReady
    });
  }

  ngOnDestroy(): void {
    this.thxService.destroy();
  }

  createPublicRoom(): void {
    const room: Room = {
      id: uuidv4(),
      config: {
        roomName: uuidv4(),
        public: true
      },
      admin: this.thxService.user.id,
      size: 1
    }
    this.thxService.createRoom(room);
  }

  joinPublicRoom(room: Room): void {
    this.thxService.joinRoom(room);
  }

  getUser(): User {
    return this.thxService.user;
  }

  sendMessageToRoom(roomId: string, message: string, elm: any): void {
    // console.log(`send message to ${roomId}`, message);
    // console.log('elm', elm);
    const m: ThxMessage = new ThxMessage({
      user: this.getUser(),
      body: message
    });
    console.log('.......M', m);
    this.thxService.sendRoomMessage(roomId, m);
    elm.value = '';
  }

  roomIsJoined(roomId: string): boolean {
    for (const joinedRoom of this.joinedRooms) {
      if (joinedRoom.id === roomId) return true;
    }
    return false;
  }

}
