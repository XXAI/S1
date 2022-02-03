import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { ConcentradosService  } from '../concentrados.service';
import { SharedService } from '../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoChecklistFormComponent } from '../dialogo-checklist-form/dialogo-checklist-form.component';
import * as FileSaver from 'file-saver';

export interface ConcentradoDialogData {
  id?: number;
}

@Component({
  selector: 'app-dialogo-concentrado-proyecto',
  templateUrl: './dialogo-concentrado-proyecto.component.html',
  styleUrls: ['./dialogo-concentrado-proyecto.component.css']
})

export class DialogoConcentradoProyectoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoConcentradoProyectoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConcentradoDialogData,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private concentradosService: ConcentradosService,
    public dialog: MatDialog
  ) { }

  isSaving:boolean = false;
  isLoading:boolean = false;
  isLoadingExcel:boolean = false;

  proyectoId:number;
  proyecto:any;
  concentrado:any;
  reportes:any[];

  puedeImprimir:boolean;

  ngOnInit() {
    this.isLoading = true;

    if(this.data.id){
      this.proyectoId = this.data.id;
      
      this.concentradosService.obtenerConcentrado(this.proyectoId).subscribe(
        response => {
          console.log(response);
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            if(!response.concentrado){
              this.proyecto = response.data;
              this.concentrado = {
                enlace: '',
                fecha: '',
              };
              this.reportes = [];
            }else{
              this.concentrado = {
                enlace: response.data.enlace,
                fecha: response.data.ultimo_reporte,
              };
              this.proyecto = response.data.proyecto;
              this.reportes = [];

              for(let i in response.data.reportes){
                let reporte = response.data.reportes[i];
                let item_reporte = {
                  id: reporte.id,
                  auditoria_id: reporte.auditoria.id,
                  auditoria: reporte.auditoria.descripcion,
                  total_reactivos: reporte.total_checklist_reactivos,
                  total_no_aplica: reporte.respuestas[0].total_no_aplica,
                  total_positivos: reporte.respuestas[0].total_positivos,
                  total_pendientes: reporte.total_checklist_reactivos - reporte.respuestas[0].total_no_aplica - reporte.respuestas[0].total_positivos,
                  porcentaje_avance: (reporte.respuestas[0].total_positivos/(reporte.total_checklist_reactivos - reporte.respuestas[0].total_no_aplica))*100,
                };
                this.reportes.push(item_reporte);
              }

              this.puedeImprimir = true;
            }
            //this.grupoForm.patchValue(response.data);
            //this.listaCRs = response.data.lista_c_r;
          }
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
    }else{
      this.isLoading = false;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  imprimir(){
    this.isLoadingExcel = true;
    let id = this.reportes[0].id;
    this.concentradosService.exportarReporte({id: id}).subscribe(
      response => {
        FileSaver.saveAs(response,'reporte');
        this.isLoadingExcel = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoadingExcel = false;
      }
    );
  }

  openChecklist(){
    let configDialog:any;
    configDialog = {
      width: '100%',
      height: '100%',
      data:{
        proyecto_id: this.proyecto.id,
        direccion_id: this.proyecto.direccion_id,
        enlace: this.concentrado.enlace,
        rel_reportes:{},
      }
    }

    for(let i in this.reportes){
      configDialog.data.rel_reportes[this.reportes[i].auditoria_id] = this.reportes[i].id;
    }
    
    const dialogRef = this.dialog.open(DialogoChecklistFormComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.concentrado = {
          enlace: response.datos_concentrado.enlace,
          fecha: response.datos_concentrado.fecha,
        }
        let item_reporte = response.item_reporte;
        let item_index = this.reportes.findIndex(x => x.id === item_reporte.id);
        if(item_index >= 0){
          this.reportes[item_index] = item_reporte;
        }else{
          this.reportes.push(item_reporte);
        }
        this.puedeImprimir = true;
      }
    });
  }
}
