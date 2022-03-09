import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  private http_upload: HttpClient;
  private api: string;

  url                                     = `${environment.base_url}/quejas-sugerencias`;
  url_qj_general                          = `${environment.base_url}/quejas-sugerencias-generales`;
  ur_imprimir                             = `${environment.base_url}/queja-sugerencia`;
  url_info_donante                        = `${environment.base_url}/qr-donador/`;
  // url_catalogo_diagnostico_autocomplet    = `${environment.base_url}/busqueda-diagnosticos`;
  url_personas_callcenter                 = `http://contingencia.saludchiapas.gob.mx/api/search-personas`;
  url_id_persona_callCenter               = `http://contingencia.saludchiapas.gob.mx/api/search-personas`;

  url_filter_catalogs                     =  `${environment.base_url}/catalogos-lista-filtros`;
  url_obtener_catalogos                   =  `${environment.base_url}/catalogos`;
  url_calcular_curp                       =  'http://curpmexico.ddns.net:8082/api/curp';



  constructor( handler: HttpBackend, private http: HttpClient) {
    //To ignore interceptor
    this.http_upload = new HttpClient(handler);
    this.api = environment.base_url;
    
  }

  getQJGeneralesList(payload):Observable<any> {
    return this.http.get<any>(this.url_qj_general,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getDonantesList(payload):Observable<any> {
    return this.http.get<any>(this.url,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getDonantesFilters(filters):Observable<any> {
    return this.http.get<any>(this.url,{params: filters}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getQuejaSugerencia(id) {
    return this.http.get<any>(this.url+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  getQuejaSugerenciaImprimir(id:any) {
    return this.http.get<any>(this.ur_imprimir+'/'+id).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  // getQuejaSugerenciaImprimir(id:any,payload:any):Observable<any>{
  //   return this.http.get<any>(this.ur_imprimir + id, {params:payload}).pipe(
  //     map( (response: any) => {
  //       return response;
  //     })
  //   );
  // }

  verInfoQuejaSugerencia(id:any,payload:any):Observable<any>{
    return this.http.get<any>(this.url_info_donante + id, {params:payload}).pipe(
      map( (response: any) => {
        return response;
      })
    );
  }

  getFilterCatalogs():Observable<any>{
    return this.http.get<any>(this.url_filter_catalogs).pipe(
      map(response => {
        return response;
      })
    );
  }

  calcularCurp(payload):Observable<any> {
    return this.http.get<any>(this.url_calcular_curp+payload).pipe(
      map( response => {
        console.log("curp",response);
        return response;
      })
    );
  }

  obtenerCatalogos(payload) {
    return this.http.post<any>(this.url_obtener_catalogos,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  updateQuejaSugerencia(id,payload) {
    return this.http.put<any>(this.url+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  createQuejaSugerencia(data:any, file:File, path:string): Observable<any> {

    if(file != null){

      console.log(data, file);
      let datos = JSON.stringify(data);
      const formData: FormData = new FormData();

      formData.append('archivo', file, file.name);
  
      formData.append('data', datos);

  
      //let token = localStorage.getItem('token');
      let headers = new HttpHeaders().set(
        "Authorization",'Bearer '+localStorage.getItem("token"),
      );
      headers.append('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
      headers.append('Access-Control-Allow-Origin','*');
  
  
      return this.http_upload.post(this.url, formData, { headers:headers});

    }else{

      let headers = new HttpHeaders().set(
        "Content-Type",'image/pjpeg',
      );


      return this.http.post<any>(this.url,data,  { headers:headers}).pipe(
        map( (response) => {
          return response;
        }
      ));


    }





  }
  
  // upload(data:any,file:File,path:string): Observable<any>{

  //   const formData: FormData = new FormData();

  //   formData.append('archivo', file, file.name);

  //   formData.append('trabajador_id', data.trabajador_id);

  //   //let token = localStorage.getItem('token');
  //   let headers = new HttpHeaders().set(
  //     "Authorization",'Bearer '+localStorage.getItem("token"),
  //   );
  //   headers.append('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
  //   headers.append('Access-Control-Allow-Origin','*');


  //   return this.http_upload.post(this.url, formData, { headers:headers});
    
  // }

  deleteQuejaSugerencia(id) {
    return this.http.delete<any>(this.url+'/'+id,{}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

}
