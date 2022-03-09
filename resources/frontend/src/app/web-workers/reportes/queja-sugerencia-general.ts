import { LOGOS } from "../../logos";

import { IMG } from "../../img";


export class ImprimirQuejaSugerenciaGeneral{

    getDocumentDefinition(reportData:any) {
        console.log(reportData);
        let contadorLineasHorizontalesV = 0;
        let fecha_hoy =  Date.now();
        let queja_sugerencia_general = reportData.items;
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

          content: [
          ],

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
              centrado:
              {
                alignment:"center"
              },
              queja_sugerencia_general_title:{
                alignment:"left",
                fontSize: 11,
                bold:true,
                fillColor:"#890000",
                color: "white",
              },
              queja_sugerencia_general_datos:{
                fontSize: 11
              },
            }
        };

        let indice_actual;

        datos.content.push({
          layout: 'noBorders',
          table: {
           widths: ['*'],
            margin: [0,0,0,0],
            body: [
              [
                { text: " \n\n"}
              ]
            ]
          }
        });

        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 60, '*', 70, '*', 60, 65],
            body: [
              [
                {text: "Fecha:",                                                           style: "queja_sugerencia_general_title"},
                {text: queja_sugerencia_general?.fecha_acontecimiento,                             style: "queja_sugerencia_general_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "N° Folio:",                                                         style: "queja_sugerencia_general_title"},
                {text: queja_sugerencia_general?.folio,                                            style: "queja_sugerencia_general_datos"},
              ],
              [

                {text: "Testigo :",                                                        style: "queja_sugerencia_general_title"},
                {text:  (queja_sugerencia_general?.nombre_completo == "" || queja_sugerencia_general?.nombre_completo == null ? 'Denuncia Anónima' : queja_sugerencia_general?.nombre_completo),  style: "queja_sugerencia_general_datos", colSpan: 2},
                {text: ""},
                {text: "Celular",                                                          style: "queja_sugerencia_general_title" },
                {text: (queja_sugerencia_general?.numero_celular == "" || queja_sugerencia_general?.numero_celular == null ? 'Denuncia Anónima' : queja_sugerencia_general?.numero_celular),      style: "queja_sugerencia_general_datos", colSpan: 2},
                {text: ""},
              ],
              [
                {text: "N° Placas:",                                              style: "queja_sugerencia_general_title"},
                {text: (queja_sugerencia_general?.numero_de_placa == "" || queja_sugerencia_general?.numero_de_placa == null ? 'Sin Registro' : queja_sugerencia_general?.numero_de_placa),                style: "queja_sugerencia_general_datos", colSpan: 5 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text: "Lugar:",                                              style: "queja_sugerencia_general_title"},
                {text: queja_sugerencia_general?.lugar_acontecimiento,                style: "queja_sugerencia_general_datos", colSpan: 5 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text: "Motivo:",                               style: "queja_sugerencia_general_title"},
                {text: queja_sugerencia_general?.motivo,                style: "queja_sugerencia_general_datos", colSpan: 5 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text: "Observaciones:",                                      style: "queja_sugerencia_general_title", colSpan: 2},
                {text: ""},
                {text: queja_sugerencia_general?.observaciones,                       style: "queja_sugerencia_general_datos", colSpan: 4 },
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text:'', colSpan:6, border: [false, false, false, false]}
              ]
            ]
          }
        });

        datos.content.push({
          layout: 'noBorders',
          columnGap: 30,
          table: {
           widths: ['*'],
            margin: [0,0,0,0],
            body: [
              [
                { text: " \n\n\n"}
              ]
            ]
          }
        });

        for (let p = 0; p < queja_sugerencia_general.preguntas.length; p++) {

            let pregunta = queja_sugerencia_general.preguntas[p];
            console.log("pregunta",pregunta);

          for (let r = 0; r < queja_sugerencia_general.respuestas.length; r++) {
            let respuesta = queja_sugerencia_general.respuestas[r];
            console.log("respuesta",respuesta);
            
          }
          
          
        }

        if(queja_sugerencia_general.evidencias.length > 0){

          //datos.content.push({ text:'', pageBreak:'after' });

          for(let i = 0; i < queja_sugerencia_general.evidencias.length; i++){
  
            // indice_actual = datos.content.length -1;
  
            // datos.content.push([
  
            //   { image: formato+queja_sugerencia_general.evidencias[i], width: 100, height: 50 },
    
            // ]);
  
  
            datos.content.push({
              layout: 'noBorders',
              table: {
                alignment: "center",
                widths: ['*'],
                margin: [0,0,0,0],
                body: [
                  [
                    { image: formato+queja_sugerencia_general.evidencias[i], "fit" : [535.28, 535.28], pageBreak: 'before', style: "centrado" },
                  ],
                ]
              }
            });
  
          }

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