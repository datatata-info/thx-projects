import { CommonModule, KeyValue } from '@angular/common';
import { Component, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { Emojis } from '../../services/emoji/emoji';

// interface EmojiList {
//   value: {
//     [key: string]: any
//   }
// }

@Component({
  selector: 'thx-emoji',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './emoji.component.html',
  styleUrl: './emoji.component.scss'
})
export class EmojiComponent implements OnInit {

  @Output('selected') selected: EventEmitter<string> = new EventEmitter();
  @Output('onClose') onClose: EventEmitter<any> = new EventEmitter();

  emojis: any = JSON.parse(JSON.stringify(Emojis)); // deep copy

  

  constructor(
    private elm: ElementRef
  ){}

  ngOnInit(): void {
    console.log('deep copy emojis', this.emojis)
    if (this.elm) {
      this.elm.nativeElement.addEventListener('click', (e: any) => {
        console.log('clicked target', e.target.classList);
        const target = e.target;
        if (target.classList.contains('emoji-item')) {
          // console.log('target value', target.innerText);
          this.onSelect(target.innerText);
        } else {
          this.close();
        }
      });
    }
  }

  onSelect(emoji: string): void {
    this.selected.emit(emoji);
    // this.close();
  }

  close(): void {
    this.onClose.emit();
  }

  // Preserve original property order
  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }

}
