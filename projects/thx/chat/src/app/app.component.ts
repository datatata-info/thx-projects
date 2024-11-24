import { Component, isDevMode, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
// services
import { EmojiService } from './services/emoji/emoji.service';
import { ColorService } from './services/color/color.service';
import { ChatService } from './services/chat/chat.service';
import { VoiceOverService } from './services/voice-over/voice-over.service';
import { DialogData, DialogService } from './services/dialog/dialog.service';
// components
import { LocalNotificationsComponent } from './components/local-notifications/local-notifications.component';
// models
import { User, RoomMessage } from '@thx/socket';
// rxjs
import { Subscription } from 'rxjs';
// inobounce
// import inobounce from 'inobounce';


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
  private onVoices: Subscription = new Subscription();
  addNotification: RoomMessage | null = null;

  constructor(
    // private emojiService: EmojiService,
    // private colorService: ColorService,
    private chatService: ChatService,
    private voiceOverService: VoiceOverService,
    private dialogService: DialogService
  ){}

  ngOnInit(): void {
    // app options
    const chatOptions = this.chatService.options;
    if (chatOptions.user) {
      this.user = chatOptions.user;
    } else {
      this.user = this.chatService.createUser();
    }
    // login user
    this.chatService.login(this.user);
    // set user as active
    this.chatService.userIsActive();
    // if new sw version available, update by reload
    const updateSub: Subscription = this.chatService.isSwUpdate().subscribe({
      next: (update: boolean) => {
        if (update) {
          const dialogData: DialogData = {
            title: 'Update available',
            content: 'New update available. Do you want to reload the app to take effect?',
            actions: [
              { title: 'Reload', value: 'reload', focus: true }
            ]
          }
          const dialogSub: Subscription = this.dialogService.openDialog(dialogData).subscribe({
            next: (value: string) => {
              if (value === 'reload') {
                window.location.reload();
              }
              dialogSub.unsubscribe();
            }
          });
        }
      },
      complete: () => updateSub.unsubscribe()
    })
    
    
    
    // this.onVoices = this.voiceOverService.voices.subscribe({
    //   next: (voices: SpeechSynthesisVoice[]) => {
    //     if (voices.length) {
    //       if (chatOptions.voiceOverOptions.language) {
    //         const lang = chatOptions.voiceOverOptions.language;
    //         this.voiceOverService.selectedLanguage = lang;
    //         if (chatOptions.voiceOverOptions.voice) {
    //           const voiceName = chatOptions.voiceOverOptions.voice;
    //           const voice = this.voiceOverService.findVoiceByNameAndLang(voiceName, lang);
    //           console.log('voice on start app', voice);
    //           if (voice) {
    //             this.voiceOverService.selectedVoice = voice;
    //           } else {
    //             this.voiceOverService.selectedVoice = this.voiceOverService.chooseDefaultVoice();
    //           }
    //           this.voiceOverService.speak($localize `Hi!`);
    //           chatOptions.voiceOverOptions.voice = this.voiceOverService.selectedVoice ? this.voiceOverService.selectedVoice.name : '';
    //         }
    //       }
    //       if (!chatOptions.user) {
    //         this.user = this.chatService.createUser();
    //         console.log('chatService.options', this.chatService.options);
    //       } else {
    //         this.user = chatOptions.user;
    //         if (!this.user.voice) {
    //           if (chatOptions.voiceOverOptions.voice) {
    //             this.user.voice = chatOptions.voiceOverOptions.voice;
    //           } else {
    //             this.voiceOverService.selectedVoice = this.voiceOverService.chooseDefaultVoice();
    //             this.user.voice = this.voiceOverService.selectedVoice?.name;
    //           }
    //           this.chatService.updateOptions();
    //         }
    //         // this.user.voice = !this.user.voice ? this.voiceOverService.selectedVoice?.name;
// 
    //       }
    //     }
    //     // console.log('voicesSub', voicesSub);
    //     this.onVoices.unsubscribe();
    //   },
    //   error: (e: any) => console.error(e)
    // });

    // internal notifications
    this.onMessageNotification = this.chatService.onMessage.subscribe({
      next: (roomMessage: RoomMessage) => {
        // this.messages.push(message);
        if (roomMessage && this.chatService.inRoom !== roomMessage.roomId) this.addNotification = roomMessage;
        // this.playSoundIn();
        console.warn('message notification', roomMessage);
      },
      error: (e: any) => console.error(e)
    });
    
    window.addEventListener('beforeunload', (event: Event) => {
      this.chatService.userIsNotActive();
    });
    window.addEventListener('unload', (event: Event) => {
      this.chatService.userIsNotActive();
    });
  }

  ngOnDestroy(): void {
    this.onMessageNotification.unsubscribe();
    this.onVoices.unsubscribe();
    this.chatService.userIsNotActive(); // deactivate on close
  }
}
