import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
// services
import { ChatSocketService } from './services/chat-socket/chat-socket.service';
import { EmojiService } from './services/emoji/emoji.service';
import { ColorService } from './services/color/color.service';
import { ChatService } from './services/chat/chat.service';
import { VoiceOverService } from './services/voice-over/voice-over.service';
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
    private chatService: ChatService,
    private voiceOverService: VoiceOverService,
    private router: Router
  ){}

  ngOnInit(): void {
    const chatOptions = this.chatService.options;
    if (chatOptions.voiceOverOptions.language) {
      const lang = chatOptions.voiceOverOptions.language;
      this.voiceOverService.selectedLanguage = lang;
      if (chatOptions.voiceOverOptions.voice) {
        const voiceName = chatOptions.voiceOverOptions.voice;
        const voice = this.voiceOverService.findVoiceByNameAndLang(voiceName, lang);
        if (voice) this.voiceOverService.selectVoice(voice);
      } else {
        this.voiceOverService.chooseDefaultVoice();
      }
    }
    if (!chatOptions.user) {
      const colors = this.colorService.generateHslaColors(
        this.colorService.randomIntFromInterval(40, 90),
        this.colorService.randomIntFromInterval(30, 60)
      );
      this.user = new User(
        this.emojiService.getRandomAnimalNature(),
        colors[0]
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

    // accept terms
    // if (!chatOptions.termsApproved) {
    //   this.router.navigate(['/terms']); // no way ;)
    // }

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
