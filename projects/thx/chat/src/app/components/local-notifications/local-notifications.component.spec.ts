import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalNotificationsComponent } from './local-notifications.component';

describe('LocalNotificationsComponent', () => {
  let component: LocalNotificationsComponent;
  let fixture: ComponentFixture<LocalNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
