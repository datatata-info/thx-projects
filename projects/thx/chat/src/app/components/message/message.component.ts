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
import { TimerService, TimerData } from '../../services/timer/timer.service';
import { AudioService } from '../../services/audio/audio.service';
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
    private timerService: TimerService,
    private audioService: AudioService
  ){}

  ngOnInit(): void {
    // console.log('message', this.message);
    if (this.message) {
      if (this.message.user && this.message.user.color) {
        this.userColor = this.message.user.color;
      }
      if (this.chatService.user.id !== this.message.user.id) {
        // voice over
        if (this.chatService.options.voiceOver) {
          const utterance = `${this.message.user.nickname}: ${this.message.value}`;
          this.voiceOverService.speak(utterance)
          .then(() => console.log(`${utterance} spoken...`))
          .catch((e: any) => console.error(e));
        }
        // sound
        this.playSoundIn();
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
    this.playSoundOut();
    this.expiryTimerSub.unsubscribe();
  }

  getExpiryPercent(): number {
    return ((this.expiresInSec * 1000) * 100) / this.message.expiry;
  }

  private playSoundIn(): void {
    const oscillator = this.audioService.createOscilator('sine');
    // c4, d4, e4: 261.63, 293.66, 329.63
    if (oscillator) {
      console.log('playSoundIn oscillator', oscillator);
      this.audioService.setFrequency(oscillator, 220.00);
      this.audioService.play(oscillator);
      setTimeout(() => this.audioService.setFrequency(oscillator, 293.66), 100);
      setTimeout(() => this.audioService.setFrequency(oscillator, 311.13), 200);
      setTimeout(() => {
        this.audioService.stop(oscillator);
      }, 466);
    }
  }

  private playSoundOut(): void {
    const oscillator = this.audioService.createOscilator('sine');
    // c4, d4, e4: 261.63, 293.66, 329.63
    if (oscillator) {
      console.log('playSoundOut oscillator', oscillator);
      this.audioService.setFrequency(oscillator, 211.13);
      this.audioService.play(oscillator);
      setTimeout(() => this.audioService.setFrequency(oscillator, 193.66), 100);
      setTimeout(() => this.audioService.setFrequency(oscillator, 120.00), 200);
      setTimeout(() => {
        this.audioService.stop(oscillator);
      }, 466);
    }
  }

}
