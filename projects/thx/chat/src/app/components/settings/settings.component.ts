import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// router
import { RouterModule, Router } from '@angular/router';
// form
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
// services
import { VoiceOverService } from '../../services/voice-over/voice-over.service';
import { ChatService, ChatOptions } from '../../services/chat/chat.service';
import { ColorService } from '../../services/color/color.service';
import { EmojiService } from '../../services/emoji/emoji.service';
import { DialogService, DialogData } from '../../services/dialog/dialog.service';
// rxjs
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'thx-settings',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {

  settingsForm!: FormGroup;
  chatOptions!: ChatOptions;

  private voicesSub: Subscription = new Subscription();
  private hasPushSub: Subscription = new Subscription();
  voiceList: SpeechSynthesisVoice[] = [];
  langVoiceList: SpeechSynthesisVoice[] = [];
  langList: string[] = [];
  appVersion: string = '';
  hasPush: boolean = false;

  constructor(
    private voiceOverService: VoiceOverService,
    private chatService: ChatService,
    private emojiService: EmojiService,
    private colorService: ColorService,
    private location: Location,
    private dialogService: DialogService
  ) {
    this.appVersion = this.chatService.version;
  }

  ngOnInit(): void {
    // push notifications
    this.hasPushSub = this.chatService.hasPush().subscribe({
      next: (hasPush: boolean) => {
        // console.log('hasPush???', hasPush);
        this.hasPush = hasPush;
      },
      error: (e: any) => console.error(e)
    });
    // get chat options
    this.chatOptions = this.chatService.options;
    // set settings form
    this.settingsForm = new FormGroup({
      nickname: new FormControl(this.chatOptions.user?.nickname),
      color: new FormControl(this.chatOptions.user?.color),
      voiceOver: new FormControl(this.chatOptions.voiceOver),
      voiceOverLang: new FormControl(this.chatOptions.voiceOverOptions.language),
      voiceOverVoice: new FormControl(this.chatOptions.voiceOverOptions.voice),
      termsApproved: new FormControl(this.chatOptions.termsApproved)
    });
    console.log('SETTINGS FORM', this.settingsForm.value);
    // voice 
    this.voicesSub = this.voiceOverService.voices.subscribe({
      next: (voices: SpeechSynthesisVoice[]) => {
        console.log('voices', voices);
        if (voices && voices.length) {
          this.voiceList = voices;
          // build available lang list
          for (const voice of voices) {
            const lang = voice.lang;
            if (!this.langList.includes(lang)) {
              this.langList.push(lang);
            }
          }
          // console.log('langs', this.langList);
          // select with default lang
          this.setLangVoiceList(this.voiceOverService.selectedLanguage);
          // console.log('langVoiceList', this.langVoiceList); // filter by lang
          this.voicesSub.unsubscribe();
        }
      },
      error: (e: any) => console.error(e)
    })
  }

  ngOnDestroy(): void {
    this.voicesSub.unsubscribe();
    this.hasPushSub.unsubscribe();
  }

  testSpeak(voiceName: any): void {
    console.log('test speak', voiceName);
    // speak selected voice
    console.log('speak voice', voiceName);
    const voice = this.voiceOverService.findVoiceByNameAndLang(voiceName, this.settingsForm.value.voiceOverLang);
    console.log('lang', this.settingsForm.value.voiceOverLang);
    console.log('selected voice', voice);
    if (voice) this.voiceOverService.selectedVoice = voice;
    this.voiceOverService.speak(voiceName);

  }

  setLangVoiceList(lang: string): void {
    this.langVoiceList.length = 0;
    for (const voice of this.voiceList) {
      if (voice.lang === lang) {
       this.langVoiceList.push(voice);
      }
    }
    // console.log('langVoiceList', this.langVoiceList);
  }

  

  reNickName(): void {
    this.settingsForm.controls['nickname'].setValue(this.emojiService.getRandomAnimalNature());
  }

  reColor(): void {
    const colors = this.colorService.generateHslaColors(
      this.colorService.randomIntFromInterval(40, 90),
      this.colorService.randomIntFromInterval(30, 60)
    );
    console.log('reColor', colors);
    this.settingsForm.controls['color'].setValue(colors[0]);
  }

  // userHasPush(): Subject<boolean> {
  //   return this.chatService.hasPush();
  // }

  notificationsSupported(): boolean {
    return ('Notification' in window);
  }

  handlePushNotifications(): void {
    console.log('request push from settings.component');
    this.chatService.handlePushNotifications(this.dialogService);
  }

  unsubscribePushNotifications(): void {
    this.chatService.unsubscribePushNotifications();
    // this.hasPush = false; // should fire hasPushSub
  }

  saveSttings(): void {
    console.log(this.settingsForm.value);
    const formValue = this.settingsForm.value;
    const options: ChatOptions = {
      user: {
        id: this.chatService.options.user ? this.chatService.options.user.id : '',
        nickname: formValue.nickname,
        color: formValue.color
      },
      subscribedRooms: this.chatService.options.subscribedRooms,
      voiceOver: formValue.voiceOver,
      voiceOverOptions: {
        language: formValue.voiceOverLang,
        voice: formValue.voiceOverVoice
      },
      termsApproved: formValue.termsApproved,
      termsRevision: this.chatService.options.termsRevision
    }
    
    // set user color and nickname
    // this.chatService.user.color = options.user?.color;
    // this.chatService.user.nickname = options.user ? options.user.nickname : this.chatService.user.nickname;
    // select voice on voiceOverService
    if (options.voiceOverOptions.language) {
      const lang = options.voiceOverOptions.language;
      this.voiceOverService.selectedLanguage = lang;
      if (options.voiceOverOptions.voice) {
        const voiceName = options.voiceOverOptions.voice;
        const voice = this.voiceOverService.findVoiceByNameAndLang(voiceName, lang);
        if (voice) {
          this.voiceOverService.selectedVoice = voice;
        }
      } else {
        const voice = this.voiceOverService.chooseDefaultVoice();
        if (voice) {
          this.voiceOverService.selectedVoice = voice;
          options.voiceOverOptions.voice = voice.name;
        }
      }
    }
    // save options
    this.chatService.options = options;
    console.log('settings options', options);
    this.chatService.updateOptions(options);
    // this.router.navigate(['/chat']);
    this.location.back();
  }

  resetChatOptions(): void {
    const dialogData: DialogData = {
      title: $localize `Reset Options`,
      content: $localize `Want to reset all settings to default? You will loose ALL chat subscribtions.`,
      actions: [
        { title: 'Reset', value: 'reset', focus: true, warn: true }
      ]
    };
    const dialogSub: Subscription = this.dialogService.openDialog(dialogData).subscribe({
      next: (value: string) => {
        if (value === 'reset') {
          this.chatService.resetOptions();
        }
        dialogSub.unsubscribe();
      } 
    });
  }

  log(key: any, value: any): void {
    console.log(key, value);
  }


}
