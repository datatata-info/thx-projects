import { TestBed } from '@angular/core/testing';

import { ChatStatsSocketService } from './chat-stats-socket.service';

describe('ChatStatsSocketService', () => {
  let service: ChatStatsSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatStatsSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
