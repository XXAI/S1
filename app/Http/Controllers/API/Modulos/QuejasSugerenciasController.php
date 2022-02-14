<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

use App\Http\Requests;

use \Validator, Exception \Hash, \Response, \File, \Store;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


use App\Models\QuejaSugerencia;
use App\Models\Evidencia;
// use App\Exports\DonadoresExport;
use Maatwebsite\Excel\Facades\Excel;



class QuejasSugerenciasController extends Controller
{

        /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $parametros = $request->all();

        $lista_quejas_sugerencias = QuejaSugerencia::select('quejas_sugerencias.*')
                            ->leftJoin('evidencias','evidencias.queja_sugerencia_id','=','quejas_sugerencias.id');

        // if(isset($parametros['tipo_sexo']) && $parametros['tipo_sexo']){
        //     $lista_quejas_sugerencias = $lista_donadores->where('sexo',$parametros['tipo_sexo']);
        // }

        // if(isset($parametros['query']) && $parametros['query']){
        //     $query_busqueda = $parametros['query'];
        //     $lista_quejas_sugerencias = $lista_quejas_sugerencias->where(function($query)use($query_busqueda){
        //         $query->where('donadores.nombre','like','%'.$query_busqueda.'%')
        //                 ->orWhere('apellido_paterno','like','%'.$query_busqueda.'%')
        //                 ->orWhere('apellido_materno','like','%'.$query_busqueda.'%')
        //                 ->orWhere('ciudad','like','%'.$query_busqueda.'%')
        //                 ->orWhere('codigo_postal','like','%'.$query_busqueda.'%')
        //                 ->orWhere('curp','like','%'.$query_busqueda.'%');
        //     });
        // }

        if(isset($parametros['page'])){
            $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 23;

            $lista_quejas_sugerencias = $lista_quejas_sugerencias->paginate($resultadosPorPagina);
            
        } else {
            $lista_quejas_sugerencias = $lista_quejas_sugerencias->get();
        }

