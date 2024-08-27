import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Message } from '@thx/socket';
import { MaterialModule } from '../../modules/material/material.module';
import { EmojiComponent } from '../emoji/emoji.component';
import { ChatService } from '../../services/chat/chat.service';
// rxjs
import { Subscription } from 'rxjs';


const SEND_MESSAGE_DELAY: number = 1500;

@Component({
  selector: 'thx-message-input',
  standalone: true,
  imports: [ ReactiveFormsModule, MaterialModule, EmojiComponent ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})

export class MessageInputComponent implements OnInit, OnDestroy {

  @Input('roomId') roomId!: string;
  @Input('color') color!: string | undefined;
  @Output('onMessage') onMessage: EventEmitter<Message> = new EventEmitter();

  connected: boolean = false;
  private connectionSub: Subscription = new Subscription();

  sendMessageForm: FormGroup = new FormGroup({
    message: new FormControl('')
  });

  showEmoji: boolean = false;
  canSendMessage: boolean = false;
  lastMessageSent: number = 0;
  

  constructor(
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // console.log('input color?', this.color);
    this.connectionSub = this.chatService.connected.subscribe({
      next: (connected: boolean) => this.connected = connected
    });

  }

  ngOnDestroy(): void {
    this.connectionSub.unsubscribe();
  }

  getUserNickname(): string {
    return this.chatService.user.nickname;
  }

  sendMessage(): void {
    if (this.roomId) {
      if (this.lastMessageSent === 0 || performance.now() - this.lastMessageSent >= SEND_MESSAGE_DELAY) {
        this.showEmoji = false;
        // console.log('SEND MESSAGE - LAST M SENT?', this.lastMessageSent);
        // console.log('performance.now() - this.lastMessageSent >= SEND_MESSAGE_DELAY', performance.now() - this.lastMessageSent >= SEND_MESSAGE_DELAY);
        const message = this.chatService.sendMessage(this.sendMessageForm.value.message, this.roomId);
        this.onMessage.next(message);
        // this.messages.push(message); // show my own message
        this.sendMessageForm.reset();
        this.lastMessageSent = performance.now();
      } else {
        console.warn('too fast baby ;)');
      }      
    }
  }

  toggleEmoji(): void {
    this.showEmoji = !this.showEmoji;
    // console.log('show emoji');
  }

  hideEmoji(): void {
    this.showEmoji = false;
  }

  onSelectEmoji(emoji: string): void {
    // console.log('selected emoji', emoji);
    // add to message (TODO: check cursor position (save before to focus later)... to add on exact place)
    this.sendMessageForm.setValue({message: (this.sendMessageForm.value.message ? this.sendMessageForm.value.message : '') + ` ${emoji}`}); 
  }

}
