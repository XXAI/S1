import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MediaObserver } from '@angular/flex-layout';
import { MatTableDataSource } from '@angular/material/table';
import { ConcentradosService } from '../concentrados.service';
import { SharedService } from '../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConcentradoProyectoComponent } from '../dialogo-concentrado-proyecto/dialogo-concentrado-proyecto.component';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})

export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public mediaObserver: MediaObserver, private concentradosService: ConcentradosService, private sharedService: SharedService, public dialog: MatDialog) { }

  mostrarTarjetas:boolean = false;

  isLoading: boolean = false;
  mediaSize: string;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['direccion','clave','descripcion','actions'];
  dataSource: MatTableDataSource<any>;
  listadoProyectos: any[] = [];

  meses:any = {1:'Enero', 2:'Febrero', 3:'Marzo', 4:'Abril', 5:'Mayo', 6:'Junio', 7:'Julio', 8:'Agosto', 9:'Septiembre', 10:'Octubre', 11:'Noviembre', 12:'Diciembre'};

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    this.listadoProyectos = [];
    this.loadListadoProyectos();
  }
  
  applyFilter(){
    this.loadListadoProyectos();
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  loadListadoProyectos(event?){
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

    this.listadoProyectos = [];
    
    params.query = this.searchQuery;
    if(!this.dataSource){
      this.dataSource = new MatTableDataSource<any>([]);
    }
    this.resultsLength = 0;
    
    this.concentradosService.obtenerListaProyectos(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.listadoProyectos = response.data.data;

            this.resultsLength = response.data.total;
          }
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
    
    return event;
  }

  mostrarConcentrado(id = null){
    let configDialog:any;
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        data:{scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '50%',
        height: '80%',
        data:{}
      }
    }

    if(id){
      configDialog.data.id = id;
    }

    const dialogRef = this.dialog.open(DialogoConcentradoProyectoComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        //this.loadGruposData(this.pageEvent);
      }
    });
  }
}
