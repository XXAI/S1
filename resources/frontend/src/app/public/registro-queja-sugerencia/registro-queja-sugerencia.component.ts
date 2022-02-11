import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { PublicService } from '../public.service';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../shared/shared.service';
import { Router, ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';

import { DetailsComponentImg } from '../details-img/details-img.component';
import { environment } from 'src/environments/environment';
import { ImageCroppedEvent, ImageCropperComponent }  from 'ngx-image-cropper';

import { MediaObserver } from '@angular/flex-layout';

import { ReportWorker } from '../../web-workers/report-worker';
import * as FileSaver from 'file-saver';



@Component({
  selector: 'registro-queja-sugerencia',
  templateUrl: './registro-queja-sugerencia.component.html',
  styleUrls: ['./registro-queja-sugerencia.component.css']
})
export class RegistroQuejaSugerenciaComponent implements OnInit {

  isLoading:boolean;
  isValidatingCURP:boolean;
  CURP:string;
  mediaSize: string;

  queja_sugerencia_id:number = 0;
  queja_sugerencia:any = {};

  catalogos: any = {};
  filteredCatalogs:any = {};

  isLoadingPDF: boolean = false;
  showMyStepper:boolean = false;
  showReportForm:boolean = false;
  stepperConfig:any = {};
  reportTitle:string;
  reportIncludeSigns:boolean = false;

  selectedItemIndex: number = -1;
  fechaActual:any = '';

  isLinear:boolean = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  quejaSugerenciaForm:FormGroup;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  FotoQuejaSugerencia:File  = null;

  minDate:any = '';
  maxDate:any = '';

  public url_img_evidencia: string = `${environment.base_url}/adjunto/evidencias/`;
  

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private snackBar: MatSnackBar,
    private sharedService: SharedService,
    public router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public mediaObserver: MediaObserver
  ) {}

  ngOnInit() {

    this.CURP = '';

    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    // this.firstFormGroup = this._formBuilder.group({
    //   firstCtrl: ['', Validators.required]
    // });
    // this.secondFormGroup = this._formBuilder.group({
    //   secondCtrl: ['', Validators.required]
    // });

    let fecha = new Date();
    this.fechaActual = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.minDate = new Date(2022, 0, 1);
    this.maxDate = fecha;


    this.quejaSugerenciaForm = this.fb.group ({

      id:[''],
      folio:[''],
      motivo:['',Validators.required],
      observaciones:[''],
      lugar_acontecimiento:[''],
      fecha_acontecimiento:[,Validators.required],
      numero_de_placa:[''],
      foto:[''],
      extension:[''],
      esAnonimo:[0,Validators.required],
      nombre_completo:[''],
      numero_celular:[''],
      evidencias: this.fb.group({
        img: this.fb.array([])
      }),

    });

    this.quejaSugerenciaForm.get('fecha_acontecimiento').patchValue(this.formatoFecha(fecha));

    this.route.params.subscribe(params => {
      
      this.queja_sugerencia_id = params['id'];
      if(this.queja_sugerencia_id){

        this.obtenerQuejaSugerencia();

        console.log("hay un ID");

      }

  });

    //this.IniciarCatalogos(null);


  }

  formatoFecha(date) {

    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + (d.getDate() + 1);
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');

  }


  // public IniciarCatalogos(obj:any)
  // {
  //   this.isLoading = true;

  //   let carga_catalogos = [
  //     {nombre:'estados',orden:'nombre'},
  //     {nombre:'seguros',orden:'descripcion'},
  //   ];

  //   this.publicService.obtenerCatalogos(carga_catalogos).subscribe(
  //     response => {

  //       this.catalogos = response.data;

  //       this.filteredCatalogs['estados'] = this.quejaSugerenciaForm.get('entidad_federativa_id').valueChanges.pipe(startWith(''),map(value => this._filter(value,'estados','nombre')));
  //       this.filteredCatalogs['seguros'] = this.quejaSugerenciaForm.get('seguro_id').valueChanges.pipe(startWith(''),map(value => this._filter(value,'seguros','descripcion')));

      
  //       if(obj)
  //       {
  //         this.quejaSugerenciaForm.get('entidad_federativa_id').setValue(obj.entidad_federativa);
  //         this.quejaSugerenciaForm.get('seguro_id').setValue(obj.seguro);
  //       }
  //       this.isLoading = false; 
  //     } 
  //   );

  // }

  // private _filter(value: any, catalog: string, valueField: string): string[] {
  //   if(this.catalogos[catalog]){
  //     let filterValue = '';
  //     if(value){
  //       if(typeof(value) == 'object'){
  //         filterValue = value[valueField].toLowerCase();
  //       }else{
  //         filterValue = value.toLowerCase();
  //       }
  //     }
  //     return this.catalogos[catalog].filter(option => option[valueField].toLowerCase().includes(filterValue));
  //   }
  // }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : value;
  }

  validarCurp(){
    if(this.CURP.length == 18){
      this.isValidatingCURP = !this.isValidatingCURP;
    }else{
      console.log('CURP invalida');
    }
  }



  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    console.log(this.imageChangedEvent);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.FotoQuejaSugerencia = this.base64ToFile(
      event.base64,
      this.imageChangedEvent.target.files[0].name,
    );
      console.log("ajaa",this.FotoQuejaSugerencia);
  }

  base64ToFile(data, filename) {

    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  imageLoaded() {
    // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }

  error_archivo = false;
  seleccionarImagenBase64(evt, modelo, multiple: boolean = false, index: number = 0) {

    
      const imagenes = <FormArray>this.quejaSugerenciaForm.get('evidencias')['controls']['img'];

      console.log("las imagenes",imagenes);
      
      var files = evt.target.files;
      var esto = this; var fotos = [];
      esto.error_archivo = false; 
      if (!multiple) {
          var file = files[0];
          if (files && file) {
              var reader = new FileReader();
              reader.readAsBinaryString(file);
              reader.onload = (function (theFile) {
                  return function (e) {
                      try {                            
                          modelo.patchValue(btoa(e.target.result));
                          
                      } catch (ex) {
                          esto.error_archivo = true;
                      }
                  }
              })(file);
          }
      }
      else {
          var objeto = [];let este = this;
          for (var i = 0, f; f = files[i]; i++) {
              var reader = new FileReader();
              reader.readAsBinaryString(f);
              
              reader.onload = (function (theFile) {
                  return function (e) {
                      try {
                          modelo.push(este.fb.group(
                                  {
                                      foto: [btoa(e.target.result)],
                                      es_url:false
                                  }
                              )
                          );
                          imagenes.patchValue(modelo);
                      } catch (ex) {
                          esto.error_archivo = true;
                      }
                  }
              })(f);
          }
      }
      
  }

  // borrarItemFoto;
  // borrarItemCarpeta;
  // borrarId;
  // borrarImagen(evt, modelo, carpeta, id): void {
  //     this.borrarId = id;
  //     this.borrarItemFoto = modelo;
  //     this.borrarItemCarpeta = carpeta;
  // }

  quitar_imagen_array(index: number) {

    let imagen_cargada = <FormArray>this.quejaSugerenciaForm.get('evidencias')['controls']['img'];

    imagen_cargada.removeAt(index);
  }

  verImagen(index:number){

    let imagen_cargada = <FormArray>this.quejaSugerenciaForm.get('evidencias')['controls']['img'].value[index].foto;

    const img = 'data:image/jpg;base64,'+imagen_cargada;

    let configDialog = {};
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        data:{img: img, scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '99%',
        maxHeight: '90vh',
        height: '643px',
        data:{img: img}
      }
    }

    const dialogRef = this.dialog.open(DetailsComponentImg, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log('Aceptar');
      }else{
        console.log('Cancelar');
      }
    });
  }


  soloNumeros(event): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  es_anonimo(val){

    (val == 1) ? this.quejaSugerenciaForm.get('esAnonimo').patchValue(1) : this.quejaSugerenciaForm.get('esAnonimo').patchValue(0), this.quejaSugerenciaForm.get('nombre_completo').reset(), this.quejaSugerenciaForm.get('numero_celular').reset();

  }

  guardarQuejaSugerencia(){

    let datos =  this.quejaSugerenciaForm.value;

    // if(formData.entidad_federativa_id){
    //   formData.entidad_federativa_id = formData.entidad_federativa_id.id;
    // }

    // if(formData.seguro_id){
    //   formData.seguro_id = formData.seguro_id.id;
    // }

    // let datos = {
    //   data: formData
    // }



    this.isLoading = true;

    if(this.queja_sugerencia_id > 0 ){

      this.publicService.updateQuejaSugerencia(this.queja_sugerencia_id, datos).subscribe(
        response =>{
          //this.dialogRef.close(true);
          this.isLoading = false;

          var Message = "";            

          Message = "Se Editaron los datos del queja_sugerencia: "+" "+response.data.nombre+" "+response.data.apellido_paterno+" "+response.data.apellido_materno+" "+" con Éxito!";

          this.sharedService.showSnackBar(Message, 'Cerrar', 5000);
          this.router.navigate(['/queja_sugerencias']);

        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
      });

    }else{

      console.log('formulaaario', datos);

      this.publicService.createQuejaSugerencia(datos, this.FotoQuejaSugerencia, '').subscribe(
        response =>{
          console.log(response);
          this.isLoading = false;



          if(response.status != 409){

            var Message = "Queja/Sugerencia "+"con Folio: "+response.datos.folio+" Registrada con Éxito!";

            this.sharedService.showSnackBar(Message, 'Cerrar', 5000);

            //this.QRqueja_sugerencia(response.datos, response.datos.folio);
            this.quejaSugerenciaForm.reset();
            let evidencias = <FormArray>this.quejaSugerenciaForm.get('evidencias')['controls']['img'];

            while (evidencias.length !== 0) {
              evidencias.clear();
            }

            this.quejaSugerenciaForm.get('evidencias').reset();
            //this.router.navigate(['/qr-queja_sugerencia/'+response.datos.codigo]);

          }else if(response.status == 409){

            var error = response.errores.curp[0];

            this.sharedService.showSnackBar(error, 'Cerrar', 3000);

          }

          errorResponse => {
            console.log(errorResponse.error.errores);
            this.reponseErrorsPaciente(errorResponse);
            this.isLoading = false;
          }
          

      });

    }

  }

  obtenerQuejaSugerencia():void{
    this.isLoading = true;
    
    this.publicService.getQuejaSugerencia(this.queja_sugerencia_id).subscribe(
      response => {

        this.queja_sugerencia = response?.queja_sugerencia;        
        this.quejaSugerenciaForm.reset();
        this.quejaSugerenciaForm.patchValue(response.queja_sugerencia);
        
        //this.IniciarCatalogos(response.queja_sugerencia);

        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
  }

  reponseErrorsPaciente(errorResponse:any){

    if(errorResponse.error.errores){

      for(let i in errorResponse.error.errores){

        if(i == 'curp'){
          let errores = errorResponse.error.errores[i];
          for(let j in errores){

              let message = errores[j];

              this.sharedService.showSnackBar(message, 'Cerrar', 7000);
          }
          break;
        }
      }
    }
  }

  QRqueja_sugerencia(obj, index){

    console.log("acaaa",obj);

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
      reportWorker.postMessage({data:{items: obj, config:config, fecha_actual: this.fechaActual},reporte:'/registro-queja_sugerencia'});
      this.isLoading = false;
  }


}
