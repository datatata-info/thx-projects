import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatSocketService } from './services/chat-socket/chat-socket.service';
import { EmojiService } from './services/emoji/emoji.service';
import { ColorService } from './services/color/color.service';
import { User } from '@thx/socket';

@Component({
  selector: 'thx-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  
  title = '@thx/chat';
  private user!: User;

  constructor(
    private chatSocketService: ChatSocketService,
    private emojiService: EmojiService,
    private colorService: ColorService
  ){}

  ngOnInit(): void {
    this.user = new User(
      this.emojiService.getRandomEmoji('Animals & Nature'),
      this.colorService.generateHslaColors(80, 50)[0]
    );
    // CREATE AND LOGIN USER EVERY NEW SESSION
    // console.log('USER WITH COLOR', this.user);
    // login user
    this.chatSocketService.login(this.user);
  }

  ngOnDestroy(): void {
    // this.chatSocketService.disconnect();
  }
}
