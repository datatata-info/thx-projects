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
import { ChatService } from '../../services/chat/chat.service';
// rxjs
import { Subscription, Observable, startWith, map } from 'rxjs'; 
import { Room, RoomMessage, User } from '@thx/socket';

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

  user!: User;

  roomForm: FormGroup<any> = new FormGroup({
    roomName: new FormControl('', Validators.required),
    password: new FormControl(''),
    timer: new FormControl(0),
    public: new FormControl(true)
  });

  searchRoomControl: FormControl = new FormControl('');

  subscribedTopics: any;
  safeUrl: any;

  availableRooms: Room[] = [];
  filteredRooms!: Observable<Room[]>;
  socketConnected: boolean = false;

  // subscribtions
  private createRoomSub: Subscription = new Subscription();
  private onNewRoomSub: Subscription = new Subscription();
  private onAvailableRoomsSub: Subscription = new Subscription();
  private onRoomClosedSub: Subscription = new Subscription();
  private onPublicRoomClosedSub: Subscription = new Subscription();
  private onPublicRoomUpdatedSub: Subscription = new Subscription();
  private onSocketConnectionChange: Subscription = new Subscription();


  constructor(
    private chatSocketService: ChatSocketService,
    private chatService: ChatService,
    private router: Router
  ) {}

  

  ngOnInit(): void {
    console.log('-----rooms init-----');
    // this.socketConnected = this.chatSocketService.connected;
    this.onSocketConnectionChange = this.chatSocketService.connected.subscribe({
      next: (connected: boolean) => this.socketConnected = connected
    });
    console.log('chatSocketService.connected', this.chatSocketService.connected);
    this.filteredRooms = this.searchRoomControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.chatSocketService.getAvailableRooms();
    if (!this.chatSocketService.user) {
      console.warn('NO USER? :(');
      // this.nickname = this.animalService.getRandomAnimal();
      // // this.chatMqttService.nickname = this.nickname;
      // console.log('set nickname', this.nickname);
      // this.chatSocketService.setUserNickname(this.nickname);
    } else {
      this.user = this.chatSocketService.user;
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
        if (this.chatService.isMyRoom(roomId)) this.chatService.removeMyRoom(roomId);
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
  }

  ngOnDestroy(): void {
    this.createRoomSub.unsubscribe();
    this.onNewRoomSub.unsubscribe();
    this.onAvailableRoomsSub.unsubscribe();
    this.onRoomClosedSub.unsubscribe();
    this.onPublicRoomClosedSub.unsubscribe();
    this.onPublicRoomUpdatedSub.unsubscribe();
    this.onSocketConnectionChange.unsubscribe();
  }

  private _filter(value: string): Room[] {
    // console.log('filter value', value);
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.availableRooms.filter(room => room.config.roomName.toLowerCase().includes(filterValue));
    }
    return [];
  }

  displaySearchRoomFn(room: Room): string {
    return room && room.config.roomName ? room.config.roomName : '';
  }

  onRoomSelect(room: Room): void {
    if (room && room.id) {
      this.router.navigate(['/chat', room.id]);
    }
  }

  createAndJoinRoom(): void {
    if (!this.roomForm.valid) {
      console.error('check form');
      return;
    }
    if (this.socketConnected && this.chatSocketService.user) {
      this.createRoomSub = this.chatSocketService.createRoom(this.roomForm.value).subscribe({
        next: (room: Room) => {
          console.log('new room created by me', room);
          this.chatService.addMyRoom(room.id);
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

  log(key: any, value: any): void {
    console.log(key, value);
  }
  ///
}
