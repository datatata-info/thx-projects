import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  useVoiceOver: boolean = true;

  constructor() { }

  getRoomHash(topic: string): number {
    let hash = 0, i: number, chr: number;
    for (i = 0; i < topic.length; i++) {
      chr   = topic.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  topicToUrl(topic: string): string {
    return topic.replace(/\//g, '--');
  }

  urlToTopic(url: string): string {
    return url.replace(/\-\-/g, '/');
  }

}
