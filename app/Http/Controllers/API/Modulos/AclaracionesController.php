<?php

namespace App\Http\Controllers\API\Modulos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use \Validator;

use App\Models\Aclaracion;

class AclaracionesController extends Controller
{
    //

    public function store(Request $request){

        $reglas = [

            'fecha'                 => 'required|date' ,
            'observaciones'         => 'required',
            'estatus_id'            => 'required',
            'queja_sugerencia_id'   => 'required',
        ];

        $mensajes = [
            'fecha.required'                => 'La Fecha de la Aclaración es obligatoria.',
            'observaciones.required'        => 'Las Observaciones son obligatorias.',
            'estatus_id.required'           => 'El Estado (Status de la Queja/Sugerencia) de la Aclaración es obligatorio.',
            'queja_sugerencia_id.required'  => 'No contiene el ID de la Queja/Sugerencia.',
        ];

        $inputs = $request->all();

        $resultado = Validator::make($inputs,$reglas,$mensajes);

        if($resultado->passes()){

            $aclaracion = Aclaracion::create($inputs);
            
            return response()->json(['mensaje' => '¡Se Guardaron los datos con Éxito!', 'validacion'=>$resultado->passes(), 'datos'=>$aclaracion], HttpResponse::HTTP_OK);
        }else{
            return response()->json(['mensaje' => 'Error en los datos del formulario', 'status' => 409, 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
        }

    }

    public function show($id)
    {

        $aclaracion = Aclaracion::select('aclaraciones.*')->with('estatus', 'queja_sugerencia')
        ->leftJoin('quejas_sugerencias','quejas_sugerencias.id','=','aclaraciones.queja_sugerencia_id')->find($id);

        if(!$aclaracion){
            return response()->json(['No se encuentra la Aclaración que esta buscando.'], HttpResponse::HTTP_CONFLICT);
            //404
        }

        return response()->json(['data' => $aclaracion], 200);
    }
    
}
