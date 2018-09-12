import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubbugComponent } from './subbug.component';

describe('SubbugComponent', () => {
  let component: SubbugComponent;
  let fixture: ComponentFixture<SubbugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubbugComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubbugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
