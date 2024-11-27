import { Injectable } from '@angular/core';
import { SocketMessage, ThxProtocolService } from '@thx/protocol';
import { BehaviorSubject } from 'rxjs';
// interfaces
import { Room, User } from '@thx/protocol';
// uuid
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

const APP_OPTIONS = {
  appName: '@thx/protocol-test'
}

@Injectable({
  providedIn: 'root'
})
export class ThxService extends ThxProtocolService {

  override user: User = new User(uuidv4(), {color: 'pink'});

  constructor() {
    super(APP_OPTIONS);
  }

  
}
