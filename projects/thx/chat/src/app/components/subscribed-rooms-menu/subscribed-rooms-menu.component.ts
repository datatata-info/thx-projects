import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ChatService } from '../../services/chat/chat.service';
import { Room } from '@thx/socket';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../modules/material/material.module';

@Component({
  selector: 'thx-subscribed-rooms-menu',
  standalone: true,
  imports: [ MatListModule, RouterModule, MaterialModule ],
  templateUrl: './subscribed-rooms-menu.component.html',
  styleUrl: './subscribed-rooms-menu.component.scss'
})
export class SubscribedRoomsMenuComponent {
  constructor(
    private chatService: ChatService,
    private bottomSheetRef: MatBottomSheetRef
  ){}

  getSubscribedRooms(): Room[] {
    return this.chatService.getSubscribedRooms();
  }

  closeMenu(): void {
    this.bottomSheetRef.dismiss();
  }
}
