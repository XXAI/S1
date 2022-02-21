import { LOGOS } from "../../logos";

import { IMG } from "../../img";


export class ImprimirQuejaSugerencia{

    getDocumentDefinition(reportData:any) {
        console.log(reportData);
        let contadorLineasHorizontalesV = 0;
        let fecha_hoy =  Date.now();
        let queja_sugerencia = reportData.items;
        let evidencias = {};
        let formato = "data:image/jpeg;base64,";

        let datos = {
          pageOrientation: 'portrait',
          pageSize: 'LETTER',
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
                    width: 90
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
                  width: 80
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
                    text:fecha_hoy.toString(),
                    alignment:'right',
                    fontSize: 8,
                }
              ]
            }
          },

          content: [],

            styles: {
              cabecera: {
                fontSize: 5,
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
                fontSize: 10
              },
              tabla_datos:
              {
                fontSize: 5
              },
              texto_anotacion:
              {
                bold: true,
                alignment:"left",
                fontSize: 8
              },
              texto_firmas:
              {
                bold: true,
                alignment:"left",
                fontSize: 8
              },
              texto_centro:
              {
                bold: true,
                alignment:"center",
                fontSize: 6
              },
              texto_derecha:
              {
                bold: true,
                alignment:"right",
                fontSize: 6
              },
              firma_testigos:
              {
                bold: true,
                alignment:"left",
                fontSize: 8
              },
              img:
              {
                alignment:"center"
              },
              img_firmas:
              {
                alignment:"left"
              },
              img_testigos:
              {
                alignment:"right"
              }
            }
        };

        let indice_actual;

        for(let i = 0; i < queja_sugerencia.evidencias.length; i++){

          console.log("simon",queja_sugerencia.evidencias[i]);

          indice_actual = datos.content.length -1;

          datos.content.push([

            { image: formato+queja_sugerencia.evidencias[i], width: 100, height: 50 },
  
          ]);

        }







        // datos.content.push({
        //   layout: 'noBorders',
        //   table: {
        //     widths: ['*'],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         //{ text: "", colSpan:2},{},
        //         { text: "A mi familia:\n\n Es mi voluntad que mi fallecimiento y con la esperanza De ayudar a salvar vidas, sean donados mis órganos y tejidos con fines de trasplante. Cuando esto suceda, Apoyen mi decisión y ayuden a cumplir mi voluntad.", style: "texto_anotacion"},
        //         //{ text: "", colSpan:4},{},{},{},
        //       ],
        //     ]
        //   }
        // });

        // datos.content.push({
        //   layout: 'noBorders',
        //   table: {
        //    widths: [ 50, 50, 50, 50, 80, 100, 100, 100 ],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         { text: "", colSpan:4},{},{},{},
        //         { qr: 'http://donadores.saludchiapas.gob.mx/'+donante.id, fit: '80'},
        //         { text: "", colSpan:3},{},{},
        //       ],
        //     ]
        //   }
        // });

        // datos.content.push({
        //   layout: 'noBorders',
        //   table: {
        //    widths: ['*'],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         { text: "\n\n\n\n\n", style: "tabla_datos"}
        //       ]
        //     ]
        //   }
        // });

        // datos.content.push({
        //   layout: 'noBorders',
        //   table: {
        //    widths: [ 50, 50, 50, 50, 80, 100, 100, 100 ],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         { text: "", colSpan:2},{},
        //         { image: IMG[0].NOMBRE_FIRMA, width: 300, height: 60 },
        //         { text: "", colSpan:4},{},{},{},
        //       ],
        //     ]
        //   }
        // });

        // datos.content.push({
        //   layout: 'noBorders',
        //   table: {
        //    widths: ['*'],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         { text: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n", style: "tabla_datos"}
        //       ]
        //     ]
        //   }
        // });

        // datos.content.push({

        //   layout: 'noBorders',
        //   table: {
        //     widths: ['*', '*'],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         { image: IMG[4].CETRA, width: 250, height: 160, style: "texto_firmas", colSpan:2},{},
        //       ],
        //       [
        //         { text: "Testigos", style: "texto_firmas", colSpan:2},{},
        //       ],
        //       [              
        //         { text: "______________________________\n\n Nombre y Firma", style: "texto_firmas"},
        //         { text: "______________________________\n\n Nombre y Firma", style: "texto_firmas"},
        //       ],
        //     ]
        //   }
          
        // });


        // datos.content.push({
        //   layout: 'noBorders',
        //   table: {
        //    widths: [ 50, 50, 50, 50, 80, 100, 100, 100 ],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         { text: "",},
        //         { image: IMG[3].DIRECCION, width: 430, height: 100 },
        //         { text: "", colSpan:3},{},{},
        //       ],
        //     ]
        //   }
        // });





      

        return datos;
      }
}