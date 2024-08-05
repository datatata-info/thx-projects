import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class AudioService {

  public context: AudioContext = new AudioContext(); // (window.AudioContext || window.webkitAudioContext)
  private gainNode!: GainNode;
  private volume: number = .5;
  private filter!: BiquadFilterNode;
  // private oscillatorType: string = 'sine'; // types: sine, square, sawtooth, triangle, custom
  // for frequencies of notes see https://pages.mtu.edu/~suits/notefreqs.html
  constructor() {
    console.log('AUDIO SERVICE CONSTRUCTOR context', this.context);
    if (!this.context) {
      this.listenUserEventToActivateContext();
    } else {
      this.activateContext();
    }
  }

  private listenUserEventToActivateContext(): void {
    document.addEventListener('click', this.activateContext.bind(this));
    document.addEventListener('touchstart', this.activateContext.bind(this));
    document.addEventListener('keydown', this.activateContext.bind(this));
  }

  private activateContext(): void {
    console.log('activateContext');
    if (!this.context) {
      this.context = new AudioContext();
    }
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
    this.gainNode.gain.value = this.volume;
    this.filter = this.context.createBiquadFilter();
    // remove listeners
    document.removeEventListener('click', this.activateContext);
    document.removeEventListener('touchstart', this.activateContext);
    document.removeEventListener('keydown', this.activateContext);
  }
  // see at https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/type
  // types: sine, square, sawtooth, triangle, custom
  createOscilator(type: OscillatorType): OscillatorNode | null {
    // console.log('createOscilator context', this.context);
    if (!this.context) return null;
    const oscillator: OscillatorNode = new OscillatorNode(this.context, {type: type}); // this.context.createOscillator();
    oscillator.connect(this.gainNode);
    // oscillator.type = type;
    // console.log('oscillator', oscillator);
    return oscillator;
  }

  setVolume(value: number): void {
    this.volume = value; 
    this.gainNode.gain.value = this.volume;
    // this.gainNode.gain.exponentialRampToValueAtTime(value, this.context.currentTime);
    // console.log('volume', this.gainNode.gain.value);
  }

  setFrequency(oscillator: OscillatorNode, value: number/* values: Float32Array | number[] */, startTime: number = this.context.currentTime, duration: number = 2): void {
    // oscillator.frequency.setValueCurveAtTime(values, startTime, duration);
    oscillator.frequency.setValueAtTime(value, startTime);
  }

  play(oscillator: OscillatorNode, when: number = this.context.currentTime): void {
    oscillator.start(when);
  }

  stop(oscillator: OscillatorNode, when: number = this.context.currentTime): void {
    // this.setVolume(0);
    oscillator.disconnect(this.gainNode);
    oscillator.stop(when);
    
  }

  fadeIn(done: any = () => {}): void  {
    const fade = () => {
      if ((this.volume += .1) === 1) {
        // fade done
        done();
      } else {
        this.setVolume(this.volume);
        requestAnimationFrame(fade);
      }
    }
    fade();
  }

  fadeOut(done: any = () => {}): void  {
    const scope = this;
    const volBefore = this.volume; // volume memory
    let vol = this.volume;
    // while (vol >= 0) {
    //   vol -= .1;
    //   this.setVolume(vol);
    // }
    // done();
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + .1);
    setTimeout(() => done(), .2);
    // this.setVolume(volBefore)
    // const fade = () => {
    //   if ((vol -= .1) <= 0) {
    //     // fade done
    //     done();
    //     scope.setVolume(volBefore);
    //   } else {
    //     scope.setVolume(vol);
    //     window.requestAnimationFrame(fade);
    //     // fade();
    //   }
    // }
    // fade(); // start fade
  }




}
