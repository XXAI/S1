import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ComentariosDialogData {
  reactivo_id: number;
  reactivo: string;
  comentarios: string;
}

@Component({
  selector: 'app-dialogo-comentarios-respuesta',
  templateUrl: './dialogo-comentarios-respuesta.component.html',
  styleUrls: ['./dialogo-comentarios-respuesta.component.css']
})
export class DialogoComentariosRespuestaComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoComentariosRespuestaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComentariosDialogData,
  ) { }

  comentarios:string;
  reactivo:string;
  reactivoId:number;

  ngOnInit(): void {
    this.reactivoId = this.data.reactivo_id;
    this.reactivo = this.data.reactivo;
    this.comentarios = this.data.comentarios;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  aceptar():void {
    this.dialogRef.close(this.comentarios);
  }

}
