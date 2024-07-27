import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { Message } from '@thx/socket';
import { MaterialModule } from '../../modules/material/material.module';

@Component({
  selector: 'thx-message-input',
  standalone: true,
  imports: [ ReactiveFormsModule, MaterialModule ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  @Input('roomId') roomId!: string;
  @Output('onMessage') onMessage: EventEmitter<Message> = new EventEmitter()

  constructor(
    private chatSocketService: ChatSocketService
  ) {}

  sendMessageForm: FormGroup = new FormGroup({
    message: new FormControl('')
  });

  sendMessage(): void {
    if (this.roomId) {
      console.log('form value', this.sendMessageForm.value);
      const message = this.chatSocketService.sendMessage(this.sendMessageForm.value.message, this.roomId);
      this.onMessage.next(message);
      // this.messages.push(message); // show my own message
      this.sendMessageForm.reset();
    }
  }

  showEmoji(): void {
    console.log('show emoji');
  }

}
