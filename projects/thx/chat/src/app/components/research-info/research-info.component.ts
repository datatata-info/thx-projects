import { Component } from '@angular/core';
import { ChatService, ChatOptions } from '../../services/chat/chat.service';

@Component({
  selector: 'thx-research-info',
  standalone: true,
  imports: [],
  templateUrl: './research-info.component.html',
  styleUrl: './research-info.component.scss'
})
export class ResearchInfoComponent {

  lang: string = 'en-US';

  constructor(
    private chatService: ChatService
  ){
    const options: ChatOptions = this.chatService.options;
    this.lang = options.voiceOverOptions.language;
  }

}
