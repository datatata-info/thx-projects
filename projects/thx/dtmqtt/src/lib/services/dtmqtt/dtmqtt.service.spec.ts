import { TestBed } from '@angular/core/testing';

import { DtmqttService } from './dtmqtt.service';

describe('DtmqttService', () => {
  let service: DtmqttService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DtmqttService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
