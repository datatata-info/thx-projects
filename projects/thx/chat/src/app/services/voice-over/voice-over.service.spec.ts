import { TestBed } from '@angular/core/testing';

import { VoiceOverService } from './voice-over.service';

describe('VoiceOverService', () => {
  let service: VoiceOverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceOverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
