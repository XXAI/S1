<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

use App\Http\Requests;

use \Validator, Exception \Hash, \Response, \File, \Store;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendMail;
use Illuminate\Support\Str;


use App\Models\QuejaSugerencia;
use App\Models\CatalogoCorreos;
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

        $lista_qj_generales = QuejaSugerencia::select('quejas_sugerencias.*')->with('evidencias')
        ->where('tipo_incidencia_id', 4);

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

            $lista_qj_generales = $lista_qj_generales->paginate($resultadosPorPagina);
            
        } else {
            $lista_qj_generales = $lista_qj_generales->get();
        }

        return response()->json(['data'=>$lista_qj_generales], HttpResponse::HTTP_OK);
    }

    public function ImprimirQS(Request $request, $id)
    {
        try{

            $parametros = $request->all();

            $queja_sugerencia = QuejaSugerencia::with('evidencias')->find($id);

            foreach ($queja_sugerencia->evidencias as $key => $value) {

                $queja_sugerencia->evidencias[$key] = base64_encode(Storage::disk('evidencias')->get($value->url));
            
            }
                            
            
        return response()->json(['data'=>$queja_sugerencia],HttpResponse::HTTP_OK);

        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
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
        

        $datos['folio'] = mb_strtoupper(Str::random(10), 'UTF-8');

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

        
        $resultado = Validator::make($datos, $reglas, $mensajes);
        
        
        if ($resultado->fails()) {

            return response()->json(['mensaje' => 'Error en los datos del formulario', 'status' => 409, 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);

        }else{

            DB::beginTransaction();
            try {
                


                $data = QuejaSugerencia::create($datos);
                $this->sendEmail($data->folio);
                DB::commit();

                if(!empty($datos['evidencias']['img'])){

                    $this->insertarEvidencias($datos, $data->id);

                }
                

                return response()->json(['mensaje' => '¡Se registro la Queja/Sugerencia con Éxito!', 'validacion'=>$resultado->passes(), 'datos'=>$data], HttpResponse::HTTP_OK);

            } catch (\Throwable $th) {
                DB::rollback();
                return response()->json(['error'=>['message'=>$th->getMessage(),'line'=>$th->getLine()]], HttpResponse::HTTP_CONFLICT);
            }

        }

            
    }

    public function show($id)
    {

        $queja_sugerencia = QuejaSugerencia::select('quejas_sugerencias.*')->with('tipo_incidencia')->find($id);

        if(!$queja_sugerencia){
            return response()->json(['No se encuentra la Aclaración que esta buscando.'], HttpResponse::HTTP_CONFLICT);
            //404
        }

        return response()->json(['data' => $queja_sugerencia], 200);
    }

    public function insertarEvidencias($datos, $id){

        try {

            $datos = (object) $datos;

            if(property_exists($datos, "evidencias")){
                $fotos = array_filter($datos->evidencias, function($v){return $v !== null;});

                Evidencia::where("queja_sugerencia_id", $datos->id)->delete();

                foreach ($fotos as $key => $value) {
                    //validar que el valor no sea null
                    if($value != null){
                        //comprobar si el value es un array, si es convertirlo a object mas facil para manejar.
                        if(is_array($value))
                            $value = (object) $value;

                            

                            foreach($value as $key => $img){
                                //comprobar si el value es un array, si es convertirlo a object mas facil para manejar.
                                if(is_array($img))
                                    $img = (object) $img;

                                    

                                if ($img->es_url == false){

                                    $evidencia = new Evidencia;

                                    $evidencia->queja_sugerencia_id              = $id;
                                    $evidencia->tipo                             = "imagen";
                                    $evidencia->url                              = $this->convertir_imagen($img->foto, 'evidencia', $id);
                                    $evidencia->save();
                                    DB::commit();
                                }

                            }
                            
                        
                    }
                }
            }

        } catch (\Throwable $th) {
            DB::rollback();
            return response()->json(['error'=>['message'=>$th->getMessage(),'line'=>$th->getLine()]], HttpResponse::HTTP_CONFLICT);
        }


    }

    public function sendEmail($folio_registro){

        $correos = CatalogoCorreos::select('catalogo_correos.*')
        ->where('tipo_incidencia_id', 4)
        ->get();
        

        $folio = $this->cargarFolio($folio_registro);
        
        foreach ($correos as $key => $correo) {

            Mail::to($correo->email)->send(new SendMail($folio));
        }
        // Mail::to('alejandro_gosain@hotmail.com')
        //     ->cc(['miguelaespinosa01@gmail.com','ragucaru80@gmail.com'])
        //     ->send(new SendMail($folio));




    }


    public function cargarFolio($folio){
      $queja_sugerencia = DB::table('quejas_sugerencias')->where('folio', $folio)->first();

      if($queja_sugerencia) {
        return $queja_sugerencia->folio;
      }

    }

    public function convertir_imagen($data, $nombre, $i){

        try{

            $data = base64_decode($data);
            $im = imagecreatefromstring($data);

            if ($im !== false) {
                $name = $i."_".$nombre.".jpg";
                header('Content-Type', 'image/jpeg');

                //dd($im.$name);
                // $content = Storage::disk('public')->get('/EvidenciaQuejaSugerencia');
                // Storage::put('/public/EvidenciaQuejaSugerencia/'.$im.$name, $content);

                Storage::disk('evidencias')->put($im.$name, $data);
                imagedestroy($im);
                return $im.$name;
            }
            else {
                return null;
            }
        }catch (\Exception $e) {

            return \Response::json(["error" => $e->getMessage(), "nombre" => $nombre], 400);
        }
    }



}