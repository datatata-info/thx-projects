import { v4 as uuidv4 } from 'uuid';

export interface SocketServerConfig {
    host: string,
    path?: string,
    port: number,
    useEncryption: boolean
}

export interface Room {
    id: string,
    config: RoomConfig,
    appName: string,
    admin: string,
    size: number,
  }
  
  export interface RoomConfig {
    roomName: string,
    password: string,
    timer: number,
    public: boolean
  }
  
  export interface User {
    id: string,
    nickname: string,
    color?: string,
    voice?: string
  }
  
  export class User {
    id!: string;
    nickname!: string;
    color?: string;
    voice?: string;
  
    constructor(nickname: string, color?: string, voice?: string) {
      this.id = uuidv4();
      this.nickname = nickname;
      this.color = color ? color : '';
      if (voice) this.voice = voice;
    }
  }
  
  export interface MessageContent {
    subject: string | any,
    sharedSecret?: string
    // voice?: string
  }
  
  export interface Message {
    id: string,
    user: User,
    time: Date,
    content: MessageContent,
    expiry: number
  }
  
  export class Message {
    id!: string;
    user!: User;
    time!: Date;
    content!: MessageContent;
    expiry!: number;
    constructor(user: User, content: MessageContent, expiry?: number) {
      this.id = uuidv4();
      this.time = new Date();
      this.expiry = expiry ? expiry : 60 * 1000;
      this.user = user;
      this.content = content;
    }
  }
  
  export interface RoomMessage {
    roomId: string,
    message: Message
  }

  export interface SocketCallback {
    success: boolean,
    message: string,
    data?: any
  }
  
  export interface AppOptions {
    appName: string,
    appTitle?: string,
    appIcon?: string,
    badge?: string
  }