import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoChecklistFormComponent } from './dialogo-checklist-form.component';

describe('DialogoChecklistFormComponent', () => {
  let component: DialogoChecklistFormComponent;
  let fixture: ComponentFixture<DialogoChecklistFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoChecklistFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoChecklistFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
