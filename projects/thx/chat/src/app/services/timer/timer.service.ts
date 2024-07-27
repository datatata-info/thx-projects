import { Injectable } from '@angular/core';
// rxjs
import { BehaviorSubject, Subscription } from 'rxjs';

export interface TimerData {
  readable: string,
  countable: number
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  constructor() { }

  // timer
  subscribeTimer(): BehaviorSubject<TimerData> {
    let startTime: number = performance.now();
    let timerCanceled: boolean = false;
    // let cancelSub: Subscription = new Subscription();
    const subject: BehaviorSubject<TimerData> = new BehaviorSubject({
      readable: this.msToString(0),
      countable: 0
    });

    // cancelSub = subject.subscribe({
    //   next: (canceled: TimerData | boolean) => {
    //     if (canceled === true) {
    //       timerCanceled = true;
    //       console.log('timer canceled'); // test
    //       cancelSub.unsubscribe();
    //       subject.complete(); // complete subject
    //     }
    //   }
    // });

    const count = () => {
      const time = performance.now() - startTime;
      subject.next({
        readable: this.msToString(time),
        countable: time
      })
      if (!timerCanceled) requestAnimationFrame(count);
    }
    count(); // start count
    return subject;
  }

  // count down
  subscribeTimerWithDuration(duration: number, startFrom?: number): BehaviorSubject<TimerData> {
    const startTime: number = startFrom ? startFrom : Date.now();
    const subject: BehaviorSubject<TimerData> = new BehaviorSubject({
      readable: this.msToString(duration),
      countable: duration
    });
  
    const count = () => {
      const distance = Date.now() - startTime;
      // console.log('countdown distance', distance);
      if (distance <= duration) {
        subject.next({
          readable: this.msToString(duration - distance),
          countable: duration - distance
        });
        requestAnimationFrame(count);
        
      } else {
        subject.next({
          readable: this.msToString(0),
          countable: 0
        });
        subject.complete();
      }
    }
    count();
    return subject;
  }

  private msToString(s: number): string {
    // Pad to 2 or 3 digits, default is 2
    const pad = (n: number, z?: number) => {
      z = z || 2;
      return ('00' + n).slice(-z);
    }

    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;

    return /* pad(hrs) + ':' +  */pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);

  }
}
