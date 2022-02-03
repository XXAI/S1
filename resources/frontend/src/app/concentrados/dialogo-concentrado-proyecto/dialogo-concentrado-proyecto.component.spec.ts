import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoConcentradoProyectoComponent } from './dialogo-concentrado-proyecto.component';

describe('DialogoConcentradoProyectoComponent', () => {
  let component: DialogoConcentradoProyectoComponent;
  let fixture: ComponentFixture<DialogoConcentradoProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoConcentradoProyectoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoConcentradoProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
