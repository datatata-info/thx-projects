import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
// import { MqttMessageItem } from '../../models/mqtt-message';
// import { ChatMqttService } from '../../services/chat-mqtt/chat-mqtt.service';
import { Message } from '@thx/socket';

@Component({
  selector: 'thx-message',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit, OnDestroy {

  @Input() message!: Message;

  constructor(
    private elm: ElementRef
  ){}

  ngOnInit(): void {
    console.log('message', this.message);
  }

  ngOnDestroy(): void {
    
  }
}
