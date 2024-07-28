import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { Message } from '@thx/socket';
import { MaterialModule } from '../../modules/material/material.module';
import { EmojiComponent } from '../emoji/emoji.component';

@Component({
  selector: 'thx-message-input',
  standalone: true,
  imports: [ ReactiveFormsModule, MaterialModule, EmojiComponent ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent implements OnInit {

  @Input('roomId') roomId!: string;
  @Input('color') color!: string | undefined;
  @Output('onMessage') onMessage: EventEmitter<Message> = new EventEmitter()

  sendMessageForm: FormGroup = new FormGroup({
    message: new FormControl('')
  });

  showEmoji: boolean = false;

  constructor(
    private chatSocketService: ChatSocketService
  ) {}

  ngOnInit(): void {
    console.log('input color?', this.color);
  }

  sendMessage(): void {
    if (this.roomId) {
      this.showEmoji = false;
      console.log('form value', this.sendMessageForm.value);
      const message = this.chatSocketService.sendMessage(this.sendMessageForm.value.message, this.roomId);
      this.onMessage.next(message);
      // this.messages.push(message); // show my own message
      this.sendMessageForm.reset();
    }
  }

  toggleEmoji(): void {
    this.showEmoji = !this.showEmoji;
    console.log('show emoji');
  }

  hideEmoji(): void {
    this.showEmoji = false;
  }

  onSelectEmoji(emoji: string): void {
    console.log('selected emoji', emoji);
    // add to message (TODO: check cursor position (save before to focus later)... to add on exact place)
    this.sendMessageForm.setValue({message: (this.sendMessageForm.value.message ? this.sendMessageForm.value.message : '') + ` ${emoji}`}); 
  }

}
