import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  HostListener
} from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// services
import { TimerService, TimerData } from '../../services/timer/timer.service';
import { ChatStatsSocketService } from '../../services/chat-stats-socket/chat-stats-socket.service';
import { ChatService } from '../../services/chat/chat.service';
import { User, Room, RoomMessage, MessageContent } from '@thx/socket';
import { ColorService } from '../../services/color/color.service';
import { ChatStatsService } from '../../services/chat-stats/chat-stats.service';
// components
import { RadarComponent, RadarData, RadarDataItem, MOCK_DATA, ColorScheme } from '@thx/charts';
import { ConsoleComponent } from '@thx/charts';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'thx-chat-stats',
  standalone: true,
  imports: [
    MaterialModule,
    RadarComponent,
    ConsoleComponent
  ],
  templateUrl: './chat-stats.component.html',
  styleUrl: './chat-stats.component.scss'
})
export class ChatStatsComponent implements OnInit, AfterViewInit, OnDestroy {

  @HostListener('window:resize', ['$event'])
  onResize(event: ResizeObserverEntry) {
    // set minHeight on resize;
    console.log('chat-stats-> window resized');
    if (this.elm) {
      this.elmBox = this.elm.nativeElement.getBoundingClientRect();
      this.statsWidth = this.elmBox.width;
      console.log('--> elmBox', this.elmBox);
      // this.minHeight = this.elmBox.height;
      // console.log('chat-stats->minHeight', this.minHeight);
    }
  }

  @ViewChild('showMore') showMoreElm!: ElementRef;
  @Input('roomId') forRoomId!: string | undefined;
  @Input('messageSent') set messageSent(length: number) {
    if (length) {
      // set on message sent to stats
      // this.chatStatsSocketService.onChatMessageSent(length);
      this.chatStatsService.messagingPipe(true, length);
      // here sent only analysis later
      // encryption not work for long data! it has to be used a hybrid crypto (see: verifier in previous version of thx)
      if (this.room) {
        const bigFive = {
          id: this.user.id,
          name: this.user.nickname,
          color: this.user.color,
          items: this.chatStatsService.countBigFive()
        }
        this.chatStatsSocketService.sendMessage({
          bigFive: bigFive
        }, this.room.id);

        this.addRadarData(bigFive);
      }
    }
    
    // if (this.room) this.chatStatsSocketService.sendMessage(this.mockRadarData, this.room.id);
    
  }
  @Input('messageRecieved') set messageRecieved(obj: any) {
    // set on message recieved length
    // console.log('messageRecieved', obj);
    if (obj && obj.length && obj.fromId) {
      this.chatStatsService.messagingPipe(false, obj.length, obj.fromId);
      // this.chatStatsSocketService.onChatMessageRecieve(obj.length, obj.fromId);
    }
  }

  statsWidth: number = 0;
  mockRadarData: RadarData[] = MOCK_DATA;
  radarData: RadarData[] = [];
  colorScheme: ColorScheme = {
    color: '#0dd',
    background: '#131515',
    colors: ['blue', 'green', 'brown', 'aquamarine'] // this.colorService.generateHslaColors(80, 80, 1.0, 5)
  }

  private timerSub: Subscription = new Subscription();
  private enterRoomSub: Subscription = new Subscription();
  private onMessageSub: Subscription = new Subscription();
  
  timerData!: string;
  private elmBox: any;
  // private minHeight: number = 128;
  private user!: User;
  private room!: Room;

  constructor(
    private elm: ElementRef,
    private timerService: TimerService,
    private chatStatsSocketService: ChatStatsSocketService,
    private chatService: ChatService,
    private chatStatsService: ChatStatsService,
    // private colorService: ColorService
  ){}

  ngOnInit(): void {
    this.timerSub = this.timerService.subscribeTimer().subscribe({
      next: (data: TimerData) => {
        // console.log('timer data', data.readable);
        this.timerData = data.readable;
      },
      complete: () => console.log('timer complete'),
      error: (e: any) => console.error(e)
    });
    // login to stats app
    if (this.chatService.options.user && this.forRoomId) {
      this.user = this.chatService.options.user;
      this.chatStatsSocketService.login(this.user);
      this.enterRoomSub = this.chatStatsSocketService.subscribeRoom(this.forRoomId).subscribe({
        next: (room: Room | null) => {
          if (room) {
            this.room = room;
            this.enterRoomSub.unsubscribe();
            // send test object
            setTimeout(() => {
              // this.chatStatsSocketService.sendMessage({test: 'OK', user: this.user.nickname}, this.room.id);
            }, 2000);
          }
          // else do nothing
        }
      });
      // stats recieved
      this.onMessageSub = this.chatStatsSocketService.onMessage.subscribe({
        next: (roomMessage: RoomMessage) => {
          if (typeof roomMessage.message.content === 'object') {
            const messageSubject: any = roomMessage.message.content.subject;
            // console.log('recieved stats message', messageSubject);
            if (messageSubject.bigFive) {
              // add data to stats
              this.addRadarData(messageSubject.bigFive);
              this.addRadarData({
                id: this.user.id,
                name: this.user.nickname,
                color: this.user.color,
                items: this.chatStatsService.countBigFive()
              });
            }
          }
          
        }
      });
    }
    

  }

  ngAfterViewInit(): void {
    if (this.elm) {
      this.elmBox = this.elm.nativeElement.getBoundingClientRect();
      // this.minHeight = this.elmBox.height;
      this.statsWidth = this.elmBox.width;
      console.log('elmBox', this.elmBox);
    }
    if (this.showMoreElm) {
      this.listenShowMore(this.showMoreElm.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.timerSub.unsubscribe();
    this.enterRoomSub.unsubscribe();
    this.onMessageSub.unsubscribe();
    if (this.room) this.chatStatsSocketService.leaveRoom(this.room.id);
  }

  private addRadarData(radarData: RadarData): void {
    // test
    let replaced = false;
    for (let i = 0; i < this.radarData.length; i++) {
      const data = this.radarData[i];
      if (data.id === radarData.id) {
        this.radarData[i] = radarData;
        replaced = true;
      }
    }
    if (!replaced) this.radarData.push(radarData);
    // console.log('radarData', this.radarData);
    // TODO: add my bifFive
    this.radarData = JSON.parse(JSON.stringify(this.radarData)); // deep copy
  }

  private listenShowMore(elm: HTMLElement): void {
    // elm.addEventListener('touchstart', this.touchStart.bind(this));
    elm.addEventListener('touchmove', this.touchMove.bind(this));
    // elm.addEventListener('touchend', this.touchEnd.bind(this));
    // elm.addEventListener('touchcancel', this.touchEnd.bind(this));
    // todo mouse
  }

  // private touchStart(e: TouchEvent | MouseEvent): void {
  //   console.log('touchstart', e);
  // }  

  private touchMove(e: TouchEvent | MouseEvent): void {
    // console.log('touchmove', e);
    if (e instanceof TouchEvent && e.touches) {
      // console.log('screen.height', screen.height);
      // console.log('e.touches[0]', e.touches[0]);
      // TODO: not works well on ios pwa
      const y = e.touches[0].clientY - this.elmBox.top;
      // console.log('y', y);
      // console.log('screen.height - this.elmBox.top', screen.height - this.elmBox.top);
      if ( y < (screen.availHeight - (1.9 * this.elmBox.top)) ) {
        this.elm.nativeElement.style.height = `${y}px`;
      }
    }
  }

  // private touchEnd(e: TouchEvent | MouseEvent): void {
  //   console.log('touchend | touchcancel', e);
  // }
}
