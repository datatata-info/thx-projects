import { Component, OnInit, OnDestroy } from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// router
import { Router, RouterModule } from '@angular/router';
// services
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { ChatService } from '../../services/chat/chat.service';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'thx-hello',
  standalone: true,
  imports: [ MaterialModule, RouterModule ],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent implements OnInit, OnDestroy {

  private certSub: Subscription = new Subscription();
  canEnterChats: boolean = false;

  constructor(
    private router: Router,
    private chatSocketService: ChatSocketService,
    private chatService: ChatService
  ){}

  ngOnInit(): void {
    console.log('>>>>> hello init...');
    this.certSub = this.chatSocketService.onCertGenerated.subscribe({
      next: (done: boolean) => {
        if (done) {
          console.log('certificate generated');
          this.canEnterChats = true;
          console.log('termsApproved?', this.chatService.options.termsApproved);
          // if terms approved automatically go to chat
          if (this.chatService.options.termsApproved) {
            this.goToRooms();
          }
        }
      },
      error: (e: any) => console.error(e)
    })
  }

  ngOnDestroy(): void {
    this.certSub.unsubscribe();
  }

  goToRooms(): void {
    this.router.navigate(['/chat']);
  }

}
