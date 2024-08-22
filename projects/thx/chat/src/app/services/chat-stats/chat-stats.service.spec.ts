import { TestBed } from '@angular/core/testing';

import { ChatStatsService } from './chat-stats.service';

describe('ChatStatsService', () => {
  let service: ChatStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
