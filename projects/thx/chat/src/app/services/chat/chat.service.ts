import { Injectable, isDevMode } from '@angular/core';
import { User, Room, RoomConfig } from '@thx/socket';
import { Subject, Subscription } from 'rxjs';
import { ChatSocketService } from '../chat-socket/chat-socket.service';
import { ColorService } from '../color/color.service';
import { EmojiService } from '../emoji/emoji.service';
// version
import { version } from '../../../../../../../package.json';

interface VoiceOverOptions {
  [key: string]: any,
  language: string,
  voice: string
}

export interface ChatOptions {
  [key: string]: any,
  user: User | undefined,
  subscribedRooms: Room[],
  voiceOver: boolean,
  voiceOverOptions: VoiceOverOptions, // language, voice
  termsApproved: boolean,
  termsRevision: number
}

export interface PushPayload {
  title: string,
  body: string,
  icon?: string,
  actions?: any[],
  data?: any
}

const CHAT_OPTIONS_STORAGE_NAME: string = 'thx-chat-options';


@Injectable({
  providedIn: 'root'
})
export class ChatService extends ChatSocketService {

  private defaultOptions: ChatOptions = {
    user: undefined,
    subscribedRooms: [],
    voiceOver: true,
    voiceOverOptions: {
      language: 'en-US',
      voice: ''
    },
    termsApproved: false,
    termsRevision: 0
  }

  // options!: ChatOptions;
  // private _options: ChatOptions = this.defaultOptions;
  options: ChatOptions = this.defaultOptions;
  inRoom!: string;
  private subscribedRooms: Room[] = [];

  lastRoute: string = '/chat';

  onPushMessage: Subject<PushPayload> = new Subject();
  onPushMessageClick: Subject<any> = new Subject();

  get version(): string {
    return version;
  }

