import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize, map, startWith,  } from 'rxjs/operators';
import { trigger, transition, animate, style } from '@angular/animations';
import {Observable} from 'rxjs';
import { MediaObserver } from '@angular/flex-layout';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { PublicService } from '../public.service';
import { ReportWorker } from '../../web-workers/report-worker';
import * as FileSaver from 'file-saver';


import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import { AuthService } from '../../auth/auth.service';
import { formatDate } from '@angular/common';

import { SeguimientoDialogComponent } from '../seguimiento-dialog/seguimiento-dialog.component';
import { DetailsComponentQuejaSugerencia } from '../details-queja-sugerencia/details-queja-sugerencia.component'


@Component({
  selector: 'lista-qj-generales',
  templateUrl: './lista-qj-generales.component.html',
  styleUrls: ['./lista-qj-generales.component.css'],
  animations: [
    trigger('buttonInOut', [
        transition('void => *', [
            style({opacity: '1'}),
            animate(200)
        ]),
        transition('* => void', [
            animate(200, style({opacity: '0'}))
        ])
    ])
  ],
  providers:[
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false, showError: true } }
  ]
})
export class ListaQJGeneralesComponent implements OnInit {

  isLoading: boolean = false;
  isLoadingPDF: boolean = false;
  isLoadingPDFArea: boolean = false;
  isLoadingAgent: boolean = false;
  mediaSize: string;

  dataQS:any = '';

  showMyStepper:boolean = false;
  showReportForm:boolean = false;
  stepperConfig:any = {};
  reportTitle:string;
  reportIncludeSigns:boolean = false;
 
  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  statusIcon:any = {
    '1-0':'help', //activo
    '1-1':'verified_user', //activo verificado 
    '2':'remove_circle', //baja
    '3':'warning', // No identificado
    '4':'swap_horizontal_circle' //en transferencia
  };

  displayedColumns: string[] = ['folio', 'lugar_acontecimiento', 'motivo', 'observaciones', 'opciones'];
  dataSource: any = [];
  dataSourceFilters: any = [];

  isLoadingEstadosActuales:boolean = false;
  estadosActuales:any[] = [];

  filterChips:any = []; //{id:'field_name',tag:'description',tooltip:'long_description'}
  
  filterCatalogs:any = {};
  filteredCatalogs:any = {};
  catalogos: any = {};

  filterForm = this.fb.group({

    'tipo_incidencia'         : [undefined],
    'tipo_incidencia_id'      : [undefined],
    'fecha_inicio'            : [undefined],
    'fecha_fin'               : [undefined],

  });

  fechaActual:any = '';
  maxDate:Date;
  minDate:Date;


