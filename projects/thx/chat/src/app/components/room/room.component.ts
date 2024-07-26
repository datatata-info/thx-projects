import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
// components
import { MessageComponent } from '../message/message.component';
// services
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { AudioService } from '../../services/audio/audio.service';
import { AnimalsService } from '../../services/animals/animals.service';
// rxjs
import { Subscription } from 'rxjs';
import { Message, Room, User } from '@thx/socket';

@Component({
  selector: 'thx-room',
  standalone: true,
  imports: [ MessageComponent, ReactiveFormsModule ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy {

  room!: Room;
  user!: User;

  private routeSub: Subscription = new Subscription();
  private roomExistSub: Subscription = new Subscription();
  private joinRoomSub: Subscription = new Subscription();
  private onMessageSub: Subscription = new Subscription();

  messages: Message[] = [];

  sendMessageForm: FormGroup = new FormGroup({
    message: new FormControl('')
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatSocketService: ChatSocketService,
    private audioService: AudioService,
    private animalService: AnimalsService
  ){}

  ngOnInit(): void {
    if (this.chatSocketService.user) this.user = this.chatSocketService.user;
    this.routeSub = this.route.params.subscribe({
      next: (params: any) => {
        console.log('route params', params);
        if (params.roomId) {
          const roomId = params.roomId;
          this.room = this.chatSocketService.getRoom(roomId);
          console.log('room', this.room);
          this.roomExistSub = this.chatSocketService.roomExist(roomId).subscribe({
            next: (roomExist: boolean) => {
              console.log('roomExist?', roomExist);
              if (roomExist) {
                // room exist and im not joined
                if (!this.chatSocketService.isRoomJoined(roomId)) {
                  console.log('im not joined, should join');
                  if (!this.chatSocketService.user) {
                    const nickname = this.animalService.getRandomAnimal();
                    this.chatSocketService.setUserNickname(nickname);
                    this.user = this.chatSocketService.user;
                  }
                  
                  // maybe wait a bit or setUserNickname with callback
                  this.joinRoomSub = this.chatSocketService.joinRoom(roomId).subscribe({
                    next: (room: Room | null) => {
                      if (room) {
                        this.room = room;
                        console.log('room joined', room);
                        this.chatSocketService.join(room);
                        // request handshake
                        this.chatSocketService.requestHandshake(room.id);
                      }
                    },
                    error: (e: any) => console.error(e)
                  })

                }
              // room not exist
              } else {
                // navigate to rooms (root)
                this.router.navigate(['/']);
              }
            },
            error: (e: any) => console.error(e)
          })
        }
        this.routeSub.unsubscribe();
      }
    });

    this.onMessageSub = this.chatSocketService.onMessage.subscribe({
      next: (message: Message) => {
        this.messages.push(message);
        this.playSoundIn();
      },
      error: (e: any) => console.error(e)
    });

    this.checkMessagesExpiration();
  }

  checkMessagesExpiration(): void {
    const loop = () => {
      // console.log('check expiration');
      const now = Date.now();
      for (let i = 0; i < this.messages.length; i++) {
        const m = this.messages[i];
        const created = new Date(m.time).getTime();
        const expiration = m.expiry;
        if (now >= created + expiration) {
          // console.log('should delete message', m);
          this.messages.splice(i, 1);
          this.playSoundOut();
        }
      }
      requestAnimationFrame(loop.bind(this));
    }
    loop();
  }



  ngOnDestroy(): void {
    this.roomExistSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.joinRoomSub.unsubscribe();
    this.onMessageSub.unsubscribe();
  }

  sendMessage(): void {
    console.log('form value', this.sendMessageForm.value);
    const message = this.chatSocketService.sendMessage(this.sendMessageForm.value.message, this.room.id);
    this.messages.push(message); // show my own message
    this.sendMessageForm.reset();
  }

  private playSoundIn(): void {
    const oscillator = this.audioService.createOscilator('sine');
    // c4, d4, e4: 261.63, 293.66, 329.63
    this.audioService.setFrequency(oscillator, 220.00);
    this.audioService.play(oscillator);
    setTimeout(() => this.audioService.setFrequency(oscillator, 293.66), 100);
    setTimeout(() => this.audioService.setFrequency(oscillator, 311.13), 200);
    setTimeout(() => {
      this.audioService.stop(oscillator);
      // this.audioService.stop(oscillator);
      // this.audioService.fadeOut(() => {
      //   this.audioService.stop(oscillator);
      // });
    }, 466);
  }

  private playSoundOut(): void {
    const oscillator = this.audioService.createOscilator('sine');
    // c4, d4, e4: 261.63, 293.66, 329.63
    this.audioService.setFrequency(oscillator, 211.13);
    this.audioService.play(oscillator);
    setTimeout(() => this.audioService.setFrequency(oscillator, 193.66), 100);
    setTimeout(() => this.audioService.setFrequency(oscillator, 120.00), 200);
    setTimeout(() => {
      this.audioService.stop(oscillator);
      // this.audioService.stop(oscillator);
      // this.audioService.fadeOut(() => {
      //   this.audioService.stop(oscillator);
      // });
    }, 466);
  }
}
