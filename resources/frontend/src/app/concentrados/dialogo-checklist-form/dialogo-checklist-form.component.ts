import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomValidator } from '../../utils/classes/custom-validator';
import { ConcentradosService  } from '../concentrados.service';
import { SharedService } from '../../shared/shared.service';
import { formatDate } from '@angular/common';
import { DialogoComentariosRespuestaComponent } from '../dialogo-comentarios-respuesta/dialogo-comentarios-respuesta.component';

export interface ChecklistDialogData {
  proyecto_id?: number;
  direccion_id?: number;
  enlace?: string;
  rel_reportes: any;
}

@Component({
  selector: 'app-dialogo-checklist-form',
  templateUrl: './dialogo-checklist-form.component.html',
  styleUrls: ['./dialogo-checklist-form.component.css']
})

export class DialogoChecklistFormComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoChecklistFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChecklistDialogData,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private concentradosService: ConcentradosService,
    public dialog: MatDialog,
  ) { }

  isSaving:boolean = false;
  isLoading:boolean = false;

  checklist:any;
  auditorias:any[];
  respuestas:any;

  concentradoForm = this.fb.group({
    'proyecto_id':['',Validators.required],
    'direccion_id':['',Validators.required],
    'auditoria_id':['',Validators.required],
    'checklist_id':['',Validators.required],
    'enlace': ['',Validators.required],
    'fecha': ['',[Validators.required, CustomValidator.isValidDate()]]
  });

  ngOnInit() {
    this.isLoading = true;
    this.respuestas = {};
    this.concentradosService.obtenerChecklist().subscribe(
      response => {
        console.log(response);
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        } else {
          this.checklist = response.checklist;
          this.auditorias = response.auditorias;
          
          this.concentradoForm.get('proyecto_id').patchValue(this.data.proyecto_id);
          this.concentradoForm.get('direccion_id').patchValue(this.data.direccion_id);
          this.concentradoForm.get('checklist_id').patchValue(this.checklist.id);
          this.concentradoForm.get('enlace').patchValue(this.data.enlace);

          let fecha_hoy = formatDate(new Date(), 'yyyy-MM-dd', 'en');
          this.concentradoForm.get('fecha').patchValue(fecha_hoy);

          if(this.auditorias.length == 1){
            this.concentradoForm.get('auditoria_id').patchValue(this.auditorias[0].id);

            if(this.data.rel_reportes[this.auditorias[0].id]){
              this.cargarRespuestas();
            }else{
              this.isLoading = false;
            }
          }else{
            this.isLoading = false;
          }
        }
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

  cargarRespuestas(){
    this.isLoading = true;
    this.respuestas = {};
    let auditoria_id = this.concentradoForm.get('auditoria_id').value;
    
    if(this.data.rel_reportes[auditoria_id]){
      let reporte_id = this.data.rel_reportes[auditoria_id];
      let params = {reporte_id: reporte_id, auditoria_id: auditoria_id, checklist_id:this.checklist.id};

      this.concentradosService.obtenerReporte(params).subscribe(
        response => {
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            this.concentradoForm.get('enlace').patchValue(response.data.enlace);
            this.concentradoForm.get('fecha').patchValue(response.data.fecha);

            for(let i in response.data.respuestas){
              let respuesta = response.data.respuestas[i];
              this.respuestas[respuesta.checklist_reactivo_id] = {
                id: respuesta.id,
                respuesta: respuesta.tiene_informacion,
                no_aplica: respuesta.no_aplica,
                comentarios: respuesta.comentarios
              };
            }
            for(let i in this.checklist.titulos){
              let titulo = this.checklist.titulos[i];
              for(let j in titulo.reactivos){
                let reactivo = titulo.reactivos[j];
                reactivo.respuesta = 0;
                reactivo.comentarios = '';
                reactivo.no_aplica = 0;
                reactivo.respuesta_id = null;

                if(this.respuestas[reactivo.id]){
                  reactivo.respuesta = this.respuestas[reactivo.id].respuesta;
                  reactivo.comentarios = this.respuestas[reactivo.id].comentarios;
                  reactivo.no_aplica = (this.respuestas[reactivo.id].no_aplica)?1:0;
                  reactivo.respuesta_id = this.respuestas[reactivo.id].id;
                }
              }
            }
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
    }
  }

  cambiarEstatusTitulo(titulo){
    for (let i in titulo.reactivos) {
      let reactivo = titulo.reactivos[i];
      reactivo.no_aplica = titulo.no_aplica;
      reactivo.respuesta = undefined;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  openComentarios(reactivo){
    let configDialog:any;
    configDialog = {
      width: '50%',
      data:{
        reactivo: reactivo.descripcion,
        reactivo_id: reactivo.id,
        comentarios: reactivo.comentarios,
      }
    }
    
    const dialogRef = this.dialog.open(DialogoComentariosRespuestaComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        reactivo.comentarios = valid;
      }
    });
  }

  guardar(){
    if(this.concentradoForm.valid){
      let reporte_data = JSON.parse(JSON.stringify(this.concentradoForm.value));
      reporte_data.respuestas = [];

      for(let i in this.checklist.titulos){
        let titulo = this.checklist.titulos[i];
        for(let j in titulo.reactivos){
          let reactivo = titulo.reactivos[j];
          if(reactivo.respuesta > 0 || reactivo.no_aplica > 0 || reactivo.comentarios || reactivo.respuesta_id){
            reporte_data.respuestas.push({
              checklist_reactivo_id:reactivo.id,
              tiene_informacion: reactivo.respuesta,
              no_aplica: reactivo.no_aplica,
              comentarios: reactivo.comentarios,
              respuesta_id: reactivo.respuesta_id,
            });
          }
        }
      }
      this.isSaving = true
      this.isLoading = true;
      
      this.concentradosService.guardarReporte(reporte_data).subscribe(
        response => {
          this.isSaving = false;
          this.isLoading = false;
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            let reporte = response.data;
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
            this.dialogRef.close({item_reporte:item_reporte, datos_concentrado:{enlace:reporte.enlace, fecha:reporte.fecha}});
          }
        },
        errorResponse =>{
          this.isSaving = false;
          this.isLoading = false;
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          //this.isLoading = false;
        }
      );
    }
  }
}
