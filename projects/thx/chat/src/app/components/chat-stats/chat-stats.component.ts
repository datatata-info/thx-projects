import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input
} from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// services
import { TimerService, TimerData } from '../../services/timer/timer.service';
import { ChatStatsSocketService } from '../../services/chat-stats-socket/chat-stats-socket.service';
import { ChatService } from '../../services/chat/chat.service';
import { User, Room, RoomMessage } from '@thx/socket';
// components
import { RadarComponent, RadarData, RadarDataItem, MOCK_DATA } from '@thx/charts';
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

  @ViewChild('showMore') showMoreElm!: ElementRef;
  @Input('roomId') forRoomId!: string | undefined;
  @Input('messageSent') set messageSent(sent: any) {
    this.chatStatsSocketService.onChatMessageSent();
    // here sent only analysis later
    // encryption not work for long data! it has to be used a hybrid crypto (see: verifier in previous version of thx)
    // if (this.room) this.chatStatsSocketService.sendMessage(this.chatStatsSocketService.dataPatterns, this.room.id);
    // if (this.room) this.chatStatsSocketService.sendMessage(this.mockRadarData, this.room.id);
    
  }
  @Input('messageRecieved') set messageRecieved(recieved: any) {
    this.chatStatsSocketService.onChatMessageRecieve();
  }

  mockRadarData: RadarData[] = MOCK_DATA;

  private timerSub: Subscription = new Subscription();
  private enterRoomSub: Subscription = new Subscription();
  private onMessageSub: Subscription = new Subscription();
  
  timerData!: string;
  private elmBox: any;
  private minHeight!: number;
  private user!: User;
  private room!: Room;

  constructor(
    private elm: ElementRef,
    private timerService: TimerService,
    private chatStatsSocketService: ChatStatsSocketService,
    private chatService: ChatService
  ){
    // listeners
    // mouse
    document.addEventListener('mousemove', (e: MouseEvent) => this.chatStatsSocketService.mousePipe(e));
    document.addEventListener('mousedown', (e: MouseEvent) => this.chatStatsSocketService.mousePipe(e));
    document.addEventListener('mouseenter', (e: MouseEvent) => this.chatStatsSocketService.mousePipe(e));
    document.addEventListener('mouseleave', (e: MouseEvent) => this.chatStatsSocketService.mousePipe(e));
    document.addEventListener('mouseup', (e: MouseEvent) => this.chatStatsSocketService.mousePipe(e));
    document.addEventListener('mouseout', (e: MouseEvent) => this.chatStatsSocketService.mousePipe(e));
    document.addEventListener('mouseover', (e: MouseEvent) => this.chatStatsSocketService.mousePipe(e));
    // keys
    document.addEventListener('keydown', (e: KeyboardEvent) => this.chatStatsSocketService.keyPipe(e));
    document.addEventListener('keypress', (e: KeyboardEvent) => this.chatStatsSocketService.keyPipe(e));
    document.addEventListener('keyup', (e: KeyboardEvent) => this.chatStatsSocketService.keyPipe(e));
    // touch
    document.addEventListener('touchcancel', (e: TouchEvent) => this.chatStatsSocketService.touchPipe(e));
    document.addEventListener('touchend', (e: TouchEvent) => this.chatStatsSocketService.touchPipe(e));
    document.addEventListener('touchmove', (e: TouchEvent) => this.chatStatsSocketService.touchPipe(e));
    document.addEventListener('touchstart', (e: TouchEvent) => this.chatStatsSocketService.touchPipe(e));
  }

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

      this.onMessageSub = this.chatStatsSocketService.onMessage.subscribe({
        next: (roomMessage: RoomMessage) => console.log('recieved stats message', roomMessage)
      });
    }
    

  }

  ngAfterViewInit(): void {
    if (this.elm) {
      this.elmBox = this.elm.nativeElement.getBoundingClientRect();
      this.minHeight = this.elmBox.height;
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

  private listenShowMore(elm: HTMLElement): void {
    elm.addEventListener('touchstart', this.touchStart.bind(this));
    elm.addEventListener('touchmove', this.touchMove.bind(this));
    elm.addEventListener('touchend', this.touchEnd.bind(this));
    elm.addEventListener('touchcancel', this.touchEnd.bind(this));
    // todo mouse
  }

  private touchStart(e: TouchEvent | MouseEvent): void {
    console.log('touchstart', e);
  }  

  private touchMove(e: TouchEvent | MouseEvent): void {
    // console.log('touchmove', e);
    if (e instanceof TouchEvent && e.touches) {
      // console.log('screen.height', screen.height);
      // console.log('clientY', e.touches[0].clientY);
      const y = e.touches[0].clientY - this.elmBox.top;
      if (/* y >= this.elmBox.top &&  */y < screen.height - this.elmBox.top) {
        this.elm.nativeElement.style.height = `${y}px`;
      }
    }
  }

  private touchEnd(e: TouchEvent | MouseEvent): void {
    console.log('touchend | touchcancel', e);
  }
}
