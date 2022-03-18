<?php

namespace App\Http\Controllers\API\Modulos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use \Validator;

use App\Models\Seguimiento;

class SeguimientosController extends Controller
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
            'fecha.required'                => 'La Fecha de la Seguimiento es obligatoria.',
            'observaciones.required'        => 'Las Observaciones son obligatorias.',
            'estatus_id.required'           => 'El Estado (Status de la Queja/Sugerencia) de la seguimiento es obligatorio.',
            'queja_sugerencia_id.required'  => 'No contiene el ID de la Queja/Sugerencia.',
        ];

        $inputs = $request->all();

        $resultado = Validator::make($inputs,$reglas,$mensajes);

        if($resultado->passes()){

            $seguimiento = Seguimiento::create($inputs);
            
            return response()->json(['mensaje' => '¡Se Guardaron los datos con Éxito!', 'validacion'=>$resultado->passes(), 'datos'=>$seguimiento], HttpResponse::HTTP_OK);
        }else{
            return response()->json(['mensaje' => 'Error en los datos del formulario', 'status' => 409, 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
        }

    }

    public function show($id)
    {

        $seguimiento = Seguimiento::select('seguimientoses.*')->with('estatus', 'queja_sugerencia')
        ->leftJoin('quejas_sugerencias','quejas_sugerencias.id','=','seguimientoses.queja_sugerencia_id')->find($id);

        if(!$seguimiento){
            return response()->json(['No se encuentra el Seguimiento que esta buscando.'], HttpResponse::HTTP_CONFLICT);
            //404
        }

        return response()->json(['data' => $seguimiento], 200);
    }
    
}