  constructor(
    private colorService: ColorService,
    private emojiService: EmojiService
  ) {
    super();
    this.options = this.getOptionsFromStorage();
    // NOTIFICATIONS
    this.onPush.subscribe({
      next: (payload: PushPayload) => {
        console.log('PUSH PAYLOAD', payload);
        this.onPushMessage.next(payload); // subscribe to eg. play sound
        return; // DO NOTHING WHEN APP IS ACTIVE
        // TODO: play sound?, speak?
        // this.swPush.subscription.pipe()
        // navigator.serviceWorker.getRegistration()
        // .then((reg: ServiceWorkerRegistration | undefined) => {
        //   if (reg) {
        //     reg.showNotification(payload.title, {
        //         icon: payload.icon,
        //         body: payload.body,
        //         data: payload.data,
        //       });
        //   }
        // })
      }
    });
    this.onPushClick.subscribe({
      next: (value: any) => {
        console.log('PUSH CLICK', value);
        this.onPushMessageClick.next(value);
        return;
      }
    });

    if (this.options.subscribedRooms && this.options.subscribedRooms.length) {
      this.subscribedRooms = this.options.subscribedRooms;
    }

    // In your Angular component or a service
    // TODO: removeEventListener
    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));

  }

  private onVisibilityChange(e: any): void {
    console.log('visibilitychange', e);
    if (document.visibilityState === 'visible') {
      console.log('App is active');
      this.userIsActive();
      // Handle when app is active (in the foreground)
    } else {
      console.log('App is inactive');
      this.userIsNotActive();
      // Handle when app is inactive (in the background)
    }
  }

  createUser(): User {
    const colors = this.colorService.generateHslaColors(
      this.colorService.randomIntFromInterval(40, 90),
      this.colorService.randomIntFromInterval(30, 60)
    );
    this.user = new User(
      this.emojiService.getRandomAnimalNature(),
      colors[0],
      this.options.voiceOverOptions.voice
    );
    this.options.user = this.user;
    this.updateOptions();
    return this.user;
  }

  private getOptionsFromStorage(): ChatOptions {
    const optionsFromStorage: string | null = localStorage.getItem(CHAT_OPTIONS_STORAGE_NAME);
    if (optionsFromStorage) return JSON.parse(optionsFromStorage);
    return this.options;
  }

  
  updateOptions(options?: ChatOptions): void {
    // TODO: make options subscribeable (BehaviorSubject)
    if (options) this.options = options;
    localStorage.setItem(CHAT_OPTIONS_STORAGE_NAME, JSON.stringify(this.options));
  }

  // TODO
  
  createAndSubscribeRoom(roomConfig: RoomConfig, roomId?: string): Subject<Room> {
    console.log('createRoom chat.service', roomConfig);
    const subject: Subject<Room> = new Subject();
    const createSub: Subscription = this.createRoom(roomConfig, roomId).subscribe({
      next: (room: Room) => {
        this.addRoomToSubscribed(room);
        console.log('createAndSubscribeRoom ... is room subscribed?', this.isRoomSubscribed(room.id));
        subject.next(room);
        subject.complete();
        createSub.unsubscribe();
      },
      error: (e: any) => {
        subject.error(e);
        subject.complete();
        createSub.unsubscribe();
      }
    });

    return subject;
  }
  
  subscribeRoom(roomId: string): Subject<Room | null> {
    // if room already subscribed
    const subject: Subject<Room | null> = new Subject();

    const subSub: Subscription = this.enterRoom(roomId).subscribe({
      next: (room: Room | null) => {
        if (room) {
          this.addRoomToSubscribed(room);
        }
        subject.next(room);
        subject.complete();
        subSub.unsubscribe();
      },
      error: (e: any) => {
        console.error(e);
        subject.error(e);
        subject.complete();
        subSub.unsubscribe();
      }
    });

    return subject;

  }

  addRoomToSubscribed(room: Room): void {
    // add to options
    let alreadyInOptions = false;
    for (const r of this.options.subscribedRooms) {
      if (r.id === room.id) {
        alreadyInOptions = true;
        break;
      }
    }
    if (!alreadyInOptions) {
      this.options.subscribedRooms.push(room);
      this.updateOptions();
    }
    // if already in subscribed, just return
    for (const r of this.subscribedRooms) {
      if (r.id === room.id) return;
    }
    // push to subscribed rooms
    this.subscribedRooms.push(room);
          
  }

  isRoomSubscribed(roomId: string): boolean {
    for (const room of this.subscribedRooms) {
      if (room.id === roomId) {
        return true;
      }
    }
    return false;
  }

  unsubscribeRoom(roomId: string): void {
    console.log('unsubscribe room', roomId);
    console.log('options.subscribedRooms', this.options.subscribedRooms);
    console.log('subscribedRooms', this.subscribedRooms);
    // remove from options
    for (let i = 0; i < this.options.subscribedRooms.length; i++) {
      const room = this.options.subscribedRooms[i];
      console.log('room in options', room);
      if (room.id === roomId) {
        console.log('remove from localstorage', room);
        this.options.subscribedRooms.splice(i, 1);
        this.updateOptions();
        break;
      }
    }
    // remove from subscribedRooms array
    for (let i = 0; i < this.subscribedRooms.length; i++) {
      const room = this.subscribedRooms[i];
      console.log('subscribed room', room);
      if (room.id === roomId) {
        this.subscribedRooms.splice(i, 1);
        break;
      }
    }
    
  }

  getSubscribedRoom(roomId: string): Room | null {
    for (const room of this.subscribedRooms) {
      if (room.id === roomId) return room;
    }
    return null;
  }

  getSubscribedRooms(): Room[] {
    if (!this.subscribedRooms && this.options.subscribedRooms) {
      this.subscribedRooms = this.options.subscribedRooms;
    }
    return this.subscribedRooms;
  }

  resetOptions(): void {
    this.logout();
    localStorage.removeItem(CHAT_OPTIONS_STORAGE_NAME);
    window.location.href = '/';
  }

  confirmQuestion(question: string): boolean {
    return confirm(question);
  }

  pushNotificationsAvailable(): boolean {
    if (!isDevMode() && this.options.user && "Notification" in window) {
      return true;
    }
    return false;
  }

  handlePushNotifications(dialogService: any): void {
    console.log('chat.service handle push notifications');
    // if (!("Notification" in window)) {
    //   console.warn('This browser does not support notifications.');
    //   console.log('window', window);
    // }
    if (this.pushNotificationsAvailable()) {
      console.log('asking for notifications...')
      // const user = this.chatService.options.user;

      const hasPushSub: Subscription = this.hasPush().subscribe({
        next: (hasPush: boolean) => {
          console.log('user hasPush? in chat.service', hasPush);
          if (hasPush) {
            // do nothing
          } else {
            // ask user to accept push
            const dialogSub: Subscription = dialogService.openDialog({
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
                    this.requestPushNotifications();
                    this.sendHelloNotification();
                  }
                  if (Notification.permission === 'denied' || Notification.permission === 'default') {
                    Notification.requestPermission()
                    .then((permission: NotificationPermission) => {
                      if (permission === 'granted') {
                        this.requestPushNotifications();
                        this.sendHelloNotification();
                      }
                    })
                    .catch((e: any) => console.error(e));
                  }
                }
                dialogSub.unsubscribe();
              },
              error: (e: any) => {
                console.error(e);
                dialogSub.unsubscribe();
              }
            });
          }
          hasPushSub.unsubscribe();
        },
        complete: () => hasPushSub.unsubscribe(),
        error: (e: any) => {
          console.warn('IF ERROR IS THAT USER NOT EXIST, TRY TO LOGIN USER AGAIN...');
          console.error(e);
          hasPushSub.unsubscribe();
        }
      });
    } else {
      const dialogSub: Subscription = dialogService.openDialog({
        title: $localize `Not available`,
        content: $localize `Notifications are not available at the moment.`,
        actions: [
          {title: $localize `Ok`, value: 'ok', focus: true}
        ]
      }).subscribe({
        next: (value: string) => dialogSub.unsubscribe(),
        error: (e: any) => dialogSub.unsubscribe()
      });
    }
  }

  private sendHelloNotification(): void {
    // hellow notification options
    const options = {
      icon: 'icons/icon-192x192.png',
      badge: 'icons/icon-72x72.png',
      body: $localize `Hi! ${this.user.nickname}`,
      silent: false
    }
    // Notification constructor is going to be deprecated
    // try if is still supported
    try {
      new Notification('@thx/chat', options);
    } catch(e: any) {
    // otherwise, show notification through serviceWorker.registration
    // see: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
      console.error(e);
      // Failed to construct 'Notification': Illegal constructor. Use ServiceWorkerRegistration.showNotification() instead.
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration()
        .then((registration: ServiceWorkerRegistration | undefined) => {
          if (registration) {
            console.log('registration', registration);
            registration.showNotification('@thx/chat', options);
          }
        });
      }
    }

    console.log('sending notification...');
  }

}
