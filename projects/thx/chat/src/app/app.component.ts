import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatSocketService } from './services/chat-socket/chat-socket.service';

@Component({
  selector: 'thx-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  title = '@thx/chat';

  constructor(
    private chatSocketService: ChatSocketService
  ){}

  ngOnDestroy(): void {
    // this.chatSocketService.disconnect();
  }
}
