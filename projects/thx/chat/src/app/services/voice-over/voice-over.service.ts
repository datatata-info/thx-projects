import { Injectable } from '@angular/core';
// rxjs
import { Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class VoiceOverService {

  private synth: SpeechSynthesis = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = this.synth.getVoices();
  private selectedVoice!: SpeechSynthesisVoice | null;
  // TODO: choose language EN

  constructor() {
    const userLang = navigator.language;
    console.log('userLang', userLang);
    // console.log('voices', this.voices);
    if (!this.voices.length) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
        this.selectedVoice = this.chooseVoice(this.voices);
      });
    } else {
      this.selectedVoice = this.chooseVoice(this.voices);
    }
  }

  private chooseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // console.log('voices', this.voices);
    for (const voice of voices) {
      // if (voice.default) console.log('default voice', voice);
      if (
        // (voice.default && 
        // voice.lang === 'en-US'/* 'en-GB' */) ||
        (voice.localService && 
        voice.lang === 'en-GB' &&
        !voice.voiceURI.includes('eloquence') &&
        !voice.voiceURI.includes('synthesis') &&
        !voice.voiceURI.includes('speech'))
        // voice.voiceURI.includes('voice') &&
        // voice.voiceURI.includes('compact')
      ) {
        console.log('SELECTED VOICE:', voice);
        return voice; // select first en-GB voice
        break;
      }
    }
    return null;
  }

  speak(utterance: string): Promise<any> {
    const u: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(utterance);
    // console.log('default voice', u.voice);
    if (this.selectedVoice) u.voice = this.selectedVoice;
    this.synth.speak(u);
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
