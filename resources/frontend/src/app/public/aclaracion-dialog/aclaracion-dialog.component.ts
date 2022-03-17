import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { startWith, map } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { PublicService } from '../public.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../shared/shared.service';
import { Router, ActivatedRoute  } from '@angular/router';
import { CustomValidator } from '../../utils/classes/custom-validator';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/models/user';

import { MatDialog} from '@angular/material/dialog';


export interface FormDialogData {
  id: number;
}

@Component({
  selector: 'aclaraciones-dialog',
  templateUrl: './aclaracion-dialog.component.html',
  styleUrls: ['./aclaracion-dialog.component.css']
})
export class AclaracionDialogComponent implements OnInit {

  constructor(
    private publicService: PublicService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AclaracionDialogComponent>,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    public router: Router,

    @Inject(MAT_DIALOG_DATA) public data: FormDialogData
  ) {}

  showSnackBar(message, action, duration){
    this.snackBar.open(message, action,{
      duration: duration
    });
  }

  authUser: User;

  localidadesIsLoading: boolean = false;
  isLoading:boolean = false;
  queja_sugerencia:any = {};

  provideID:boolean = false;

  fechaActual:any = '';
  fechaInicial:any = '';
  maxDate:Date;
  minDate:Date;

  aclaracionForm:FormGroup;



  catalogos: any = {};
  filteredCatalogs:any = {};
  folio_atencion:string = 'ATN';
  hora:any = '';

  selectedItemIndex: number = -1;
  mediaSize: string;




  ngOnInit() {


      this.aclaracionForm = this.fb.group ({
      
        aclaracion: this.fb.group({

          id:[''],
          queja_sugerencia_id:[''],
          estatus_id:[''],
          fecha:[''],
          observaciones:[''],
          user_id:[''],

          folio_queja_sugerencia:['']

        }),

      });


      let id = this.data.id;
      if(id){
        console.log("identificador", id);


        this.isLoading = true;
        this.publicService.getQuejaSugerencia(id).subscribe(
          response => {

              this.queja_sugerencia = response.data;
              
              this.aclaracionForm.controls['aclaracion'].get('folio_queja_sugerencia').patchValue(this.queja_sugerencia.folio);

              console.log("datos QJ",this.queja_sugerencia);
                

              this.isLoading = false;
          },
          errorResponse => {
            console.log(errorResponse);
            this.isLoading = false;
          });
          
          
      }


      let fecha = new Date();
      fecha.setHours(0, 0, 0, 0);
      this.fechaActual = fecha;
  
      this.minDate = new Date(2021, 0, 1);
      this.maxDate = fecha;

      this.authUser = this.authService.getUserData();

      this.aclaracionForm.controls['aclaracion'].get('user_id').patchValue(this.authUser.id);
      this.aclaracionForm.controls['aclaracion'].get('fecha').patchValue(fecha);

      this.IniciarCatalogos(null);

  }


  public IniciarCatalogos(obj:any)
  {
    this.isLoading = true;
    let carga_catalogos = [
      {nombre:'estatus',orden:'nombre'},
    ];

    this.publicService.obtenerCatalogos(carga_catalogos).subscribe(
      response => {

        this.catalogos = response.data;

        this.filteredCatalogs['estatus']        = this.aclaracionForm.controls['aclaracion'].get('estatus_id').valueChanges.pipe(startWith(''),map(value => this._filter(value,'estatus','nombre')));
        
        this.isLoading = false; 
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

  
  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : value;
  }

  saveAclaracion(){

    this.isLoading = true;


    let formData = JSON.parse(JSON.stringify(this.aclaracionForm.controls['aclaracion'].value));

    if(formData.estatus_id){
      formData.estatus_id = formData.estatus_id.id;
      
    }
    parseInt(formData.user_id);

    // let dataAtencion = formData.aclaracion;

    // let datoGuardado = {
    //   atencion: dataAtencion
    // };

    console.log(formData);

    this.publicService.createAclaracion(formData).subscribe(
      response =>{

        console.log(response.messages);
        this.isLoading = false;

        this.dialogRef.close();
        var Message = response.messages;
        //this.verPaciente(formData.paciente.id, null);
        this.sharedService.showSnackBar(Message, 'Cerrar', 3000);
        this.router.navigate(['/lista-quejas-sugerencias-vehiculares'])
        .then(() => {
          window.location.reload();
        });
    },
      errorResponse => {
        console.log(errorResponse);
        this.isLoading = false;
    });

    
  }

  compareMunicipioSelect(op,value){
    return op.id == value.id;
  }

  numberOnly(event): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  
  }



  cargarCamas(event){

    let servicio = event.option.value;

    console.log("serv",servicio.id);

    let carga_catalogos = [
      {nombre:'camas',orden:'numero',filtro_id:{campo:'servicio_id',valor:servicio.id},filtro_secundario_id:{campo:'estatus_cama_id',valor: 1}},
    ];
    this.isLoading = true;

    this.catalogos['camas'] = false;
    this.aclaracionForm.controls['aclaracion'].get('no_cama').reset();
    this.aclaracionForm.controls['aclaracion'].get('camas').reset();

    this.publicService.obtenerCatalogos(carga_catalogos).subscribe(
      response => {
        if(response.data['camas'].length > 0){
          this.catalogos['camas'] = response.data['camas'];
        }else{
          this.aclaracionForm.controls['aclaracion'].get('no_cama').disable();
          this.aclaracionForm.controls['aclaracion'].get('camas').disable();
        }
        
        this.isLoading = false; 
        //this.actualizarValidacionesCatalogos('camas');
      }
    );

  }


  onNoClick(): void {
    this.dialogRef.close();
  }

}