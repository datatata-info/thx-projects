import { Injectable, isDevMode } from '@angular/core';
// swPush
import { SwPush, SwUpdate } from '@angular/service-worker';
// rxjs
import { Observable, Subject, Subscription } from 'rxjs';
// user
import { User } from './interfaces';
// socket
import { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  private readonly VAPID_PUBLIC_KEY: string = isDevMode() ? 
    'BPL2xam-UTRIqHD05cG-ZZHJFSrfVaRSz2FDGFXRhGyskNBN6RnxsrzJ09Ld1v0I66dVy57fac3IJRaD6Yqx8PM' :
    'BPbN6dLz-JGZunRJymbIhU5PFWeXq6hGSWD6K4e1-pgZEjHsH_llP-OXq6sXVz8eIL0L8pA6cQC10Q5M7hKayus';

  // push notifications
  public onPush: Observable<any> = new Observable();
  public onPushClick: Observable<any> = new Observable();

  // protected swPush!: SwPush;
  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate
  ) {
    this.onPush = this.swPush.messages;
    this.onPushClick = this.swPush.notificationClicks;
  }

  isSwUpdate(): Subject<any> {
    const subject: Subject<any> = new Subject();
    this.swUpdate.checkForUpdate().then((available: boolean) => {
      subject.next(available);
      subject.complete();
    });
    return subject;
  }

  hasPush(user: User, socket: Socket): Subject<boolean> {
    const subject: Subject<boolean> = new Subject();
    if (user && user.id) {
      socket.emit('has_push', user.id, (result: any) => {
        if (result.success) {
          subject.next(result.push); // can be true or false
          subject.complete();
        } else {
          console.error(result.message);
          subject.error(result.message);
          subject.complete();
        }
      });
    } else {
      console.error('No user defined');
      subject.error('No user defined');
      subject.complete();
    }
    return subject;
  }

  requestPushNotifications(user: User, socket: Socket): void {
    console.warn('subsribeNotifications for user', user);
    // create swPush Subscription
    if (!isDevMode()) {
      const pushSub: Subscription = this.subscribeNotifications().subscribe({
        next: (sub: PushSubscription | null) => {
          // if subscribtion, then send with login
          console.log('!!!!! push subsbscribtion', sub);
          if (sub && sub.endpoint) { // no endpoint in Safari
            console.log('subscribe_push', 'TODO on server');
            socket.emit('subscribe_push', user, sub);
          } 
          pushSub.unsubscribe();
        },
        error: (e: any) => {
          pushSub.unsubscribe();
          console.error('PushSubscribtion Error', e);
        }
      })
    } 
  }

  private subscribeNotifications(): Subject<PushSubscription | null> {
    const subject: Subject<PushSubscription | null> = new Subject();
    console.log('........subscribeNotifications........');
    console.warn('VAPID_KEY', this.VAPID_PUBLIC_KEY);
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then((sub: PushSubscription) => {
        subject.next(sub);
        subject.complete();
      })
      .catch((e: any) => {
        subject.next(null);
        subject.complete();
        console.error('PushSubscribption Error', e);
      });
    } else {
      console.log('notifications not enabled || isDevMode');
      subject.next(null);
      subject.complete();
    }
    return subject;
  }
}
