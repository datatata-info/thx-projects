import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchInfoComponent } from './research-info.component';

describe('ResearchInfoComponent', () => {
  let component: ResearchInfoComponent;
  let fixture: ComponentFixture<ResearchInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
