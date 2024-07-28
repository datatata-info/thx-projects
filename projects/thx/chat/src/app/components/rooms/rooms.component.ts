import { Component, OnInit, OnDestroy } from '@angular/core';
// router
import { Router, RouterModule } from '@angular/router';
// material
import { MaterialModule } from '../../modules/material/material.module';
// form
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// services
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { MessageInputComponent } from '../message-input/message-input.component';
// rxjs
import { Subscription } from 'rxjs'; 
import { Room, Message, RoomMessage } from '@thx/socket';

@Component({
  selector: 'thx-rooms',
  standalone: true,
  imports: [
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MaterialModule,
    MessageInputComponent
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit, OnDestroy {

  nickname!: string;

  roomForm: FormGroup<any> = new FormGroup({
    roomName: new FormControl('', Validators.required),
    password: new FormControl(''),
    timer: new FormControl(0),
    public: new FormControl(true)
  });

  subscribedTopics: any;
  safeUrl: any;

  availableRooms: Room[] = [];

  // subscribtions
  private createRoomSub: Subscription = new Subscription();
  private onNewRoomSub: Subscription = new Subscription();
  private onAvailableRoomsSub: Subscription = new Subscription();
  private onRoomClosedSub: Subscription = new Subscription();
  private onPublicRoomClosedSub: Subscription = new Subscription();
  private onPublicRoomUpdatedSub: Subscription = new Subscription();
  private onMessageNotification: Subscription = new Subscription();


  constructor(
    private chatSocketService: ChatSocketService,
    private router: Router
  ) {}

  

  ngOnInit(): void {
    console.log('-----rooms init-----');
    this.chatSocketService.getAvailableRooms();
    if (!this.chatSocketService.user) {
      console.warn('NO USER? :(');
      // this.nickname = this.animalService.getRandomAnimal();
      // // this.chatMqttService.nickname = this.nickname;
      // console.log('set nickname', this.nickname);
      // this.chatSocketService.setUserNickname(this.nickname);
    } else {
      this.nickname = this.chatSocketService.user.nickname;
    }
    

    this.onNewRoomSub = this.chatSocketService.onNewRoom.subscribe({
      next: (room: Room) => {
        console.log('new public room created by someone', room);
        this.availableRooms.push(room);
      },
      error: (e: any) => console.error(e)
    });

    this.onAvailableRoomsSub = this.chatSocketService.onAvailableRooms.subscribe({
      next: (rooms: Room[]) => {
        console.log('available rooms', rooms);
        if (rooms && rooms.length) {
          this.availableRooms = [...rooms];
          this.onAvailableRoomsSub.unsubscribe();
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onRoomClosedSub = this.chatSocketService.onRoomClosed.subscribe({
      next: (roomId: string) => {
        console.log('room closed', roomId);
        for (let i = 0; i < this.availableRooms.length; i++) {
          const room = this.availableRooms[i];
          if (room.id === roomId) {
            this.availableRooms.splice(i, 1);
            break;
          }
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onPublicRoomClosedSub = this.chatSocketService.onPublicRoomClosed.subscribe({
      next: (roomId: string) => {
        for (let i = 0; i < this.availableRooms.length; i++) {
          const room = this.availableRooms[i];
          if (room.id === roomId) {
            this.availableRooms.splice(i, 1);
            break;
          }
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onPublicRoomUpdatedSub = this.chatSocketService.onPublicRoomUpdated.subscribe({
      next: (room: Room) => {
        console.log('public room updated', room);
        for (let i = 0; i < this.availableRooms.length; i++) {
          const availableRoom: Room = this.availableRooms[i];
          if (availableRoom.id === room.id) {
            this.availableRooms[i] = room;
            break;
          }
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onMessageNotification = this.chatSocketService.onMessage.subscribe({
      next: (roomMessage: RoomMessage) => {
        // this.messages.push(message);
        // this.playSoundIn();
        console.log('message notification', roomMessage);
      },
      error: (e: any) => console.error(e)
    });
  }

  ngOnDestroy(): void {
    this.createRoomSub.unsubscribe();
    this.onNewRoomSub.unsubscribe();
    this.onAvailableRoomsSub.unsubscribe();
    this.onRoomClosedSub.unsubscribe();
    this.onPublicRoomClosedSub.unsubscribe();
    this.onPublicRoomUpdatedSub.unsubscribe();
    this.onMessageNotification.unsubscribe();
  }

  createAndJoinRoom(): void {
    if (!this.roomForm.valid) {
      console.error('check form');
      return;
    }
    if (this.chatSocketService.connected && this.chatSocketService.user) {
      this.createRoomSub = this.chatSocketService.createRoom(this.roomForm.value).subscribe({
        next: (room: Room) => {
          console.log('new room created by me', room);
          this.chatSocketService.join(room);
          this.createRoomSub.unsubscribe();
          this.roomForm.reset();
          this.router.navigate([`/chat/${room.id}`]);
        },
        error: (e: any) => console.error(e)
      })
    } else {
      console.error('cannot connect to socket');
    }
  }

  // joinRoom(room: string, validator: string): void {
  //   // console.log("joinRoom room", room);
  //   // console.log('joinRoom validator', validator);
  //   // console.log(this.chatMqttService.subscribedTopics.length);
// 
  //   if (!this.chatMqttService.nickname) {
  //     console.info("set your nickname first");
  //     return;
  //   }
// 
  //   // TODO: tyto fieldy se musi vyclearovat po tom co uzivatel opusti mistnost, aby se mohl znova prihlasit
  //   if (!this.chatMqttService.subscribedTopics.length &&
  //     !this.chatMqttService.enteredChats.length) {
// 
  //     // var target = event.target || event.srcElement || event.currentTarget;
  //     // var topic = target.attributes.id.nodeValue;
  //     // console.log("room: " + room);
// 
  //     this.chatMqttService.joinRoom(room, validator);
  //     // this.chatStatsService.joinStats(room);
  //     this.chatMqttService.createUrlSafeHash(room);
// 
  //     // show loader
  //     // this.loaderService.loading.next(true);
  //     // subscribe signal message
  //     this.chatMqttService.sigMqttService.signalMessagesSubject.subscribe((msg: any) => {
  //       if (msg.status === 'signal_successfully_finished') {
  //         const message: MqttMessage = {
  //           destinationName: room,
  //           message: {
  //             userId: this.chatMqttService.userId,
  //             name: this.chatMqttService.nickname,
  //             value: {
  //               joined: true,
  //               text: "has joined chat room"
  //             },
  //             sentTime: new Date(),
  //             creator: this.chatMqttService.isCreator
  //           }
  //         };
  //         this.chatMqttService.sendMessageJSON(message);
  //         // hide loader
  //         // this.loaderService.loading.next(false);
  //         // route to chat
  //         this.router.navigate([`/${this.chatMqttService.getUrlSafeHash()}`]);
  //       }
  //     });
// 
  //   } else {
  //     console.info("you are not allowed to join more than one chat rooms");
  //   }
  // }

  // getAvailableRooms(): any {
  //   return this.chatMqttService.availableRooms;
  // }


}
