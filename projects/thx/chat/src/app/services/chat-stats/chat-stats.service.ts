import { Injectable } from '@angular/core';

export interface EventData {
  timestamp: number,
  data: TouchData | KeyData | MouseData
}

export interface TouchData {
  type: string,
  changedTouches: any[],
  touches: any[],
  timeStamp: number,
  composed: boolean
}
export interface KeyData {
  type: string,
  timeStamp: number,
  code: string,
  key: string,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean
}
export interface MouseData {
  type: string,
  clientX: number,
  clientY: number,
  timeStamp: number,
  movementX: number,
  movementY: number
}

export interface MessageMetadata {
  sent?: number,
  recieved?: number,
  length: number,
  from?: string
}

export interface DataPaterns {
  touch: EventData[], // TODO: create interface
  key: EventData[], // TODO: create interface
  mouse: EventData[], // TODO: create interface
  messaging: MessageMetadata[]
}

@Injectable({
  providedIn: 'root'
})
export class ChatStatsService {

  dataPatterns: DataPaterns = {
    touch: [],
    key: [],
    mouse: [],
    messaging: []
  }

  constructor() {
    // listeners
    // mouse
    document.addEventListener('mousemove', (e: MouseEvent) => this.mousePipe(e));
    document.addEventListener('mousedown', (e: MouseEvent) => this.mousePipe(e));
    document.addEventListener('mouseenter', (e: MouseEvent) => this.mousePipe(e));
    document.addEventListener('mouseleave', (e: MouseEvent) => this.mousePipe(e));
    document.addEventListener('mouseup', (e: MouseEvent) => this.mousePipe(e));
    document.addEventListener('mouseout', (e: MouseEvent) => this.mousePipe(e));
    document.addEventListener('mouseover', (e: MouseEvent) => this.mousePipe(e));
    // keys
    document.addEventListener('keydown', (e: KeyboardEvent) => this.keyPipe(e));
    document.addEventListener('keypress', (e: KeyboardEvent) => this.keyPipe(e));
    document.addEventListener('keyup', (e: KeyboardEvent) => this.keyPipe(e));
    // touch
    document.addEventListener('touchcancel', (e: TouchEvent) => this.touchPipe(e));
    document.addEventListener('touchend', (e: TouchEvent) => this.touchPipe(e));
    document.addEventListener('touchmove', (e: TouchEvent) => this.touchPipe(e));
    document.addEventListener('touchstart', (e: TouchEvent) => this.touchPipe(e));
  }

