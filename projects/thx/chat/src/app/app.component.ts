import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
// services
import { EmojiService } from './services/emoji/emoji.service';
import { ColorService } from './services/color/color.service';
import { ChatService } from './services/chat/chat.service';
import { VoiceOverService } from './services/voice-over/voice-over.service';
import { AudioService } from './services/audio/audio.service';
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
    // private chatSocketService: ChatSocketService,
    private emojiService: EmojiService,
    private colorService: ColorService,
    private chatService: ChatService,
    private voiceOverService: VoiceOverService,
    // private audioService: AudioService
  ){}

  ngOnInit(): void {
    // this.audioService.listenUserEventToActivateContext();
    const chatOptions = this.chatService.options;
    if (chatOptions.voiceOverOptions.language) {
      const lang = chatOptions.voiceOverOptions.language;
      this.voiceOverService.selectedLanguage = lang;
      if (chatOptions.voiceOverOptions.voice) {
        const voiceName = chatOptions.voiceOverOptions.voice;
        const voice = this.voiceOverService.findVoiceByNameAndLang(voiceName, lang);
        console.log('voice on start app', voice);
        if (voice) {
          this.voiceOverService.selectVoice(voice);
          // console.log('selected voice', this.voiceOverService.selectedVoice);
          // this.voiceOverService.speak($localize `Welcome ${chatOptions.user?.nickname}`);
          this.voiceOverService.speak(`Welcome`);
        } else {
          this.chooseDefaultVoice();
        }
      } else {
        this.chooseDefaultVoice();
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
    this.chatService.login(this.user);

    // accept terms
    // if (!chatOptions.termsApproved) {
    //   this.router.navigate(['/terms']); // no way ;)
    // }

    // notifications
    this.onMessageNotification = this.chatService.onMessage.subscribe({
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

  private chooseDefaultVoice(): void {
    const voice = this.voiceOverService.chooseDefaultVoice();
    if (voice) {
      this.voiceOverService.selectVoice(voice);
      this.chatService.options.voiceOverOptions.voice = voice.name;
    }
  }
}
