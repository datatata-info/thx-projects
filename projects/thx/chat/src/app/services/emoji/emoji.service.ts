import { Injectable } from '@angular/core';
import { Emojis } from './emoji';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {

  constructor() { }

  getRandomEmoji(cat?: string, sub?: string): string {
    const random = (array: any) => array[~~(Math.random() * array.length)];

    cat = !cat ? random(Object.keys(Emojis)) : cat;
    if (cat) {
      sub = !sub ? random(Object.keys(Emojis[cat])) : sub;
      if (sub) {
        return random(Emojis[cat][sub]);
      }
    }

    return '';
  }
}
