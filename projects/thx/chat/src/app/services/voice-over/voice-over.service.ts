import { Injectable } from '@angular/core';
// rxjs
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class VoiceOverService {

  private synth: SpeechSynthesis = window.speechSynthesis;
  private _voices: SpeechSynthesisVoice[] = this.synth.getVoices();
  // private recognition = new SpeechRecognition(); :/ not supported by firefox
  selectedVoice!: SpeechSynthesisVoice | null;
  selectedLanguage: string = 'en-US';
  voices: BehaviorSubject<SpeechSynthesisVoice[]> = new BehaviorSubject(this._voices);
  userLang: string = navigator.language;
  activated: boolean = false;

  constructor() {
    this.getVoices();
  }

  private getVoices(): void {
    if (this.synth.onvoiceschanged !== undefined) { // add listener for chrome
      this.synth.addEventListener('voiceschanged', () => {
        this._voices = this.synth.getVoices();
        this.voices.next(this._voices);
        this.selectedVoice = this.chooseDefaultVoice();
      });
    } else { // else select directly
      this.voices.next(this._voices);
      this.selectedVoice = this.chooseDefaultVoice();
    }
  }

  toggleActivation(): void {
    this.activated = !this.activated;
    if (this.activated) {
      this.speak($localize `Voice Over activated`);
    }
  }

  // selectVoice(voice: SpeechSynthesisVoice): void {
  //   this.selectedVoice = voice;
  // }

  findVoiceByNameAndLang(name: string, lang: string): SpeechSynthesisVoice | null {
    for (const voice of this._voices) {
      if (voice.name === name && voice.lang === lang) {
        return voice;
      }
    }
    return null;
  }

  chooseDefaultVoice(): SpeechSynthesisVoice | null {
    // console.log('voices', this.voices);
    for (const voice of this._voices) {
      // if (voice.default) console.log('default voice', voice);
      if (
        // (voice.default && 
        // voice.lang === 'en-US'/* 'en-GB' */) ||
        (voice.localService && 
        voice.lang === this.selectedLanguage &&
        !voice.voiceURI.includes('eloquence') &&
        !voice.voiceURI.includes('synthesis') &&
        !voice.voiceURI.includes('speech'))
        // voice.voiceURI.includes('voice') &&
        // voice.voiceURI.includes('compact')
      ) {
        // console.log('SELECTED VOICE:', voice);
        return voice; // select first en-GB voice
      }
    }
    return null;
  }

  speak(utterance: string): Promise<any> {
    const u: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(utterance);
    console.log('voice', this.selectedVoice);
    if (this.selectedVoice) u.voice = this.selectedVoice;
    if (this.activated) this.synth.speak(u);
    return new Promise((resolve: any) => {
      const check = () => {
        if (this.isSpeaking()) {
          // console.log('checking speaking...');
          requestAnimationFrame(check);
        } else {
          resolve();
        }
      }
      setTimeout(() => {
        check();
      }, 500);
      
    });
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  
}
