<?php

namespace App\Http\Controllers\API\Catalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use App\Http\Controllers\Controller;

use App\Models\QuejaSugerencia;


class BusquedaRecursosController extends Controller
{

    public function infoQuejaSugerencia($id){
        try{
            
            //$params = $request->all();

            $queja_sugerencia = QuejaSugerencia::with('tipo_incidencia', 'seguimientos')->where('id',$id)->orderBy('created_at', 'DESC')->first();

            if(!$queja_sugerencia){
                throw new Exception("No se encontro lo que esta buscado", 1);
            }
            
            return response()->json(['data'=>$queja_sugerencia],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

}
