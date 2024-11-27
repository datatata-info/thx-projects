import { TestBed } from '@angular/core/testing';

import { ThxService } from './thx.service';

describe('ThxService', () => {
  let service: ThxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
