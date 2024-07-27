import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatStatsComponent } from './chat-stats.component';

describe('ChatStatsComponent', () => {
  let component: ChatStatsComponent;
  let fixture: ComponentFixture<ChatStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
