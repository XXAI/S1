<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Proyecto;

class ProyectosController extends Controller
{

    public function datosCatalogo(){
        try{
            $data = [];
            $data = $this->getUserAccessData();

            return response()->json(['data'=>$data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try{
            $accessData = $this->getUserAccessData();
            $parametros = $request->all();
            
            $proyectos = Proyecto::with('direccion');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $proyectos = $proyectos->where(function($query)use($parametros){
                    return $query->where('clave','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('direccion','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(!$accessData->is_superuser){
                $proyectos = $proyectos->where(function($query)use($accessData){
                                                    $query->whereIn('direccion_id',$accessData->direcciones_ids)
                                                            ->orWhereIn('id',$accessData->proyectos_ids);
                                                });
            }
            
            $proyectos = $proyectos->orderBy('updated_at','desc');

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $proyectos = $proyectos->paginate($resultadosPorPagina);

            } else {
                $proyectos = $proyectos->get();
            }

            return response()->json(['data'=>$proyectos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try{
            $return_data = ['data'=>[]];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try{
            $return_data['data'] = [];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    private function getUserAccessData($loggedUser = null){
        if(!$loggedUser){
            $loggedUser = auth()->userOrFail();
        }
        
        $loggedUser->load('direcciones','proyectos');

        $accessData = (object)[];

        $accessData->direcciones_ids = $loggedUser->direcciones->pluck('id');
        $accessData->proyectos_ids = $loggedUser->proyectos->pluck('id');
        $accessData->is_superuser = $loggedUser->is_superuser;

        return $accessData;
    }
}