  constructor(
    private sharedService: SharedService,
    private publicService: PublicService,
    private authService: AuthService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public mediaObserver: MediaObserver) { }

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatTable, {static:false}) usersTable: MatTable<any>;
  @ViewChild(MatExpansionPanel, {static:false}) advancedFilter: MatExpansionPanel;

  ngOnInit() {

    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','paginator','filter']);
    console.log(appStoredData);

    if(appStoredData['searchQuery']){
      this.searchQuery = appStoredData['searchQuery'];
    }

    let event = null
    if(appStoredData['paginator']){
      this.currentPage = appStoredData['paginator'].pageIndex;
      this.pageSize = appStoredData['paginator'].pageSize;
      event = appStoredData['paginator'];

      if(event.selectedIndex >= 0){
        // console.log("siguiente", event);
        this.selectedItemIndex = event.selectedIndex;
      }
    }else{
      let dummyPaginator = {
        length: 0,
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        previousPageIndex: (this.currentPage > 0)?this.currentPage-1:0
       };
      this.sharedService.setDataToCurrentApp('paginator', dummyPaginator);
    }

    if(appStoredData['filter']){
      this.filterForm.patchValue(appStoredData['filter']);
    }

    this.fechaActual = new Date();

    this.maxDate = this.fechaActual;

    this.loadDonantesData(event);
    this.loadFilterCatalogs();
    //console.log(this.filteredDiagnosticos);

  }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : value;
  }

  applyFilter(){

    this.selectedItemIndex = -1;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.pageSize;
    this.loadDonantesData(null);

  }

  cleanFilter(filter){
    filter.value = '';
    //filter.closePanel();
  }

  cleanSearch(){
    this.searchQuery = '';
    //this.paginator.pageIndex = 0;
    //this.loadEmpleadosData(null);
  }

  toggleAdvancedFilter(status){

    if(status){
      this.advancedFilter.open();
    }else{
      this.advancedFilter.close();
    }

  }

  public loadFilterCatalogs(){

    this.isLoading = true;
    let carga_catalogos = [
      // {nombre:'seguros',orden:'descripcion'},
      {nombre:'tipo_incidencia', orden:'nombre', filtro_some_id:{campo:'id', valor:[1,2,3] }},
    ];

    this.publicService.obtenerCatalogos(carga_catalogos).subscribe(
      response => {

        this.catalogos = response.data;

        console.log(this.catalogos);

        this.filteredCatalogs['tipo_incidencia'] = this.filterForm.controls['tipo_incidencia_id'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'tipo_incidencia','nombre')));


      },
      errorResponse =>{
        var errorMessage = "Ocurri?? un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
      }
    );
  }

  private _filter(value: any, catalog: string, valueField: string): string[] {
    if(this.catalogos[catalog]){
      let filterValue = '';
      if(value){
        if(typeof(value) == 'object'){
          filterValue = value[valueField].toLowerCase();
        }else{
          filterValue = value.toLowerCase();
        }
      }
      return this.catalogos[catalog].filter(option => option[valueField].toLowerCase().includes(filterValue));
    }
  }

  loadFilterChips(data){
    this.filterChips = [];
    for(let i in data){
      if(data[i]){
        let item = {
          id: i,
          tag: '',
          tooltip: i.toUpperCase() + ': ',
          active: true
        };
        if(i == 'tipo_incidencia_id'){
          item.tag = data[i].nombre;
          item.tooltip += data[i].id;
          if(item.tooltip.length > 20){
            item.tag = "Tipo de Incidencia: "+data[i].nombre;
            item.tooltip = "Incidencia";
          }else{
            item.tag = "Tipo de Incidencia: "+data[i].nombre;
            item.tooltip = "Tipo de Incidencia: "+data[i].nombre.toUpperCase();
          }
        }
        else if (i == 'fecha_inicio') {
          var desde = formatDate(new Date(this.filterForm.value.fecha_inicio), 'yyyy-MM-dd', 'en'); 
          item.tag = desde;
          item.tooltip = "Fecha de Captura (Desde): " + desde;
        }
        else if (i == 'fecha_fin') {
          var hasta = formatDate(new Date(this.filterForm.value.fecha_fin), 'yyyy-MM-dd', 'en');
          item.tag = hasta;
          item.tooltip = "Fecha de Captura (Hasta): " + hasta;
        }
        this.filterChips.push(item);
      }
    }
  }

  public loadDonantesData(event?:PageEvent){

    this.isLoading = true;
    let params:any;
    if(!event){
      params = { page: 1, per_page: this.pageSize }
    }else{
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }

    if(event && !event.hasOwnProperty('selectedIndex')){
      this.selectedItemIndex = -1;
    }
    
    params.query = this.searchQuery;

    let filterFormValues = this.filterForm.value;
    let countFilter = 0;

    this.loadFilterChips(filterFormValues);

    for(let i in filterFormValues){

      if(filterFormValues[i]){

        if(i == 'tipo_incidencia_id'){
          params[i] = filterFormValues[i].id;
        }
        else if (i == 'fecha_inicio') {
          var desde = formatDate(new Date(this.filterForm.value.fecha_inicio), 'yyyy-MM-dd', 'en');
          params[i] = desde;
        }
        else if (i == 'fecha_fin') {
          var hasta = formatDate(new Date(this.filterForm.value.fecha_fin), 'yyyy-MM-dd', 'en');
          params[i] = hasta;
        }
        countFilter++;

      }
    }

    if(countFilter > 0){
      params.active_filter = true;
    }

    if(event){
      this.sharedService.setDataToCurrentApp('paginator',event);
    }

    this.sharedService.setDataToCurrentApp('searchQuery',this.searchQuery);
    this.sharedService.setDataToCurrentApp('filter',filterFormValues);

    this.publicService.getQJGeneralesList(params).subscribe(
      response =>{
        console.log("aca", response.data.data);
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.dataSource = response.data.data;
            this.fechaActual = response.fecha_actual;
            this.resultsLength = response.data.total;
          }else{
            this.dataSource = [];
            this.resultsLength = 0;
          }
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurri?? un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
    return event;
  }


  compareHorarioSelect(op,value){
    return op.id == value.id;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }


  // verDonante(id: number, index: number){
  //   this.selectedItemIndex = index;
    
  //   let paginator = this.sharedService.getDataFromCurrentApp('paginator');
  //   paginator.selectedIndex = index;
  //   this.sharedService.setDataToCurrentApp('paginator',paginator);

  //   let configDialog = {};
  //   if(this.mediaSize == 'xs'){
  //     configDialog = {
  //       maxWidth: '100vw',
  //       maxHeight: '100vh',
  //       height: '100%',
  //       width: '100%',
  //       data:{id: id, scSize:this.mediaSize}
  //     };
  //   }else{
  //     configDialog = {
  //       width: '99%',
  //       maxHeight: '90vh',
  //       height: '643px',
  //       data:{id: id}
  //     }
  //   }

  //   const dialogRef = this.dialog.open(DetailsComponentPaciente, configDialog);

  //   dialogRef.afterClosed().subscribe(valid => {
  //     if(valid){
  //       console.log('Aceptar');
  //     }else{
  //       console.log('Cancelar');
  //     }
  //   });
  // }

  removeFilterChip(item,index){
    this.filterForm.get(item.id).reset();
    this.filterChips[index].active = false;
  }


  confirmDeletePaciente(id:string = ''){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data: {dialogTitle:'Eliminar Persona',dialogMessage:'??Esta seguro de eliminar a la Persona?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(reponse => {
      if(reponse){
        this.publicService.deleteQuejaSugerencia(id).subscribe(
          response => {
            this.loadDonantesData(null);
          }
        );
      }
    });
  }

  toggleReportPanel(){
    this.reportIncludeSigns = false;
    this.reportTitle = 'Reporte de Quejas/Sugerencias/Felicitaciones Generales';

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

    this.showReportForm = !this.showReportForm;
    if(this.showReportForm){
      this.showMyStepper = false;
    }
    //this.showMyStepper = !this.showMyStepper;
  }

  reporteDonantes(){
    //this.showMyStepper = true;
    this.isLoadingPDF = true;
    this.showMyStepper = true;
    this.showReportForm = false;

    let params:any = {};
    let countFilter = 0;

    let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'long', day: '2-digit'}).format(new Date());
    
    let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','filter']);
    //console.log("onlyone",appStoredData);

    params.reporte = 'quejas-sugerencias-general';

    if(appStoredData['searchQuery']){
      params.query = appStoredData['searchQuery'];
    }

    for(let i in appStoredData['filter']){

      if(appStoredData['filter'][i]){

        if(i == 'tipo_incidencia_id'){
          params[i] = appStoredData['filter'][i].id;
        }else if (i == 'fecha_inicio') {
          var desde = formatDate(new Date(this.filterForm.value.fecha_inicio), 'yyyy-MM-dd', 'en');
          params[i] = desde;
        }else if (i == 'fecha_fin') {
          var hasta = formatDate(new Date(this.filterForm.value.fecha_fin), 'yyyy-MM-dd', 'en');
          params[i] = hasta;
        }
        
        countFilter++;

      }

    }

    if(countFilter > 0){
      params.active_filter = true;
    }
    
    this.stepperConfig.steps[0].status = 2;

    this.publicService.getQJGeneralesList(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
          this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = errorMessage;
          this.isLoading = false;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
            this.stepperConfig.steps[0].status = 3;
            this.stepperConfig.steps[1].status = 2;
            this.stepperConfig.currentIndex = 1;
            const reportWorker = new ReportWorker();
            reportWorker.onmessage().subscribe(
              data => {
                this.stepperConfig.steps[1].status = 3;
                this.stepperConfig.steps[2].status = 2;
                this.stepperConfig.currentIndex = 2;

                // console.log("deitaa",data);
                FileSaver.saveAs(data.data,'Reporte de Quejas/Sugerencias/Felicitaciones Generales'+' '+'('+fecha_reporte+')' );
                reportWorker.terminate();

                this.stepperConfig.steps[2].status = 3;
                this.isLoadingPDF = false;
                this.showMyStepper = false;
            });

            reportWorker.onerror().subscribe(
              (data) => {
                //this.sharedService.showSnackBar('Error: ' + data.message,null, 3000);
                this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
                this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = data.message;
                this.isLoadingPDF = false;
                //console.log(data);
                reportWorker.terminate();
              }
            );
            
            let config = {
              title: this.reportTitle,
              showSigns: this.reportIncludeSigns, 
            };
            reportWorker.postMessage({data:{items: response.data, config:config},reporte:'/reporte-quejas-sugerencias-generales'});
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurri?? un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
        this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = errorMessage;
        //this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
        
      }
    );
  }

  QuejaSugerenciaPDF(obj){

    console.log("acaaa",obj);

    //this.selectedItemIndex = index;

      //this.showMyStepper = true;
      this.isLoadingPDF = true;
      this.showMyStepper = true;
      this.showReportForm = false;

      let params:any = {};
      let countFilter = 0;
      let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date());

      let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','filter']);
      
      params.reporte = 'queja-sugerencia-pdf';
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
          FileSaver.saveAs(data.data,'Queja-Sugerencia-General'+'('+fecha_reporte+')');
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
        title: "Registro de Acontecimientos, Queja/Sugerencia Generales",
        showSigns: this.reportIncludeSigns, 
      };
      reportWorker.postMessage({data:{items: obj, config:config, fecha_actual: this.fechaActual},reporte:'/queja-sugerencia-general'});
      this.isLoading = false;
  }

  ImprimirEncuesta(id:any){
    console.log("el id",id);

    this.isLoading = true;

    this.publicService.getQuejaSugerenciaGeneral(id).subscribe(
      response =>{
        
        this.dataQS = response.data;
        this.QuejaSugerenciaPDF(this.dataQS);

        console.log(this.dataQS);

        this.isLoading = false;
      });
  }

  openDialogFormSeguimiento(id:number = 0){


    let configDialog = {};
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        data:{id: id, scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '99%',
        maxHeight: '90vh',
        height: '643px',
        data:{id: id}
      }
    }


    const dialogRef = this.dialog.open(SeguimientoDialogComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log('Aceptar');
        this.selectedItemIndex = -1;
      }else{
        console.log('Cancelar');
        
      }
    });
  }

  verInfoQuejaSugerencia(id: number, index: number){

    console.log("index",index);
    console.log("selected",this.selectedItemIndex);

    this.selectedItemIndex = index;
    
    let paginator = this.sharedService.getDataFromCurrentApp('paginator');
    paginator.selectedIndex = index;
    this.sharedService.setDataToCurrentApp('paginator',paginator);

    let configDialog = {};
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        data:{id: id, scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '99%',
        maxHeight: '90vh',
        height: '643px',
        data:{id: id}
      }
    }

    const dialogRef = this.dialog.open(DetailsComponentQuejaSugerencia, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log('Aceptar');
      }else{
        console.log('Cancelar');
      }
    });
  }

}
