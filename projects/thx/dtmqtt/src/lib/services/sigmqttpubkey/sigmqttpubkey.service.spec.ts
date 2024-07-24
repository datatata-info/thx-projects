import { TestBed } from '@angular/core/testing';

import { SigmqttpubkeyService } from './sigmqttpubkey.service';

describe('SigmqttpubkeyService', () => {
  let service: SigmqttpubkeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SigmqttpubkeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
