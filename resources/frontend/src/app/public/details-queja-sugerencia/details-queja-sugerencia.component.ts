import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicService } from '../public.service';
import { SharedService } from '../../shared/shared.service';
import { Router, ActivatedRoute  } from '@angular/router';


export interface FormDialogData {
  id: number;
}

@Component({
  selector: 'details-queja-sugerencia',
  templateUrl: './details-queja-sugerencia.component.html',
  styleUrls: ['./details-queja-sugerencia.component.css']
})
export class DetailsComponentQuejaSugerencia implements OnInit {
  


  constructor(
    public dialogRef: MatDialogRef<DetailsComponentQuejaSugerencia>,
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData,
    private publicService: PublicService,
    private sharedService: SharedService,
    public router: Router,

  ) {}

  public dialog: MatDialog;
  panelAtencion     = false;
  panelSeguimiento  = false;
  panelEmabarazo    = false;
  panelOpenState    = false;

  IdActual: number;

  dataQuejaSugerencia: any;

  isLoading:boolean = false;

  displayedColumns: string[] = ['N°', 'Preguntas', 'Respuestas'];
  encuesta: any = [];

  ngOnInit() {


    console.log("LOS DATOS", this.data.id);

    this.cargarDatos(this.data.id);

    




  }


  cargarDatos(id:any){

    let params = {};
    let query = this.sharedService.getDataFromCurrentApp('searchQuery');

    if(query){
      params['query'] = query;
    }

    this.isLoading = true;

    this.publicService.verInfoQuejaSugerencia(id,params).subscribe(
      response =>{
        console.log("en el response del DIALOG",response.data);
        
        this.dataQuejaSugerencia = response.data;

        if(this.dataQuejaSugerencia.preguntas != null && this.dataQuejaSugerencia.respuestas){

          for (let i = 0; i < this.dataQuejaSugerencia.preguntas.length; i++) {

            for (let j = 0; j < this.dataQuejaSugerencia.respuestas.length; j++) {
  
              if(i == j){
  
                this.encuesta.push({
                  pregunta:  this.dataQuejaSugerencia.preguntas[i],
                  respuesta: this.dataQuejaSugerencia.respuestas[j]
                });
            
              }
  
  
            }
            
          }

        }




        console.log(this.encuesta);
      

        this.isLoading = false;
      });
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  public abrirPanel(item): void {
    console.log(item);
    this.IdActual = item.id;
  }

}
