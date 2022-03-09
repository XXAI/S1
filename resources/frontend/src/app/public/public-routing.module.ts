import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GuessGuard } from '../auth/guess.guard';
import { AuthGuard } from '../auth/auth.guard';

import { RegistroQuejaSugerenciaComponent } from './registro-queja-sugerencia/registro-queja-sugerencia.component';
// import { InfoQrDonanteComponent } from './info-qr-donante/info-qr-donante.component';
import { ListaQuejasSugerenciasComponent } from './lista-quejas-sugerencias/lista-quejas-sugerencias.component';
import { ListaQJGeneralesComponent } from './lista-qj-generales/lista-qj-generales.component';

const routes: Routes = [

  { path: 'registro',          component: RegistroQuejaSugerenciaComponent, canActivate: [GuessGuard]  },
  { path: 'registro/nuevo',    component: RegistroQuejaSugerenciaComponent, data: { hideHeader: true } },


  //{ path: 'qr-donante/:codigo',   component: InfoQrDonanteComponent,    canActivate: [GuessGuard] },
  { path: 'lista-quejas-sugerencias-vehiculares', component: ListaQuejasSugerenciasComponent,   canActivate: [AuthGuard] },
  { path: 'lista-quejas-sugerencias-generales',   component: ListaQJGeneralesComponent,   canActivate: [AuthGuard] },
  //{ path: 'aditar/:id',    component: RegistroQuejaSugerenciaComponent,  canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
