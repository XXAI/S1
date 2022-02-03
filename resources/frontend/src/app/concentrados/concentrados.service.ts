import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ConcentradosService {
  url_proyectos = `${environment.base_url}/proyectos`;
  url_concentrados = `${environment.base_url}/concentrado-proyecto`;
  url_checklist = `${environment.base_url}/concentrado-checklist`;
  url_respuestas =  `${environment.base_url}/reporte-respuestas`;
  url_reporte =  `${environment.base_url}/guardar-reporte`;
  url_export =  `${environment.base_url}/exportar-concentrado`;

  constructor(private http: HttpClient) { }

  obtenerListaProyectos(payload):Observable<any> {
    return this.http.get<any>(this.url_proyectos,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerConcentrado(id) {
    return this.http.get<any>(this.url_concentrados+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  obtenerChecklist() {
    return this.http.get<any>(this.url_checklist,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  obtenerReporte(payload):Observable<any> {
    return this.http.get<any>(this.url_respuestas,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  guardarReporte(payload) {
    return this.http.post<any>(this.url_reporte,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  exportarReporte(payload):Observable<any>{
    return this.http.get<any>(this.url_export, {params:payload, responseType: 'blob' as 'json'});
  }
}