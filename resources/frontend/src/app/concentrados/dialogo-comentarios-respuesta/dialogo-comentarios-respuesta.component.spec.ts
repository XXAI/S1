import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoComentariosRespuestaComponent } from './dialogo-comentarios-respuesta.component';

describe('DialogoComentariosRespuestaComponent', () => {
  let component: DialogoComentariosRespuestaComponent;
  let fixture: ComponentFixture<DialogoComentariosRespuestaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoComentariosRespuestaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoComentariosRespuestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
