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
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
// rxjs
import { Subscription } from 'rxjs';

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
  voiceList: SpeechSynthesisVoice[] = [];
  langVoiceList: SpeechSynthesisVoice[] = [];
  langList: string[] = [];

  constructor(
    private voiceOverService: VoiceOverService,
    private chatService: ChatService,
    private emojiService: EmojiService,
    private colorService: ColorService,
    private chatSocketService: ChatSocketService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.chatOptions = this.chatService.options;
    this.settingsForm = new FormGroup({
      nickname: new FormControl(this.chatOptions.user?.nickname),
      color: new FormControl(this.chatOptions.user?.color),
      voiceOver: new FormControl(this.chatOptions.voiceOver),
      voiceOverLang: new FormControl(this.chatOptions.voiceOverOptions.language),
      voiceOverVoice: new FormControl(this.chatOptions.voiceOverOptions.voice),
      termsApproved: new FormControl(this.chatOptions.termsApproved)
    });
    console.log('SETTINGS FORM', this.settingsForm.value);
    this.voicesSub = this.voiceOverService.voices.subscribe({
      next: (voices: SpeechSynthesisVoice[]) => {
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
        }
      },
      error: (e: any) => console.error(e)
    })
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

  ngOnDestroy(): void {
    this.voicesSub.unsubscribe();
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
    // save options
    this.chatService.saveOptions(options);
    // set user color and nickname
    this.chatSocketService.user.color = options.user?.color;
    this.chatSocketService.user.nickname = options.user ? options.user.nickname : this.chatSocketService.user.nickname;
    // select voice on voiceOverService
    if (options.voiceOverOptions.language) {
      const lang = options.voiceOverOptions.language;
      this.voiceOverService.selectedLanguage = lang;
      if (options.voiceOverOptions.voice) {
        const voiceName = options.voiceOverOptions.voice;
        const voice = this.voiceOverService.findVoiceByNameAndLang(voiceName, lang);
        if (voice) this.voiceOverService.selectVoice(voice);
      } else {
        this.voiceOverService.chooseDefaultVoice();
      }
    }
    // this.router.navigate(['/chat']);
    this.location.back();
  }

  resetChatOptions(): void {
    if (this.chatService.confirmQuestion($localize `Want to reset all settings to default?`)) {
      this.chatService.resetOptions();
    }
  }

  log(key: any, value: any): void {
    console.log(key, value);
  }


}
