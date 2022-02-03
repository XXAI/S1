import { LOGOS } from "../../logos";

export class ReporteCapturaDonantes {

    getDocumentDefinition(reportData:any) {
        //console.log("shiiit",reportData.items);
        let contadorLineasHorizontalesV = 0;
        let fecha_hoy =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'long', day: '2-digit'}).format(new Date());
      //console.log(LOGOS);
        let datos = {
          pageOrientation: 'landscape',
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
                    text: 'SECRETARÍA DE SALUD\n'+'Donantes de Organos\n'+''+reportData.config.title,
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
                      text:'http://donadores.saludchiapas.gob.mx/',
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
                    text: fecha_hoy,
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
              subcabecera:{
                fontSize: 8,
                bold:true,
                fillColor:"#DEDEDE",
                alignment:"center"
              },
              cabecera_principal: {
                fontSize: 10,
                bold: true,
                fillColor:"#890000",
                color: "white",
                alignment:"center"
              },
              datos:
              {
                fontSize: 10
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
              tabla_datos_estados_actuales:
              {

                fontSize: 9,
                alignment:"center",
                bold:true,

              },
              tabla_datos_titulo:
              {
                fontSize: 9,
                alignment:"center"
              },
            }
        };

        let tabla_vacia = {

          table: {
            headerRows:1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            widths: [ 30, 110, 80, 80, 40, 90, 60, 100, 150, 100 ],
            margin: [0,0,0,0],
            body: [
              //[{text: "["+empleado.clues+"] "+empleado.clues_descripcion, colSpan: 12, style: 'cabecera'},{},{},{},{},{},{},{},{},{},{},{}],
              [{text: "Reporte de Donantes al: "+fecha_hoy, colSpan: 10, style: 'cabecera_principal'},{},{},{},{},{},{},{},{},{}],
              [
                {text: "N°", style: 'cabecera'},
                {text: "NOMBRE COMPLETO", style: 'cabecera'},
                {text: "FECHA DE NACIMIENTO", style: 'cabecera'},
                {text: "FECHA DE CAPTURA", style: 'cabecera'},
                {text: "EDAD", style: 'cabecera'},
                {text: "CURP", style: 'cabecera'},
                {text: "SEXO", style: 'cabecera'},
                {text: "TELEFONO DE CONTACTO", style: 'cabecera'},
                {text: "EMAIL", style: 'cabecera'},
                {text: "LUGAR DE NACIMIENTO", style: 'cabecera'}
              ]
            ]
          }

        };

        datos.content.push(JSON.parse(JSON.stringify(tabla_vacia)));
      
        let indice_actual;//(datos.content.length -1);

        //console.log('for(let i = 0; i < ; i++){');
        for(let i = 0; i < reportData.items.length; i++){
          //console.log("iiiii", reportData.items.length);
          let donante = reportData.items[i];
          let fecha_captura     =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date(donante.created_at));
          let fecha_nacimiento     =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date(donante.fecha_nacimiento));


          indice_actual = datos.content.length -1;

          datos.content[indice_actual].table.body.push([

            { text: i+1, style: 'tabla_datos' }, 
            { text: donante.nombre + ' '+ donante.apellido_paterno + ' '+ donante.apellido_materno, style: 'tabla_datos' },
            { text: fecha_nacimiento, style: 'tabla_datos' },
            { text: fecha_captura, style: 'tabla_datos' },
            { text: (donante.edad != null ? donante.edad+' Años' : "NO REGISTRADO"), style: 'tabla_datos'},
            { text: (donante.curp != null ? donante.curp : "NO REGISTRADO"), style: 'tabla_datos'},
            { text: (donante.sexo == 'M' ? 'MASCULINO' : "FEMENINO"), style: 'tabla_datos'},
            { text: (donante.telefono_contacto != null ? donante.telefono_contacto : "NO REGISTRADO"), style: 'tabla_datos'},
            { text: (donante.email != null ? donante.email : "NO REGISTRADO"), fecha_nacimiento , style: 'tabla_datos'},
            { text: (donante.entidad_federativa != null ? donante.entidad_federativa.nombre : "DESCONOCIDO"), fecha_nacimiento , style: 'tabla_datos'}

          ]);


        }

        return datos;
    }
}