        return response()->json(['data'=>$lista_quejas_sugerencias], HttpResponse::HTTP_OK);
    }


    // public function store(Request $request){

    //     ini_set('memory_limit', '-1');

    //     $reglas = [

    //         'folio'=>'required|unique:quejas_sugerencias',
    //         'motivo' => 'required',
    //         'observaciones' => 'required',
    //         'fecha_acontecimiento' => 'required|date',
    //         'esAnonimo' => 'required',

    //     ];

    //     $mensajes = [

    //         'folio.unique' => 'El Folio debe ser único',
    //         'motivo.required' => 'El motivo  del acontecimiento es requerido.',
    //         'observaciones.required' => 'El observaciones es requerido.',
    //         'fecha_acontecimiento.required'  => 'La fecha del acontecimiento es requerida.',
    //         'esAnonimo.required'  => 'Debe indicar si la queja o sugerencia es anonima.',

    //     ];


    //     $inputs = $request->all();

    //     $data_client = json_decode($inputs['data']);
    //     $datos = (array) $data_client;

    //     $datos['folio'] = Str::random(10);


    //     DB::beginTransaction();
    //     $resultado = Validator::make($datos,$reglas,$mensajes);

    //     if($resultado->passes()){
    //         $registro = QuejaSugerencia::create($datos);

    //         try{  
    //             $queja_sugerencia = QuejaSugerencia::find($registro->id);
                
    //             if($request->hasFile('archivo')) {
                    
    //                 $fileName = $queja_sugerencia->id;
    //                 $extension = $request->file('archivo')->getClientOriginalExtension();
    //                 if($extension == "jpg" || $extension == "jpeg")
    //                 {
    //                     $name = $fileName.".".$extension;
    //                     $request->file("archivo")->storeAs("public/EvidenciaQuejaSugerencia", $name);
    //                 }else{
    //                     return response()->json(['error' => "Formato de imagen incorrento, favor de verificar" ], HttpResponse::HTTP_CONFLICT);
    //                 }
                    
    //                 $queja_sugerencia_imagen = QuejaSugerencia::where("id",$queja_sugerencia->id)->first();

    //                 $queja_sugerencia_imagen->foto = 1;
    //                 $queja_sugerencia_imagen->extension = $extension;
    //                 $queja_sugerencia_imagen->save();
        
    //                 DB::commit();
    //             }else{

    //                 return response()->json(['mensaje' => '¡Se registro la Queja/Sugerencia con Éxito!', 'validacion'=>$resultado->passes(), 'datos'=>$registro], HttpResponse::HTTP_OK);

    //             }
                
            
    //             return response()->json(['data'=>$queja_sugerencia_imagen],HttpResponse::HTTP_OK);
    //         }catch(\Exception $e){
    //             DB::rollback();
    //             return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
    //         }

    //         return response()->json(['mensaje' => 'Guardado', 'validacion'=>$resultado->passes(), 'datos'=>$registro], HttpResponse::HTTP_OK);
    //     }else{
    //         return response()->json(['mensaje' => 'Error en los datos del formulario', 'status' => 409, 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_OK);
    //     }



    // }


    public function store(Request $request){

        ini_set('memory_limit', '-1');

        $datos = $request->all();
        

        $datos['folio'] = Str::random(10);

        $reglas = [

            'folio'=>'required|unique:quejas_sugerencias',
            'motivo' => 'required',
            //'observaciones' => 'required',
            'fecha_acontecimiento' => 'required|date',
            'esAnonimo' => 'required',

        ];

        $mensajes = [

            'folio.unique' => 'El Folio debe ser único',
            'motivo.required' => 'El motivo  del acontecimiento es requerido.',
            //'observaciones.required' => 'El observaciones es requerido.',
            'fecha_acontecimiento.required'  => 'La fecha del acontecimiento es requerida.',
            'esAnonimo.required'  => 'Debe indicar si la queja o sugerencia es anonima.',

        ];

        DB::beginTransaction();
        $resultado = Validator::make($datos, $reglas, $mensajes);
        if ($resultado->fails()) {

            return response()->json(['mensaje' => 'Error en los datos del formulario', 'status' => 409, 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);

        }else{

        try {

            $registro_queja_sugerencia = QuejaSugerencia::create($datos);

            $datos = (object) $datos;

            if(property_exists($datos, "evidencias")){
                $fotos = array_filter($datos->evidencias, function($v){return $v !== null;});

                Evidencia::where("queja_sugerencia_id", $registro_queja_sugerencia->id)->delete();

                foreach ($fotos as $key => $value) {
                    //validar que el valor no sea null
                    if($value != null){
                        //comprobar si el value es un array, si es convertirlo a object mas facil para manejar.
                        if(is_array($value))
                            $value = (object) $value;

                        if(property_exists($value, "id")) {
                            DB::update("update evidencias set deleted_at = null where id = $value->id and queja_sugerencia_id = $registro_queja_sugerencia->id");
                            //si existe actualizar
                            $evidencia = Evidencia::where("id", $value->id)->where("queja_sugerencia_id", $registro_queja_sugerencia->id)->first();

                            $evidencia->queja_sugerencia_id              = $registro_queja_sugerencia->id;
                            $evidencia->tipo                             = "imagen";
                            $evidencia->url                              = $value->url;

                            $evidencia->save();

                        }else{
                            foreach($value as $key => $img){
                                //comprobar si el value es un array, si es convertirlo a object mas facil para manejar.
                                if(is_array($img))
                                    $img = (object) $img;

                                if ($img->es_url == false){
                                    $evidencia = new Evidencia;

                                    $evidencia->queja_sugerencia_id              = $registro_queja_sugerencia->id;
                                    $evidencia->tipo                             = "imagen";
                                    $evidencia->url                              = $this->convertir_imagen($img->foto, 'evidencia', $registro_queja_sugerencia->id);

                                    $evidencia->save();
                                    DB::commit();
                                }else{
                                    if (file_exists(public_path()."/public/EvidenciaQuejaSugerencia/".$img->foto)){

                                        DB::update("update evidencias set deleted_at = null where url = '$img->foto' and queja_sugerencia_id = $registro_queja_sugerencia->id");

                                    }
                                }

                            }
                            return response()->json(['mensaje' => '¡Se registro la Queja/Sugerencia con Éxito!', 'validacion'=>$resultado->passes(), 'datos'=>$registro_queja_sugerencia], HttpResponse::HTTP_OK);
                        }
                    }
                }
            }

        } catch (\Throwable $th) {
            DB::rollback();
            return response()->json(['error'=>['message'=>$th->getMessage(),'line'=>$th->getLine()]], HttpResponse::HTTP_CONFLICT);
        }


        }

            
    }

    public function convertir_imagen($data, $nombre, $i){

        try{

            $data = base64_decode($data);
            $im = imagecreatefromstring($data);

            if ($im !== false) {
                $name = $i."_".$nombre.".jpg";
                header('Content-Type', 'image/jpeg');
                // $content = Storage::disk('public')->get('/EvidenciaQuejaSugerencia');
                // Storage::put('/public/EvidenciaQuejaSugerencia/'.$im.$name, $content);

                Storage::disk('evidencias')->put($im.$name, $data);
                imagedestroy($im);
                return $name;
            }
            else {
                return null;
            }
        }catch (\Exception $e) {

            return \Response::json(["error" => $e->getMessage(), "nombre" => $nombre], 400);
        }
    }


    


}