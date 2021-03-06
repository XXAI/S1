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



class QJGeneralesController extends Controller
{

        /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $parametros = $request->all();

        $lista_quejas_sugerencias = QuejaSugerencia::select('quejas_sugerencias.*')->with('tipo_incidencia')
        ->whereIn('tipo_incidencia_id', [1,2,3]);

        // if(isset($parametros['tipo_sexo']) && $parametros['tipo_sexo']){
        //     $lista_quejas_sugerencias = $lista_donadores->where('sexo',$parametros['tipo_sexo']);
        // }


        if(isset($parametros['query']) && $parametros['query']){
            $lista_quejas_sugerencias = $lista_quejas_sugerencias->where(function($query)use($parametros){
                return $query->orWhere('folio','LIKE','%'.$parametros['query'].'%');
            });
        }

        if(isset($parametros['active_filter']) && $parametros['active_filter']){

            if(isset($parametros['query']) && $parametros['query']){
                $lista_quejas_sugerencias = $lista_quejas_sugerencias->where(function($query)use($parametros){
                    return $query->orWhere('folio','LIKE','%'.$parametros['query'].'%');
                });
            }
    

            if(isset($parametros['tipo_incidencia_id']) && $parametros['tipo_incidencia_id']){

                $lista_quejas_sugerencias = $lista_quejas_sugerencias->where('tipo_incidencia_id',$parametros['tipo_incidencia_id']);

            }

            if(isset($parametros['fecha_inicio'], $parametros['fecha_fin'])){

                $lista_quejas_sugerencias = $lista_quejas_sugerencias->whereBetween(DB::raw('DATE(created_at)'), [$parametros['fecha_inicio'], $parametros['fecha_fin']]);

            }
            

        }

        if(isset($parametros['page'])){
            $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 23;

            $lista_quejas_sugerencias = $lista_quejas_sugerencias->paginate($resultadosPorPagina);
            
        } else {
            $lista_quejas_sugerencias = $lista_quejas_sugerencias->get();
        }

        return response()->json(['data'=>$lista_quejas_sugerencias], HttpResponse::HTTP_OK);
    }

    public function ImprimirQSGeneral(Request $request, $id)
    {
        try{

            $parametros = $request->all();

            $queja_sugerencia = QuejaSugerencia::with('tipo_incidencia')->find($id);
                            
            
        return response()->json(['data'=>$queja_sugerencia],HttpResponse::HTTP_OK);

        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }



}