import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { Location } from '@angular/common';
// router
import { Router, RouterModule } from '@angular/router';
// material
import { MaterialModule } from '../../modules/material/material.module';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
// components
import { SubscribedRoomsMenuComponent } from '../subscribed-rooms-menu/subscribed-rooms-menu.component';
// form
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// services
import { MessageInputComponent } from '../message-input/message-input.component';
import { ChatService } from '../../services/chat/chat.service';
import { DialogService, DialogData } from '../../services/dialog/dialog.service';
// rxjs
import { Subscription, Observable, startWith, map } from 'rxjs'; 
import { Room, User } from '@thx/socket';

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
    public: new FormControl(false)
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
  private onUserSetSub: Subscription = new Subscription();


  constructor(
    // private chatSocketService: ChatSocketService,
    private chatService: ChatService,
    private router: Router,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private location: Location
  ) {}

  

  ngOnInit(): void {
    console.log('-----rooms init-----');
    // this.socketConnected = this.chatSocketService.connected;
    this.onSocketConnectionChange = this.chatService.connected.subscribe({
      next: (connected: boolean) => {
        this.socketConnected = connected;
        // console.log('connected?', connected);
      }
    });
    // console.log('chatSocketService.connected', this.chatSocketService.connected);
    this.filteredRooms = this.searchRoomControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.chatService.getAvailableRooms();
    if (!this.chatService.options.user) {
      console.warn('NO USER? :(');
      // this.nickname = this.animalService.getRandomAnimal();
      // // this.chatMqttService.nickname = this.nickname;
      // console.log('set nickname', this.nickname);
      // this.chatSocketService.setUserNickname(this.nickname);
    } else {
      this.user = this.chatService.options.user;
    }

    this.onUserSetSub = this.chatService.onUserSet.subscribe({
      next: (user: User | null) => {
        console.log('onUserSet', user);
        if (user) {
          // handle push notifications
          this.handlePushNotifications();
        }
        
      },
      error: (e: any) => console.error(e)
    })
    

    this.onNewRoomSub = this.chatService.onNewRoom.subscribe({
      next: (room: Room) => {
        console.log('new public room created by someone', room);
        this.availableRooms.push(room);
      },
      error: (e: any) => console.error(e)
    });

    this.onAvailableRoomsSub = this.chatService.onAvailableRooms.subscribe({
      next: (rooms: Room[]) => {
        console.log('available rooms', rooms);
        if (rooms && rooms.length) {
          this.availableRooms = [...rooms];
          this.onAvailableRoomsSub.unsubscribe();
        }
      },
      error: (e: any) => console.error(e)
    });

    this.onRoomClosedSub = this.chatService.onRoomClosed.subscribe({
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

    this.onPublicRoomClosedSub = this.chatService.onPublicRoomClosed.subscribe({
      next: (roomId: string) => {
        if (this.chatService.isRoomSubscribed(roomId)) this.chatService.unsubscribeRoom(roomId);
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

    this.onPublicRoomUpdatedSub = this.chatService.onPublicRoomUpdated.subscribe({
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
    this.onUserSetSub.unsubscribe();
  }

  openBottomSheet(): void {
    this.bottomSheet.open(SubscribedRoomsMenuComponent);
  }

  private handlePushNotifications(): void {
    if (!("Notification" in window)) {
      console.warn('This browser does not support notifications.');
      console.log('window', window);
    }
    if (!isDevMode() && this.chatService.options.user && "Notification" in window) {
      console.log('asking for notifications...')
      const user = this.chatService.options.user;

      const hasPushSub: Subscription = this.chatService.hasPush().subscribe({
        next: (hasPush: boolean) => {
          console.log('user hasPush?', hasPush);
          if (hasPush) {
            // do nothing
          } else {
            // ask user to accept push
            this.dialogService.openDialog({
              title: $localize `Missing message notifications?`,
              content: $localize `@thx/chat needs permission to send notifications. To turn on notifications, click Continue and then Allow when prompted by your browser.`,
              actions: [
                {title: $localize `Continue`, value: 'continue', focus: true}
              ]
            }).subscribe({
              next: (value: any) => {
                console.log('dialog value', value);
                if (value === 'continue') {
                  console.log('Notification.permission', Notification.permission);
                  if (Notification.permission === 'granted') {
                    this.chatService.requestPushNotifications();
                    this.sendHelloNotification();
                  }
                  if (Notification.permission === 'denied' || Notification.permission === 'default') {
                    Notification.requestPermission()
                    .then((permission: NotificationPermission) => {
                      if (permission === 'granted') {
                        this.chatService.requestPushNotifications();
                        this.sendHelloNotification();
                      }
                    })
                    .catch((e: any) => console.error(e));
                  }
                }
              },
              error: (e: any) => console.error(e)
            });
          }
        },
        complete: () => hasPushSub.unsubscribe(),
        error: (e: any) => console.error(e)
      });
    }
  }

  private sendHelloNotification(): void {
    const hello = new Notification('@thx/chat', {
      icon: 'icons/icon-96x96.png',
      body: $localize `Welcome ${this.user.nickname}`,
      silent: false
    });
    console.log('sending notification...');
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
    if (this.socketConnected && this.chatService.user) {
      // if roomName is link
      if (this.isLink(this.roomForm.value.roomName)) {
        window.location.href = this.roomForm.value.roomName;
        return;
      }

      this.createRoomSub = this.chatService.createAndSubscribeRoom(this.roomForm.value).subscribe({
        next: (room: Room) => {
          console.log('new room created by me', room);
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

  getSubscribedRooms(): Room[] {
    const rooms = this.chatService.getSubscribedRooms();
    // console.log('getSubscribedRooms', rooms);
    return rooms;
  }

  log(key: any, value: any): void {
    console.log(key, value);
  }
  ///

  private isLink(text: string): boolean {
    try {
      const url = new URL(text);
      return true;
    } catch(e) {
      return false;
    }
    return false;
  }
}
