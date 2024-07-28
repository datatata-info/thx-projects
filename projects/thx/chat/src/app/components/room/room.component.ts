import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// material
import { MaterialModule } from '../../modules/material/material.module';
// components
import { MessageComponent } from '../message/message.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ChatStatsComponent } from '../chat-stats/chat-stats.component';
// services
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { AudioService } from '../../services/audio/audio.service';
import { ChatService } from '../../services/chat/chat.service';
// rxjs
import { Subscription, Subject } from 'rxjs';
import { Message, Room, RoomMessage, User } from '@thx/socket';

@Component({
  selector: 'thx-room',
  standalone: true,
  imports: [
    MessageComponent,
    MaterialModule,
    MessageInputComponent,
    ChatStatsComponent
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy {

  room!: Room;
  user!: User;
  isAdmin: boolean = false;

  private routeSub: Subscription = new Subscription();
  private roomExistSub: Subscription = new Subscription();
  private joinRoomSub: Subscription = new Subscription();
  private onMessageSub: Subscription = new Subscription();
  private onRoomClosed: Subscription = new Subscription();
  private onRoomEstablishedSub: Subscription = new Subscription();

  private roomEstablished: Subject<boolean> = new Subject();
  private CLOSE_ROOM_IN: number = 10 * 1000;

  messages: Message[] = [];

  voiceOver: boolean = true;
  notifications: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatSocketService: ChatSocketService,
    private audioService: AudioService,
    private chatService: ChatService
  ){}

  ngOnInit(): void {
    this.voiceOver = this.chatService.useVoiceOver;
    if (this.chatSocketService.user) this.user = this.chatSocketService.user;
    // TODO: REFACTOR
    this.routeSub = this.route.params.subscribe({
      next: (params: any) => {
        console.log('route params', params);
        if (params.roomId) {
          const roomId = params.roomId;
          this.room = this.chatSocketService.getRoom(roomId);
          console.log('room', this.room);
          this.roomExistSub = this.chatSocketService.roomExist(roomId).subscribe({
            next: (roomExist: boolean) => {
              console.log('roomExist?', roomExist);
              if (roomExist) {
                if (this.room && this.user) this.roomEstablished.next(true);
                // room exist and im not joined
                console.log('isRoomJoined?', this.chatSocketService.isRoomJoined(roomId));
                if (!this.chatSocketService.isRoomJoined(roomId)) {
                  console.log('im not joined, should join');
                  if (!this.chatSocketService.user) {
                    console.log('NO USER? :(');
                    // const nickname = this.animalService.getRandomAnimal();
                    // this.chatSocketService.setUserNickname(nickname);
                    // this.user = this.chatSocketService.user;
                  }
                  
                  // maybe wait a bit or setUserNickname with callback
                  this.joinRoomSub = this.chatSocketService.joinRoom(roomId).subscribe({
                    next: (room: Room | null) => {
                      if (room) {
                        this.room = room;
                        if (this.room && this.user) this.roomEstablished.next(true);
                        console.log('room joined', room);
                        this.chatSocketService.join(room);
                        // request handshake
                        this.chatSocketService.requestHandshake(room.id);
                      }
                    },
                    error: (e: any) => console.error(e)
                  })

                }
              // room not exist
              } else {
                // navigate to rooms (root)
                this.router.navigate(['/']);
              }
            },
            error: (e: any) => console.error(e)
          })
        }
        this.routeSub.unsubscribe();
      }
    });

    this.onMessageSub = this.chatSocketService.onMessage.subscribe({
      next: (result: RoomMessage) => {
        if (result.roomId === this.room.id) { // show only relevant messages for room (exclude notifications from other rooms)
          this.messages.push(result.message);
          this.playSoundIn();
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onRoomClosed = this.chatSocketService.onRoomClosed.subscribe({
      next: (roomId: string) => {
        if (this.room && this.room.id === roomId) {
          this.chatSocketService.leaveRoom(roomId);
          const localMessage: Message = new Message(
            this.user,
            `🌘 Chat closes in ${this.CLOSE_ROOM_IN / 1000} seconds.`,
            this.CLOSE_ROOM_IN
          );
          this.messages.push(localMessage);
          // console.warn(`ROOM IS CLOSING IN ${this.CLOSE_ROOM_IN / 1000}s`);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, this.CLOSE_ROOM_IN);
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onRoomEstablishedSub = this.roomEstablished.subscribe({
      next: (established: boolean) => {
        if (established) {
          if (this.room.admin === this.user.id) this.isAdmin = true;
          this.onRoomEstablishedSub.unsubscribe();
        }
      },
      error: (e: any) => console.error(e)
    });

    // this.checkMessagesExpiration();
  }

  messageExpired(id: string): void {
    console.log('MESSAGE HAS BEEN EXPIRED!', id);
    for (let i = 0; i < this.messages.length; i++) {
      const m = this.messages[i];
      if (m.id === id) {
        this.messages.splice(i, 1);
        this.playSoundOut();
        break;
      }
    }
  }

  leaveRoom(): void {
    // TODO: even if admin, leave with or without closing (let the room open)
    if (!this.notifications) this.chatSocketService.sendByAndLeaveRoom(this.room.id);
    this.router.navigate(['/chat']);
  }

  closeRoom(): void {
    // send to room
    // this.chatSocketService.sendMessage(`🌘 Chat closes in ${this.CLOSE_ROOM_IN / 1000} seconds.`, this.room.id);
    this.chatSocketService.closeRoom(this.room.id).subscribe({
      next: (result: any) => {
        if (result.success) {
          console.log('room close result', result);
        }
      },
      error: (e: any) => console.error(e)
    });
  }

  copyChatLinkToClipboard(): void {
    // Copy the text inside the text field
    navigator.clipboard.writeText(location.href)
    .then(() => {
      // Alert the copied text
      alert('Link successfully copied to clipboard.');
    })
    .catch((e: any) => {
      alert(e);
    })
    
  }

  ngOnDestroy(): void {
    this.messages.length = 0; // remove all messages
    this.roomExistSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.joinRoomSub.unsubscribe();
    this.onMessageSub.unsubscribe();
    this.onRoomClosed.unsubscribe();
    this.onRoomEstablishedSub.unsubscribe();
    if (this.room) {
      // if (this.isAdmin) {
      //   this.chatSocketService.sendMessage(`🌘 Room is closing in ${this.CLOSE_ROOM_IN / 1000}s ...`, this.room.id);
      // }
      if (!this.notifications) this.chatSocketService.sendByAndLeaveRoom(this.room.id);
    }
    
  }

  toggleVoiceOver(): void {
    this.voiceOver = !this.voiceOver;
    this.chatService.useVoiceOver = this.voiceOver;
  }

  toggleNotifications(): void {
    this.notifications = !this.notifications;
  }

  pushMessage(message: Message): void {
    this.messages.push(message);
  }

  private playSoundIn(): void {
    const oscillator = this.audioService.createOscilator('sine');
    // c4, d4, e4: 261.63, 293.66, 329.63
    this.audioService.setFrequency(oscillator, 220.00);
    this.audioService.play(oscillator);
    setTimeout(() => this.audioService.setFrequency(oscillator, 293.66), 100);
    setTimeout(() => this.audioService.setFrequency(oscillator, 311.13), 200);
    setTimeout(() => {
      this.audioService.stop(oscillator);
      // this.audioService.stop(oscillator);
      // this.audioService.fadeOut(() => {
      //   this.audioService.stop(oscillator);
      // });
    }, 466);
  }

  private playSoundOut(): void {
    const oscillator = this.audioService.createOscilator('sine');
    // c4, d4, e4: 261.63, 293.66, 329.63
    this.audioService.setFrequency(oscillator, 211.13);
    this.audioService.play(oscillator);
    setTimeout(() => this.audioService.setFrequency(oscillator, 193.66), 100);
    setTimeout(() => this.audioService.setFrequency(oscillator, 120.00), 200);
    setTimeout(() => {
      this.audioService.stop(oscillator);
      // this.audioService.stop(oscillator);
      // this.audioService.fadeOut(() => {
      //   this.audioService.stop(oscillator);
      // });
    }, 466);
  }
}
