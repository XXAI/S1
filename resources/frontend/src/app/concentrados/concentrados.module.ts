import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { ConcentradosRoutingModule } from './concentrados-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoConcentradoProyectoComponent } from './dialogo-concentrado-proyecto/dialogo-concentrado-proyecto.component';
import { DialogoChecklistFormComponent } from './dialogo-checklist-form/dialogo-checklist-form.component';
import { DialogoComentariosRespuestaComponent } from './dialogo-comentarios-respuesta/dialogo-comentarios-respuesta.component';


@NgModule({
  declarations: [ListaComponent, DialogoConcentradoProyectoComponent, DialogoChecklistFormComponent, DialogoComentariosRespuestaComponent],
  imports: [
    CommonModule,
    SharedModule,
    ConcentradosRoutingModule
  ]
})
export class ConcentradosModule { }
