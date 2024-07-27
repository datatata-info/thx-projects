import { Component, OnInit, OnDestroy } from '@angular/core';
// services
import { TimerService, TimerData } from '../../services/timer/timer.service';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'thx-chat-stats',
  standalone: true,
  imports: [],
  templateUrl: './chat-stats.component.html',
  styleUrl: './chat-stats.component.scss'
})
export class ChatStatsComponent implements OnInit, OnDestroy {

  private timerSub: Subscription = new Subscription();
  timerData!: string;

  constructor(
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

  ngOnDestroy(): void {
    this.timerSub.unsubscribe();
  }
}
