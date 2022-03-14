/// <reference lib="webworker" />
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ImprimirQuejaSugerencia } from './imprimir-queja-sugerencia';
import { ImprimirQuejaSugerenciaGeneral } from './queja-sugerencia-general';
import { ReporteQuejasSugerenciasGenerales } from './reporte-quejas-sugerencias-generales';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const reportes = {

  '/imprimir-queja-sugerencia' : new ImprimirQuejaSugerencia(),
  '/queja-sugerencia-general' : new ImprimirQuejaSugerenciaGeneral(),
  '/reporte-quejas-sugerencias-generales' : new ReporteQuejasSugerenciasGenerales(),
  

};

addEventListener('message', ({ data }) => {
  const documentDefinition = reportes[data.reporte].getDocumentDefinition(data.data);

  let pdfReporte = pdfMake.createPdf(documentDefinition);

  pdfReporte.getBase64(function(encodedString) {
      let base64data = encodedString;
      //console.log(base64data);
      var bytes = atob( base64data ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
        view[i] = bytes.charCodeAt(i) & 0xff;
      let file = new Blob( [ buffer ], { type: 'application/pdf' } );
      postMessage(file);
  });
});