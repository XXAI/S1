import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { AtencionPacientesService } from '../atencion-pacientes.service';
import { SharedService } from '../../shared/shared.service';
import { Router, ActivatedRoute  } from '@angular/router';


export interface FormDialogData {
  img: any;
  scSize: any
}

@Component({
  selector: 'app-details-img',
  templateUrl: './details-img.component.html',
  styleUrls: ['./details-img.component.css']
})
export class DetailsComponentImg implements OnInit {
  


  constructor(
    public dialogRef: MatDialogRef<DetailsComponentImg>,
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData,
    // private AtencionPacientesService: AtencionPacientesService,
    private sharedService: SharedService,
    public router: Router,

  ) {}

  public dialog: MatDialog;
  panelAtencion     = false;
  panelSeguimiento  = false;
  panelEmabarazo    = false;
  panelOpenState    = false;

  IdActual: number;

  dataPaciente: any;

  isLoading:boolean = false;

  ngOnInit() {

    console.log(this.data.scSize);
  }


  cargarDatosPaciente(id:any){

    let params = {};
    let query = this.sharedService.getDataFromCurrentApp('searchQuery');

    if(query){
      params['query'] = query;
    }

    this.isLoading = true;

    // this.AtencionPacientesService.verInfoPaciente(id,params).subscribe(
    //   response =>{
        
    //     this.dataPaciente = response.data;

    //     this.isLoading = false;
    //   });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public abrirPanel(item): void {
    this.IdActual = item.id;
    this.panelSeguimiento = true;
  }

}
