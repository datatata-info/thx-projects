import { Injectable } from '@angular/core';
import { User } from '@thx/socket';

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

const CHAT_OPTIONS_STORAGE_NAME: string = 'thx-chat-options';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  options!: ChatOptions;
  inRoom!: string;
  private myRooms: string[] = [];

  constructor() {
    this.options = this.getOptions();
  }

  private getOptions(): ChatOptions {
    const defaultOptions: ChatOptions = {
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
    const optionsFromStorage: string | null = localStorage.getItem(CHAT_OPTIONS_STORAGE_NAME)
    if (optionsFromStorage !== null) {
      return JSON.parse(optionsFromStorage);
    }
    this.updateOptions();
    // localStorage.setItem(CHAT_OPTIONS_STORAGE_NAME, JSON.stringify(defaultOptions));
    return defaultOptions;
  }

  saveOptions(options: ChatOptions): void {
    this.options = options;
    this.updateOptions();
  }

  private updateOptions(): void {
    if (this.options) {
      localStorage.setItem(CHAT_OPTIONS_STORAGE_NAME, JSON.stringify(this.options));
    }
  }

  // TODO
  // this should be moved to @thx/socket, as well as a logic with available public rooms
  addMyRoom(roomId: string): void {
    this.myRooms.push(roomId);
  }

  isMyRoom(roomId: string): boolean {
    if (this.myRooms.includes(roomId)) return true;
    return false;
  }

  removeMyRoom(roomId: string): void {
    for (let i = 0; i < this.myRooms.length; i++) {
      const id = this.myRooms[i];
      if (id === roomId) {
        this.myRooms.splice(i, 1);
        break;
      }
    }
  }

  setOption(name: string, value: any): void {
    this.options[name] = value;
    this.updateOptions();
    // localStorage.setItem(CHAT_OPTIONS_STORAGE_NAME, JSON.stringify(this.options));
  }

  getOption(name: string): any {
    return this.options[name as keyof ChatOptions];
  }

  resetOptions(): void {
    localStorage.removeItem(CHAT_OPTIONS_STORAGE_NAME);
    window.location.reload();
  }

  confirmQuestion(question: string): boolean {
    return confirm(question);
  }

  subscribeRoom(subscribe: boolean, roomId: string): void {
    // add to subscribed
    if (subscribe) {
      if (!this.options.subscribedRooms.includes(roomId)) this.options.subscribedRooms.push(roomId);
    // remove from subscribed
    } else {
      for (let i = 0; i < this.options.subscribedRooms.length; i++) {
        const subscribedRoomId = this.options.subscribedRooms[i];
        if (subscribedRoomId === roomId) {
          this.options.subscribedRooms.splice(i, 1);
          break;
        }
      }
    }
    this.updateOptions();
  }

  isRoomSubscribedForNotifications(roomId: string): boolean {
    if (this.options.subscribedRooms.includes(roomId)) return true;
    return false;
  }

}
