import { v4 as uuidv4 } from 'uuid';

export interface ThxMessage {
  id: string,
  user: User,
  body: any,
  secure: boolean,
  p2p: boolean
}

type ThxMessageParams = {
  user: User,
  body: any,
}

export class ThxMessage {
  id: string = uuidv4();
  user!: User;
  body: any;
  secure: boolean = false;
  p2p: boolean = false;
  constructor(params: ThxMessageParams) {
    this.user = params.user;
    this.body = params.body;
  }
}

export interface SocketServerConfig {
    host: string,
    path?: string,
    port: number,
    useEncryption: boolean
}

export interface SocketMessage {
  cmd: string,
  roomId: string,
  body: any
}

export interface PeerMessage {
  roomId: string,
  socketId: string,
  body: any,
  channel: RTCDataChannel
}

export interface PeerConnectionObject {
  connection: RTCPeerConnection,
  dataChannel: RTCDataChannel | null,
  publicKey: string | undefined,
  userId: string | undefined
}

export interface Room {
    id: string,
    config: RoomConfig,
    // appName: string,
    admin: string,
    size: number,
  }
  
  export interface RoomConfig {
    roomName: string,
    password?: string,
    timer?: number,
    welcomeMessage?: string,
    public: boolean
  }
  
  export interface User {
    id: string,
    nickname: string,
    options?: any // app specific options
    // color?: string,
    // voice?: string
  }
  
  export class User {
    id!: string;
    nickname!: string;
    options?: any
    // color?: string;
    // voice?: string;
  
    constructor(nickname: string, options?: any) {
      this.id = uuidv4();
      this.nickname = nickname;
      if (options) this.options = options;
      // this.color = color ? color : '';
      // if (voice) this.voice = voice;
    }
  }

  // export interface MessageSubject {
  //   type: string, // eg. message, cmd
  //   content: string // or any?
  // }
  
  export interface MessageContent {
    subject: string,
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