  touchPipe(e: TouchEvent): void {
    // this.log('touchPipe', e);
    const data: TouchData = {
      type: e.type,
      changedTouches: new Array(),
      touches: new Array(),
      timeStamp: e.timeStamp,
      composed: e.composed
    };
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch: any = JSON.parse(JSON.stringify(e.changedTouches[i]));
      delete touch.target;
      data.changedTouches.push(touch);
    }
    for (let i = 0; i < e.touches.length; i++) {
      const touch: any = JSON.parse(JSON.stringify(e.touches[i]));
      delete touch.target;
      data.changedTouches.push(touch);
    }
    this.dataPatterns.touch.push({timestamp: performance.now(), data: data});
    // this.log('dataPattern.touch', this.dataPatterns.touch);
  }

  keyPipe(e: KeyboardEvent): void {
    // this.log('keyPipe', e);
    const data: KeyData = {
      type: e.type,
      timeStamp: e.timeStamp,
      code: e.code,
      key: e.key,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    }
    this.dataPatterns.key.push({timestamp: performance.now(), data: data});
    // this.log('dataPatterns.key', this.dataPatterns.key);
  }

  mousePipe(e: MouseEvent): void {
    // this.log('mousePipe', e);
    const data: MouseData = {
      type: e.type,
      clientX: e.clientX,
      clientY: e.clientY,
      timeStamp: e.timeStamp,
      movementX: e.movementX,
      movementY: e.movementY
    }
    this.dataPatterns.mouse.push({timestamp: performance.now(), data: data});
  }

  messagingPipe(sent: boolean, length: number, fromId: string = '') {
    if (sent) {
      this.dataPatterns.messaging.push({
        sent: performance.now(),
        length: length
      })
    } else {
      this.dataPatterns.messaging.push({
        recieved: performance.now(),
        length: length,
        from: fromId
      })
    }
    this.log('messagingPipe', this.dataPatterns.messaging);
  }

  countBigFive(): any[] {
    this.log('-------------------------------------');
    this.log('countBigFive', ':::::::::::::::::::::');
    this.log('-------------------------------------');
    this.log('userCount', this.usersCount());
    this.log('sendMessagesCount', this.sentMessagesCount());
    this.log('sendMessagesLength', this.sentMessagesLength());
    this.log('recievedMessagesCount', this.recievedMessagesCount());
    this.log('recievedMessagesLength', this.recievedMessagesLength());
    this.log('reactionTime', this.reactionTime());
    this.log('keystrokeFreq', this.keystrokeFreq());
    this.log('-------------------------------------');
    const result = [
      { name: 'openess', value: this.countOpeness()},
      { name: 'agreeableness', value: this.countAgreeableness()},
      { name: 'neuroticism', value: this.countNeuroticism()},
      { name: 'extraversion', value: this.countExtraversion()},
      { name: 'consciousness', value: this.countCounciousness()}
    ]
    return result;
  }
  // TODO
  private countOpeness(): number {
    // TODO: define openess (eg. answer on every message, answer quickly, ...)
    // Math.min((recievedMessagesCount / recievedMessagesLenght) / (sentMessagesCount / sentMessagesLength) / ?numberOfUsers, 1)
    
    const openess = ((this.recievedMessagesCount() / this.recievedMessagesLength()) / this.usersCount()) /
    (this.sentMessagesCount() / this.sentMessagesLength());
    
    // const openess = (this.recievedMessagesCount() / this.recievedMessagesLength()) / 
    // (this.sentMessagesCount() / this.sentMessagesLength()) /
    // this.usersCount();
    this.log('opennes', openess)
    return Math.min(
      openess ? openess : 0, 
      1
    );
  }
  private countAgreeableness(): number {
    //  Math.min(((Number(openess.value) + Number(consciousness.value)) / (Number(extraversion.value) + Number(neuroticism.value)) / 2), 1);
    const agreeableness = (
      (this.countOpeness() + this.countCounciousness()) / 
      (this.countExtraversion() + this.countNeuroticism()) / 2
    );
    this.log('agreeableness', agreeableness);
    return Math.min(
      agreeableness ? agreeableness : 0,
      1
    );
  }
  private countNeuroticism(): number {
    // Math.min(((allMyMessagesNumber / allMyWordsNumber) / ((allOthersMessagesNumber / allOthersWordsNumber) / numberOfOtherUsers)) / ((this._reactionTime / 1000) / (this.myKeystrokeFreq / 100)), 1);
    const neuroticism = ((this.sentMessagesCount() / this.sentMessagesLength()) / 
      ((this.recievedMessagesCount() / this.recievedMessagesLength()) / this.usersCount())) / 
      (this.reactionTime() / this.keystrokeFreq());
    this.log('neuroticism', neuroticism);
    return Math.min(
      neuroticism ? neuroticism : 0, 
      1
    );
  }
  private countExtraversion(): number {
    // Math.min((((allOthersMessagesNumber / allOthersWordsNumber) / numberOfOtherUsers) / (allMyMessagesNumber / allMyWordsNumber)), 1);
    const extraversion = ((this.recievedMessagesCount() / this.recievedMessagesLength()) / this.usersCount()) / 
    (this.sentMessagesCount() / this.sentMessagesLength());
    this.log('extraversion', extraversion);
    return Math.min(
      extraversion ? extraversion : 0, 
      1
    );
  }
  private countCounciousness(): number {
    const consciousness = (
      (this.sentMessagesCount() / this.sentMessagesLength()) / 
      ((this.reactionTime())));
    // Math.min(((myAnswerWordsNumber / myAnswerMessagesNumber) / ((this._reactionTime / 1000) / 60)) / 100, 1);
    this.log('consciousness', consciousness);
    return Math.min(
      consciousness ? consciousness : 0, 
      1
    );
  }

  // 
  private recievedMessagesCount(): number {
    let result = 0;
    for (const message of this.dataPatterns.messaging) {
      if (message.recieved) result++;
    }
    return result;
  }

  private recievedMessagesLength(): number {
    let result = 0;
    for (const message of this.dataPatterns.messaging) {
      if (message.recieved) result += message.length;
    }
    return result;
  }

  private sentMessagesCount(): number {
    let result = 0;
    for (const message of this.dataPatterns.messaging) {
      if (message.sent) result++;
    }
    return result;
  }

  private sentMessagesLength(): number {
    let result = 0;
    for (const message of this.dataPatterns.messaging) {
      if (message.sent) result += message.length;
    }
    return result;
  }

  private usersCount(): number {
    let result: string[] = [];
    for (const message of this.dataPatterns.messaging) {
      if (message.recieved && message.from && !result.includes(message.from)) result.push(message.from);
    }
    return result.length;
  }

  private reactionTime(): number {
    let time = 0;
    let reactionCount = 0;
    for (let i = 0; i < this.dataPatterns.messaging.length; i++) {
      const message = this.dataPatterns.messaging[i];
      const previousMessage = this.dataPatterns.messaging[i - 1] ? this.dataPatterns.messaging[i - 1] : null;
      if (
        message.sent &&
        previousMessage &&
        previousMessage.recieved
      ) {
        reactionCount++;
        time += message.sent - previousMessage.recieved;
      }
    }
    return (time / reactionCount) / 1000; // in seconds
  }

  // TODO: better counting (only for writing message)
  private keystrokeFreq(): number {
    let time = 0;
    let keystrokesCount = 0;
    for (let i = 0; i < this.dataPatterns.key.length; i++) {
      const keyData = this.dataPatterns.key[i];
      const previousKeyData = this.dataPatterns.key[i - 1] ? this.dataPatterns.key[i - 1] : null;
      if (keyData.data.type === 'keyup' && previousKeyData) {
        const dist = keyData.timestamp - previousKeyData.timestamp;
        if (dist <= 1000) {
          time += dist;
          keystrokesCount++;
        }
      }
      // if (keyData.data.type === 'keyup') {
      //   if (previousKeyData && keyData.timestamp - previousKeyData.timestamp > 1000) {
      //     time -= keyData.timestamp;
      //   } else {
      //     time += keyData.timestamp;
      //   }
      //   keystrokesCount++;
      // }
    }
    // f = 1 / T;
    return keystrokesCount / (time / 60);
    // for (let i = 0; i < this.dataPatterns.messaging.length; i++) {
    //   const message = this.dataPatterns.messaging[i];
    //   if (i === 0) {
// 
    //   } else {
    //     
    //     for (const keyData of this.dataPatterns.key) {
    //       if (keyData.data.type === 'keyup' && keyData.timestamp >= message.) {
// 
    //       }
    //     }
    //   }
// 
    // }
    // return 0;
  }

  log(key: any, value?: any): void {
    console.log(`🌽 ${key}`, value ? value : '');
  }
}
