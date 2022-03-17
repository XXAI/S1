import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { ImageCropperModule } from 'ngx-image-cropper';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { getEspPaginatorIntl } from 'src/app/esp-paginator-intl';

import { PublicRoutingModule } from './public-routing.module';
import { RegistroQuejaSugerenciaComponent } from './registro-queja-sugerencia/registro-queja-sugerencia.component';
import { DetailsComponentImg } from './details-img/details-img.component'

//import { InfoQrDonanteComponent } from './info-qr-donante/info-qr-donante.component';
import { ListaQuejasSugerenciasComponent } from './lista-quejas-sugerencias/lista-quejas-sugerencias.component';
import { ListaQJGeneralesComponent } from './lista-qj-generales/lista-qj-generales.component';
import { AclaracionDialogComponent } from './aclaracion-dialog/aclaracion-dialog.component';



@NgModule({
  declarations: [
    RegistroQuejaSugerenciaComponent,
    ListaQuejasSugerenciasComponent,
    ListaQJGeneralesComponent,
    AclaracionDialogComponent,
    DetailsComponentImg
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatNativeDateModule,
    MatDatepickerModule,
    PublicRoutingModule,
    ImageCropperModule
  ],
  entryComponents:[
    AclaracionDialogComponent
  ],
  providers:[
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX'},
    { provide: MatPaginatorIntl, useValue: getEspPaginatorIntl() }
    
  ]
})
export class PublicModule { }
