import { Component, OnInit, OnDestroy } from '@angular/core';
// material
import { MaterialModule } from '../../modules/material/material.module';
// router
import { Router } from '@angular/router';
// services
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'thx-hello',
  standalone: true,
  imports: [ MaterialModule ],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent implements OnInit, OnDestroy {

  private certSub: Subscription = new Subscription();
  canEnterChats: boolean = false;

  constructor(
    private router: Router,
    private chatSocketService: ChatSocketService
  ){}

  ngOnInit(): void {
    console.log('>>>>> hello init...');
    this.certSub = this.chatSocketService.onCertGenerated.subscribe({
      next: (done: boolean) => {
        if (done) {
          console.log('certificate generated');
          // TODO: allow to go to rooms/room
          this.canEnterChats = true;
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
