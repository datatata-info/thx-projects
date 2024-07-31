import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribedRoomsMenuComponent } from './subscribed-rooms-menu.component';

describe('SubscribedRoomsMenuComponent', () => {
  let component: SubscribedRoomsMenuComponent;
  let fixture: ComponentFixture<SubscribedRoomsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribedRoomsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscribedRoomsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
