import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// router
import { Router, RouterModule } from '@angular/router';
// temp
import { RadarComponent, RadarData, MOCK_DATA } from '@thx/charts';
// services
import { ChatService } from '../../services/chat/chat.service';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'thx-hello',
  standalone: true,
  imports: [ MaterialModule, RouterModule, RadarComponent ],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent implements OnInit, OnDestroy {

  private certSub: Subscription = new Subscription();
  canEnterChats: boolean = false;
  radarMockData: RadarData[] = MOCK_DATA;

  constructor(
    private router: Router,
    // private chatSocketService: ChatSocketService,
    private chatService: ChatService
  ){}

  ngOnInit(): void {
    console.log('>>>>> hello init...');
    this.certSub = this.chatService.onCertPrepared.subscribe({
      next: (done: boolean) => {
        if (done) {
          console.log('certificate generated');
          this.canEnterChats = true;
          console.log('termsApproved?', this.chatService.options.termsApproved);
          // if terms approved automatically go to chat
          if (this.chatService.options.termsApproved) {
            this.goToRooms();
          }
        }
      },
      error: (e: any) => console.error(e)
    })
  }

  ngOnDestroy(): void {
    this.certSub.unsubscribe();
  }

  goToRooms(): void {
    if (!isDevMode() && this.chatService.options.user) {
      console.log('asking for notifications...')
      const user = this.chatService.options.user;
      if (!("Notification" in window)) {
        console.warn('This browser does not support desktop notification');
        this.router.navigate(['/chat']);
      } else if (Notification.permission === 'granted') {
        // this.chatService.login(this.chatService.options.user);
        this.chatService.requestPushNotifications();
        this.router.navigate(['/chat']);
      } else if (Notification.permission === 'denied' || Notification.permission === 'default') {
        Notification.requestPermission().then((permission: NotificationPermission) => {
          if (permission === 'granted') {
            this.chatService.requestPushNotifications();
            const hello = new Notification('@thx/chat', {
              icon: 'icons/icon-96x96.png',
              body: $localize `Welcome ${user.nickname}`
              // vibrate: [200, 100, 200],
              // timestamp: Date.now()
            });
            console.log('....sending notification');
          }
          this.router.navigate(['/chat']);
          // this.chatService.login(this.user);
        })
      }
    } else {
      this.router.navigate(['/chat']);
    }
    
  }

}
