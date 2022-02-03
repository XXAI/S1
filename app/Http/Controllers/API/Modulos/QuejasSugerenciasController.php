<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

use App\Http\Requests;

use \Validator, Exception \Hash, \Response, \File, \Store;
use Illuminate\Facades\Storage;
use Illuminate\Support\Str;


use App\Models\QuejaSugerencia;
// use App\Exports\DonadoresExport;
use Maatwebsite\Excel\Facades\Excel;



class QuejasSugerenciasController extends Controller
{

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
    */
    public function store(Request $request){

        ini_set('memory_limit', '-1');

        $reglas = [

            'folio'=>'required|unique:quejas_sugerencias',
            'motivo' => 'required',
            'observaciones' => 'required',
            'fecha_acontecimiento' => 'required|date',
            'esAnonimo' => 'required',

        ];

        $mensajes = [

            'folio.unique' => 'El Folio debe ser único',
            'motivo.required' => 'El motivo  del acontecimiento es requerido.',
            'observaciones.required' => 'El observaciones es requerido.',
            'fecha_acontecimiento.required'  => 'La fecha del acontecimiento es requerida.',
            'esAnonimo.required'  => 'Debe indicar si la queja o sugerencia es anonima.',

        ];


        $inputs = $request->all();

        $data_client = json_decode($inputs['data']);
        $datos = (array) $data_client;

        $datos['folio'] = Str::random(10);


        DB::beginTransaction();
        $resultado = Validator::make($datos,$reglas,$mensajes);

        if($resultado->passes()){
            $registro = QuejaSugerencia::create($datos);

            try{  
                $queja_sugerencia = QuejaSugerencia::find($registro->id);
                
                if($request->hasFile('archivo')) {
                    
                    $fileName = $queja_sugerencia->id;
                    $extension = $request->file('archivo')->getClientOriginalExtension();
                    if($extension == "jpg" || $extension == "jpeg")
                    {
                        $name = $fileName.".".$extension;
                        $request->file("archivo")->storeAs("public/EvidenciaQuejaSugerencia", $name);
                    }else{
                        return response()->json(['error' => "Formato de imagen incorrento, favor de verificar" ], HttpResponse::HTTP_CONFLICT);
                    }
                    
                    $queja_sugerencia_imagen = QuejaSugerencia::where("id",$queja_sugerencia->id)->first();

                    $queja_sugerencia_imagen->foto = 1;
                    $queja_sugerencia_imagen->extension = $extension;
                    $queja_sugerencia_imagen->save();
        
                    DB::commit();
                }else{

                    return response()->json(['mensaje' => '¡Se registro la Queja/Sugerencia con Éxito!', 'validacion'=>$resultado->passes(), 'datos'=>$registro], HttpResponse::HTTP_OK);

                }
                
            
                return response()->json(['data'=>$queja_sugerencia_imagen],HttpResponse::HTTP_OK);
            }catch(\Exception $e){
                DB::rollback();
                return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
            }

            //return response()->json(['mensaje' => 'Guardado', 'validacion'=>$resultado->passes(), 'datos'=>$registro], HttpResponse::HTTP_OK);
        }else{
            return response()->json(['mensaje' => 'Error en los datos del formulario', 'status' => 409, 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_OK);
        }



    }


}