import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// services
import { ChatSocketService } from './services/chat-socket/chat-socket.service';
import { EmojiService } from './services/emoji/emoji.service';
import { ColorService } from './services/color/color.service';
import { ChatService } from './services/chat/chat.service';
// components
import { LocalNotificationsComponent } from './components/local-notifications/local-notifications.component';
// models
import { User, RoomMessage } from '@thx/socket';
// rxjs
import { Subscription } from 'rxjs';


@Component({
  selector: 'thx-root',
  standalone: true,
  imports: [ RouterOutlet, LocalNotificationsComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  
  title = '@thx/chat';
  private user!: User;
  private onMessageNotification: Subscription = new Subscription();
  addNotification: RoomMessage | null = null;

  constructor(
    private chatSocketService: ChatSocketService,
    private emojiService: EmojiService,
    private colorService: ColorService,
    private chatService: ChatService
  ){}

  ngOnInit(): void {
    if (!this.chatService.getOption('user')) {
      this.user = new User(
        this.emojiService.getRandomEmoji('Animals & Nature'),
        this.colorService.generateHslaColors(70, 40)[0]
      );
      // CREATE AND LOGIN USER EVERY NEW SESSION
      // console.log('USER WITH COLOR', this.user);
      
      // set user in chat options
      this.chatService.setOption('user', this.user);
    } else {
      this.user = this.chatService.getOption('user');
    }
    // login user
    this.chatSocketService.login(this.user);

    // notifications
    this.onMessageNotification = this.chatSocketService.onMessage.subscribe({
      next: (roomMessage: RoomMessage) => {
        // this.messages.push(message);
        if (roomMessage && this.chatService.inRoom !== roomMessage.roomId) this.addNotification = roomMessage;
        // this.playSoundIn();
        console.warn('message notification', roomMessage);
      },
      error: (e: any) => console.error(e)
    });
    
  }

  ngOnDestroy(): void {
    // this.chatSocketService.disconnect();
    this.onMessageNotification.unsubscribe();
  }
}
