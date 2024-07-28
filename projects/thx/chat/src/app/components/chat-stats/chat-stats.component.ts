/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// services
import { TimerService, TimerData } from '../../services/timer/timer.service';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'thx-chat-stats',
  standalone: true,
  imports: [ MaterialModule ],
  templateUrl: './chat-stats.component.html',
  styleUrl: './chat-stats.component.scss'
})
export class ChatStatsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('showMore') showMoreElm!: ElementRef;

  private timerSub: Subscription = new Subscription();
  timerData!: string;
  private elmBox: any;
  private minHeight!: number;

  constructor(
    private elm: ElementRef,
    private timerService: TimerService
  ){}

  ngOnInit(): void {
    this.timerSub = this.timerService.subscribeTimer().subscribe({
      next: (data: TimerData) => {
        // console.log('timer data', data.readable);
        this.timerData = data.readable;
      },
      complete: () => console.log('timer complete'),
      error: (e: any) => console.error(e)
    })
  }

  ngAfterViewInit(): void {
    if (this.elm) {
      this.elmBox = this.elm.nativeElement.getBoundingClientRect();
      this.minHeight = this.elmBox.height;
      console.log('elmBox', this.elmBox);
    }
    if (this.showMoreElm) {
      this.listenShowMore(this.showMoreElm.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.timerSub.unsubscribe();
  }

  private listenShowMore(elm: HTMLElement): void {
    elm.addEventListener('touchstart', this.touchStart.bind(this));
    elm.addEventListener('touchmove', this.touchMove.bind(this));
    elm.addEventListener('touchend', this.touchEnd.bind(this));
    elm.addEventListener('touchcancel', this.touchEnd.bind(this));
    // todo mouse
  }

  private touchStart(e: TouchEvent | MouseEvent): void {
    console.log('touchstart', e);
  }  

  private touchMove(e: TouchEvent | MouseEvent): void {
    // console.log('touchmove', e);
    if (e instanceof TouchEvent && e.touches) {
      // console.log('screen.height', screen.height);
      // console.log('clientY', e.touches[0].clientY);
      const y = e.touches[0].clientY - this.elmBox.top;
      if (y >= this.minHeight && y < screen.height - this.elmBox.top) {
        this.elm.nativeElement.style.height = `${y}px`;
      }
    }
  }

  private touchEnd(e: TouchEvent | MouseEvent): void {
    console.log('touchend | touchcancel', e);
  }
}
