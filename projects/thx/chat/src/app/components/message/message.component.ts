import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
// thx
import { Message } from '@thx/socket';
// material
import { MaterialModule } from '../../modules/material/material.module';
// services
import { VoiceOverService } from '../../services/voice-over/voice-over.service';
import { ChatService } from '../../services/chat/chat.service';
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { TimerService, TimerData } from '../../services/timer/timer.service';
// rxjs
import { Subscription } from 'rxjs';


@Component({
  selector: 'thx-message',
  standalone: true,
  imports: [ MaterialModule ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() message!: Message;
  @Output('expired') expired: EventEmitter<string> = new EventEmitter();

  private expiryTimerSub: Subscription = new Subscription();
  expiresInSec: number = this.message ? (this.message.expiry / 1000) : 0;
  userColor!: string;

  constructor(
    private elm: ElementRef,
    private voiceOverService: VoiceOverService,
    private chatService: ChatService,
    private chatSocketService: ChatSocketService,
    private timerService: TimerService
  ){}

  ngOnInit(): void {
    // console.log('message', this.message);
    if (this.message) {
      if (this.message.user && this.message.user.color) {
        this.userColor = this.message.user.color;
      }
      if (this.chatService.useVoiceOver && this.chatSocketService.user.id !== this.message.user.id) {
        this.voiceOverService.speak(`${this.message.user.nickname}: ${this.message.value}`);
      }
  
      this.expiryTimerSub = this.timerService.subscribeTimerWithDuration(this.message.expiry).subscribe({
        next: (data: TimerData) => {
          // console.log('.');
          if (data && data.countable) {
            this.expiresInSec = Math.floor(data.countable / 1000);
          }
          // console.log('messige countdown', data.countable);
        },
        complete: () => {
          // console.log('message timer done');
          this.expired.next(this.message.id);
          this.expiryTimerSub.unsubscribe();
        },
        error: (e: any) => console.error(e)
      })
    }
  }

  ngAfterViewInit(): void {
    if (this.elm && this.userColor) {
      this.elm.nativeElement.style.color = this.userColor;
    }
    // if (this.elm && this.message && this.message.user && this.message.user.color) {
    //   console.log('message color?', this.message.user.color);
    //   this.elm.nativeElement.style.color = this.message.user.color;
    // }
  }

  ngOnDestroy(): void {
    this.expiryTimerSub.unsubscribe();
  }

  getExpiryPercent(): number {
    return ((this.expiresInSec * 1000) * 100) / this.message.expiry;
  }

}
