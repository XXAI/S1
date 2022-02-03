import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicService } from '../public.service';
import { SharedService } from '../../shared/shared.service';
import { Router, ActivatedRoute  } from '@angular/router';

import { ReportWorker } from '../../web-workers/report-worker';
import * as FileSaver from 'file-saver';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


export interface FormDialogData {
  id: number;
}

@Component({
  selector: 'info-qr-donante',
  templateUrl: './info-qr-donante.component.html',
  styleUrls: ['./info-qr-donante.component.css']
})
export class InfoQrDonanteComponent implements OnInit {
  


  constructor(
    private publicService: PublicService,
    private sharedService: SharedService,
    public router: Router,
    private route: ActivatedRoute

  ) {}

  public dialog: MatDialog;
  panelAtencion     = false;
  panelSeguimiento  = false;
  panelEmabarazo    = false;
  panelOpenState    = false;

  dataDonante: any = null;
  codigo:any = "";

  isLoading:boolean = false;

  isLoadingPDF: boolean = false;
  showMyStepper:boolean = false;
  showReportForm:boolean = false;
  stepperConfig:any = {};
  reportTitle:string;
  reportIncludeSigns:boolean = false;

  selectedItemIndex: number = -1;
  fechaActual:any = '';

  ngOnInit() {

    console.log("ONINIIII",this.codigo);

    this.route.params.subscribe(params => {
      
      this.codigo = params['codigo'];
      if(this.codigo){
        //this.registroDonante(this.dataDonante, this.codigo);
        this.cargarDatosPaciente(this.codigo);

      }

  });

    

  }


  cargarDatosPaciente(codigo:any){

    let params = {};
    let query = this.sharedService.getDataFromCurrentApp('searchQuery');

    if(query){
      params['query'] = query;
    }

    this.isLoading = true;

    this.publicService.verInfoDonante(codigo,params).subscribe(
      response =>{
        
        this.dataDonante = response.data;

        this.isLoading = false;
      },
      errorResponse => {
        console.log(errorResponse);

        if(errorResponse.status == 409){

          this.dataDonante = null;

          var Message = errorResponse.error.error.message;
          this.sharedService.showSnackBar(Message, 'Cerrar', 6000);

          this.isLoading = false;

        }
          this.isLoading = false;
      }
    );

  }

  FormatoQRDonante(obj, index){

    this.selectedItemIndex = index;

      //this.showMyStepper = true;
      this.isLoadingPDF = true;
      this.showMyStepper = true;
      this.showReportForm = false;

      let params:any = {};
      let countFilter = 0;
      let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date());

      let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','filter']);
      
      params.reporte = 'registro-donador';
      if(appStoredData['searchQuery']){
        params.query = appStoredData['searchQuery'];
      }
      this.stepperConfig = {
        steps:[
          {
            status: 1, //1:standBy, 2:active, 3:done, 0:error
            label: { standBy: 'Cargar Datos', active: 'Cargando Datos', done: 'Datos Cargados' },
            icon: 'settings_remote',
            errorMessage: '',
          },
          {
            status: 1, //1:standBy, 2:active, 3:done, 0:error
            label: { standBy: 'Generar PDF', active: 'Generando PDF', done: 'PDF Generado' },
            icon: 'settings_applications',
            errorMessage: '',
          },
          {
            status: 1, //1:standBy, 2:active, 3:done, 0:error
            label: { standBy: 'Descargar Archivo', active: 'Descargando Archivo', done: 'Archivo Descargado' },
            icon: 'save_alt',
            errorMessage: '',
          },
        ],
        currentIndex: 0
      }


      this.stepperConfig.steps[0].status = 2;

      this.stepperConfig.steps[0].status = 3;
      this.stepperConfig.steps[1].status = 2;
      this.stepperConfig.currentIndex = 1;

      const reportWorker = new ReportWorker();
      reportWorker.onmessage().subscribe(
        data => {
          this.stepperConfig.steps[1].status = 3;
          this.stepperConfig.steps[2].status = 2;
          this.stepperConfig.currentIndex = 2;

          FileSaver.saveAs(data.data,'Registro-Donador '+'('+fecha_reporte+')');
          reportWorker.terminate();

          this.stepperConfig.steps[2].status = 3;
          this.isLoadingPDF = false;
          this.showMyStepper = false;
      });

      reportWorker.onerror().subscribe(
        (data) => {
          this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
          this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = data.message;
          this.isLoadingPDF = false;
          reportWorker.terminate();
        }
      );
      
      let config = {
        title: "Registro de Donación",
        showSigns: this.reportIncludeSigns, 
      };
      reportWorker.postMessage({data:{items: obj, config:config, fecha_actual: this.fechaActual},reporte:'/registro-donante'});
      this.isLoading = false;
  }


}
