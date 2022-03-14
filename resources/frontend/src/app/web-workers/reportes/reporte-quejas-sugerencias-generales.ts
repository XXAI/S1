import { LOGOS } from "../../logos";

export class ReporteQuejasSugerenciasGenerales {

    getDocumentDefinition(reportData:any) {
        let contadorLineasHorizontalesV = 0;
        let fecha_actual_server = reportData.fecha_actual;
        let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'long', day: '2-digit'}).format(new Date());
        //let fecha_hoy =  Date.now();
      //console.log(LOGOS);
        let datos = {
          pageOrientation: 'portrait',
          pageSize: 'LEGAL',
          /*pageSize: {
            width: 612,
            height: 396
          },*/
          pageMargins: [ 40, 60, 40, 60 ],
          header: {
            margin: [30, 20, 30, 0],
            columns: [
                {
                    image: LOGOS[0].LOGO_FEDERAL,
                    width: 80
                },
                {
                    margin: [10, 0, 0, 0],
                    text: 'SECRETARÍA DE SALUD\n'+reportData.config.title,
                    bold: true,
                    fontSize: 12,
                    alignment: 'center'
                },
                {
                  image: LOGOS[1].LOGO_ESTATAL,
                  width: 60
              }
            ]
          },
          footer: function(currentPage, pageCount) { 
            //return 'Página ' + currentPage.toString() + ' de ' + pageCount; 
            return {
              margin: [30, 20, 30, 0],
              columns: [
                  {
                      text:'http://saludchiapas.gob.mx/',
                      alignment:'left',
                      fontSize: 8,
                  },
                  {
                      margin: [10, 0, 0, 0],
                      text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
                      fontSize: 8,
                      alignment: 'center'
                  },
                  {
                    text:new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'long', day: '2-digit'}).format(new Date()),
                    alignment:'right',
                    fontSize: 8,
                }
              ]
            }
          },
          content: [],
            styles: {
              cabecera: {
                fontSize: 8,
                bold: true,
                fillColor:"#890000",
                color: "white",
                alignment:"center"
              },
              cabecera_principal: {
                fontSize: 9,
                bold: true,
                fillColor:"#890000",
                color: "white",
                alignment:"center"
              },
              subcabecera:{
                fontSize: 5,
                bold:true,
                fillColor:"#DEDEDE",
                alignment:"center"
              },
              datos:
              {
                fontSize: 7
              },
              tabla_datos:
              {
                fontSize: 8,
                alignment:"center"
              },
              tabla_datos_centrar:
              {
                fontSize: 9,
                alignment:"center",
                bold: true,

              },
              tabla_datos_titulo:
              {
                fontSize: 9,
                alignment:"center"
              },
              tabla_datos_estados_actuales:
              {

                fontSize: 9,
                alignment:"center",
                bold:true,

              }
            }
        };

        let tabla_vacia = {
          table: {
            headerRows:1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            widths: [ 15, 'auto', 60, 60, 60, 'auto', 90, 90 ],
            margin: [0,0,0,0],
            body: [
              [{text: "Reporte a la Fecha: "+fecha_reporte, colSpan: 8, style: 'cabecera_principal'},{},{},{},{},{},{},{}],
              [

                {text: "N°", style: 'cabecera'},
                {text: "Folio", style: 'cabecera'},
                {text: "Fecha del Acontecimiento", style: 'cabecera'},
                {text: "Tipo de Incidencia", style: 'cabecera'},
                {text: "Nombre (Quien Reporta)", style: 'cabecera'},
                {text: "N° Celular", style: 'cabecera'},
                {text: "Motivo", style: 'cabecera'},
                {text: "Observaciones", style: 'cabecera'},
              ],

            ]
          }
        };
        
        datos.content.push(JSON.parse(JSON.stringify(tabla_vacia)));
      

        let indice_actual;//(datos.content.length -1);
        let tipo_incidencia = "";
        let fecha_acontecimiento = "";

          function diferenciaDeDias(f1, f2) {

            console.log("f1",f1);
            console.log("f2",f2);

            let fecha1 = new Date(f1);
            let fecha2 = new Date(f2)

            let resta = fecha2.getTime() - fecha1.getTime()
            let fecha = Math.round(resta/ (1000*60*60*24));

            return fecha;     
          }

          function formatoFecha(string) {

            var formato_fecha = string.split('-').reverse().join('/');
            return formato_fecha;

          }


        for(let i = 0; i < reportData.items.length; i++){

                let incidencia          = reportData.items[i];

                tipo_incidencia         = incidencia.tipo_incidencia != null || incidencia.tipo_incidencia != '' ? incidencia.tipo_incidencia.nombre : 'SIN REGISTRO';
                fecha_acontecimiento    = incidencia.fecha_acontecimiento != null ? incidencia.fecha_acontecimiento : '2022-01-01';
                formatoFecha(fecha_acontecimiento);


                indice_actual = datos.content.length -1;



          
                datos.content[indice_actual].table.body.push([

                  { text: i+1, style: 'tabla_datos' },
                  { text: (incidencia.folio != null || incidencia.folio !='' ? incidencia.folio : "SIN REGISTRO"), style: 'tabla_datos'},
                  { text: fecha_acontecimiento, style: 'tabla_datos'},
                  { text: tipo_incidencia, style: 'tabla_datos'},
                  { text: (incidencia?.nombre_completo != null ? incidencia?.nombre_completo : 'Denuncia Anónima' ), style: 'tabla_datos'},
                  { text: (incidencia.datos_usuarios != null ? incidencia.datos_usuarios[1] : 'Denuncia Anónima'), style: 'tabla_datos'},
                  { text: incidencia.motivo, style: 'tabla_datos'},
                  { text: incidencia.observaciones, style: 'tabla_datos'},

                ]);

                tipo_incidencia = "";
                fecha_acontecimiento = "";

 
              
        }

        return datos;
    }
}