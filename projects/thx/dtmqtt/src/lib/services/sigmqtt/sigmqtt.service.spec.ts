import { TestBed } from '@angular/core/testing';

import { SigmqttService } from './sigmqtt.service';

describe('SigmqttService', () => {
  let service: SigmqttService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SigmqttService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
