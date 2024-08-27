import { Injectable } from '@angular/core';
import { User, Room, RoomConfig, RoomMessage } from '@thx/socket';
import { Subject, Subscription } from 'rxjs';
import { ChatSocketService } from '../chat-socket/chat-socket.service';

interface VoiceOverOptions {
  [key: string]: any,
  language: string,
  voice: string
}

export interface ChatOptions {
  [key: string]: any,
  user: User | undefined,
  subscribedRooms: string[],
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

  constructor(
  ) {
    super();
    this.options = this.getOptionsFromStorage();
    // NOTIFICATIONS
    this.onPush.subscribe({
      next: (payload: PushPayload) => {
        console.log('PUSH PAYLOAD', payload);
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
      }
    })

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
    if (!this.options.subscribedRooms.includes(room.id)) {
      this.options.subscribedRooms.push(room.id);
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
    for (let i = 0; i < this.subscribedRooms.length; i++) {
      const room = this.subscribedRooms[i];
      if (room.id === roomId) {
        this.subscribedRooms.splice(i, 1);
        break;
      }
    }
    // remove from options
    for (let i = 0; i < this.options.subscribedRooms.length; i++) {
      const id = this.options.subscribedRooms[i];
      if (id === roomId) {
        this.options.subscribedRooms.splice(i, 1);
        this.updateOptions();
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

}
