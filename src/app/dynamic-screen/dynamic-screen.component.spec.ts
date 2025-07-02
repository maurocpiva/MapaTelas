import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicScreenComponent } from './dynamic-screen.component';

describe('DynamicScreenComponent', () => {
  let component: DynamicScreenComponent;
  let fixture: ComponentFixture<DynamicScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
