import { RouterModule } from '@angular/router';
import { Component, Input } from '@angular/core';
import { RoomMessage } from '@thx/socket';
import { MessageComponent } from '../message/message.component';
import { ChatSocketService } from '../../services/chat-socket/chat-socket.service';
import { MaterialModule } from '../../modules/material/material.module';

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
      this.notifications.length = 0;
      this.notifications.push(roomMessage);
      this.hiddenNotifications.push(roomMessage);
    }
  }
  notifications: RoomMessage[] = [];
  hiddenNotifications: RoomMessage[] = [];

  constructor(
    private chatSocketService: ChatSocketService
  ) {}

  onExpireMessage(roomMessage: RoomMessage): void {
    this.deleteNotification(roomMessage);
  }

  getRoomName(roomId: string): string {
    const roomName = this.chatSocketService.getRoom(roomId).config.roomName;
    if (roomName) return roomName;
    return '';
  }

  close(roomMessage: RoomMessage): void {
    this.deleteNotification(roomMessage);
  }

  deleteNotification(roomMessage: RoomMessage): void {
    for (let i = 0; i < this.notifications.length; i++) {
      const notification = this.notifications[i];
      if (roomMessage.roomId === notification.roomId && roomMessage.message.id === notification.message.id) {
        this.notifications.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < this.hiddenNotifications.length; i++) {
      const notification = this.hiddenNotifications[i];
      if (roomMessage.roomId === notification.roomId && roomMessage.message.id === notification.message.id) {
        this.hiddenNotifications.splice(i, 1);
        break;
      }
    }
  }

}
