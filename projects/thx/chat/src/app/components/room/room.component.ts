import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
// material
import { MaterialModule } from '../../modules/material/material.module';
// components
import { MessageComponent } from '../message/message.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ChatStatsComponent } from '../chat-stats/chat-stats.component';
// services
import { ChatService } from '../../services/chat/chat.service';
// rxjs
import { Subscription, Subject } from 'rxjs';
import { Message, Room, RoomMessage, User } from '@thx/socket';

const CLOSE_ROOM_IN: number = 10 * 1000;

@Component({
  selector: 'thx-room',
  standalone: true,
  imports: [
    MessageComponent,
    MaterialModule,
    MessageInputComponent,
    ChatStatsComponent,
    RouterModule
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy {

  room: Room | null = null;
  user!: User;
  isAdmin: boolean = false;

  private routeSub: Subscription = new Subscription();
  private onMessageSub: Subscription = new Subscription();
  private onRoomClosed: Subscription = new Subscription();
  private onRoomEstablishedSub: Subscription = new Subscription();

  private roomEstablished: Subject<boolean> = new Subject();

  messages: Message[] = [];
  // for stats
  recievedMessage!: string;
  sentMessage!: string;

  voiceOver: boolean = true;
  notifications: boolean = true;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService
  ){}

  ngOnInit(): void {
    console.warn('🚀 Room init');
    this.voiceOver = this.chatService.options.voiceOver;
    // this.messages = []; // TODO: (on router navigate) reset messages (from notification)
    if (this.chatService.user) this.user = this.chatService.user;
    // subscribe for get admin
    this.onRoomEstablishedSub = this.roomEstablished.subscribe({
      next: (established: boolean) => {
        console.log('🦧 roomEstablished', established);
        if (established) {
          if (this.room && this.room.admin === this.user.id) this.isAdmin = true;
          this.onRoomEstablishedSub.unsubscribe();
        }
      },
      error: (e: any) => console.error(e)
    });
    // subscribe route to get roomId
    this.routeSub = this.route.params.subscribe({
      next: (params: any) => {
        // console.log('route params', params);
        if (params.roomId) {
          const roomId = params.roomId;
          this.chatService.inRoom = roomId;
          console.log('🐣 roomId from url', roomId);
          // if room is not already subscirbed
          console.log('🐊 is room subscribed?', this.chatService.isRoomSubscribed(roomId))
          if (!this.chatService.isRoomSubscribed(roomId)) {
            console.log('🦮 subscribe room...');
            this.chatService.subscribeRoom(roomId).subscribe({
              next: (room: Room | null) => {
                console.log('...subscribed room? ♥️', room);
                if (room) {
                  this.room = room;
                  // this.chatService.subscribeRoom(roo)
                  this.roomEstablished.next(true);
                  this.notifications = this.chatService.isRoomSubscribed(room.id);
                  console.log('notifications', this.chatService.isRoomSubscribed(room.id));
                } else {
                  this.router.navigate(['/']);
                }
                
              },
              error: (e: any) => console.error(e)
            });
          } else {
            console.log('room is already subscirbed...', this.chatService.isRoomSubscribed(roomId));
            this.room = this.chatService.getSubscribedRoom(roomId);
            this.roomEstablished.next(true);
          }
                    
        }
        this.routeSub.unsubscribe();
      }
    });

    this.onMessageSub = this.chatService.onMessage.subscribe({
      next: (result: RoomMessage) => {
        if (this.room && result.roomId === this.room.id) { // show only relevant messages for room (exclude notifications from other rooms)
          this.messages.unshift(result.message);
          this.recievedMessage = result.message.id;
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onRoomClosed = this.chatService.onRoomClosed.subscribe({
      next: (roomId: string) => {
        if (this.room && this.room.id === roomId) {
          this.chatService.leaveRoom(roomId);
          // remove from my rooms
          if (this.chatService.isRoomSubscribed(roomId)) this.chatService.unsubscribeRoom(roomId);
          const localMessage: Message = new Message(
            this.user,
            {
              subject: $localize `🌘 Chat closes in ${CLOSE_ROOM_IN / 1000} seconds.`
            },
            CLOSE_ROOM_IN
          );
          this.messages.unshift(localMessage);
          // navigate to root in a defined time
          setTimeout(() => {
            this.router.navigate(['/']);
          }, CLOSE_ROOM_IN);
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
        break;
      }
    }
  }

  openSettings(): void {
    this.notifications = true; // set notifications true temporary 
    this.router.navigate(['/settings']);
  }

  leaveRoom(): void {
    // TODO: even if admin, leave with or without closing (let the room open)
    if (!this.notifications) {
      if (this.chatService.confirmQuestion($localize `You are going to leave the chat permanently? If you want to receive notifications, turn notifications for this chat on before leaving.`)) {
        // if (this.room) this.chatService.sendByeAndLeaveRoom(this.room.id);
        // this.router.navigate(['/chat']);
      }
    } /* else {
      this.router.navigate(['/chat']);
    } */
   this.router.navigate(['/chat']);
    
  }

  unsubscribeRoom(): void{
    if (this.room) {
      if (this.chatService.confirmQuestion($localize `You are about to leave the chat permanently. If you want to stay subscribed and receive notifications, use the arrow on the left.`)) {
        this.chatService.unsubscribeRoom(this.room.id);
        this.notifications = false;
        // this.chatService.sendByeAndLeaveRoom(this.room.id);
        this.router.navigate(['/chat']);
      }
    }
  }

  closeRoom(): void {
    // send to room
    // this.chatSocketService.sendMessage(`🌘 Chat closes in ${this.CLOSE_ROOM_IN / 1000} seconds.`, this.room.id);
    if (this.room && this.chatService.confirmQuestion($localize `Would you like to close this chat? Other users will receive a message and be disconnected from the chat in a moment.`)) {
      this.chatService.closeRoom(this.room.id).subscribe({
        next: (result: any) => {
          if (result.success) {
            console.log('room close result', result);
          }
        },
        error: (e: any) => console.error(e)
      });
    }
    
  }

  copyChatLinkToClipboard(): void {
    // Copy the text inside the text field
    navigator.clipboard.writeText(location.href)
    .then(() => {
      // Alert the copied text
      alert($localize `Link successfully copied to clipboard.`);
    })
    .catch((e: any) => {
      alert(e);
    })
    
  }

  ngOnDestroy(): void {
    console.warn('🚀 Room destroy');
    this.messages.length = 0; // remove all messages
    this.routeSub.unsubscribe();

    this.onMessageSub.unsubscribe();

    this.onRoomClosed.unsubscribe();
    this.onRoomEstablishedSub.unsubscribe();
    this.chatService.inRoom = '';
    if (this.room) {
      
      if (!this.notifications) {
        // unsubscribe room (? test what it means)
        this.chatService.unsubscribeRoom(this.room.id);
        this.chatService.sendByeAndLeaveRoom(this.room.id);
      } else {
        // this.chatService.sendBye(this.)
      }
    }
    
    
  }

  toggleVoiceOver(): void {
    this.voiceOver = !this.voiceOver;
    this.chatService.options.voiceOver = this.voiceOver;
  }

  toggleNotifications(): void {
    this.notifications = !this.notifications;
    if (this.room)
    if (this.notifications) {
      this.chatService.addRoomToSubscribed(this.room);
    } else {
      this.chatService.unsubscribeRoom(this.room.id);
    }
  }

  pushMyMessage(message: Message): void {
    this.messages.unshift(message);
    this.sentMessage = message.id;
  }

  
}
