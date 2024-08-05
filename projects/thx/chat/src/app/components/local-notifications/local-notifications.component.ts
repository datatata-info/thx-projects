import { RouterModule } from '@angular/router';
import { Component, Input } from '@angular/core';
import { RoomMessage } from '@thx/socket';
import { MessageComponent } from '../message/message.component';
import { MaterialModule } from '../../modules/material/material.module';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'thx-local-notifications',
  standalone: true,
  imports: [ RouterModule, MessageComponent, MaterialModule ],
  templateUrl: './local-notifications.component.html',
  styleUrl: './local-notifications.component.scss'
})
export class LocalNotificationsComponent {

  @Input('notify') set notify(roomMessage: RoomMessage | null) {
    if (roomMessage) {
      // this.notifications.length = 0;
      // this.notifications.push(roomMessage);
      this.notification = roomMessage;
      this.hiddenNotifications.push(roomMessage);
    }
  }
  notification: RoomMessage | null = null;
  // notifications: RoomMessage[] = [];
  hiddenNotifications: RoomMessage[] = [];

  constructor(
    private chatService: ChatService
  ) {}

  onExpireMessage(roomMessage: RoomMessage): void {
    this.deleteNotification(roomMessage);
  }

  getRoomName(roomId: string): string {
    const room = this.chatService.getSubscribedRoom(roomId);
    if (room) {
      const roomName = room.config.roomName;
      if (roomName) return roomName;
    }
    return '';
  }

  close(roomMessage: RoomMessage): void {
    this.deleteNotification(roomMessage);
  }

  deleteNotification(roomMessage: RoomMessage): void {
    // for (let i = 0; i < this.notifications.length; i++) {
    //   const notification = this.notifications[i];
    //   if (roomMessage.roomId === notification.roomId && roomMessage.message.id === notification.message.id) {
    //     this.notifications.splice(i, 1);
    //     break;
    //   }
    // }
    this.notification = null;
    for (let i = 0; i < this.hiddenNotifications.length; i++) {
      const notification = this.hiddenNotifications[i];
      if (roomMessage.roomId === notification.roomId && roomMessage.message.id === notification.message.id) {
        this.hiddenNotifications.splice(i, 1);
        break;
      }
    }
  }

}
