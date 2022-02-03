<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ConcentradoExport;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Proyecto;
use App\Models\Concentrado;
use App\Models\Reporte;
use App\Models\Auditoria;
use App\Models\Checklist;

class ConcentradosController extends Controller
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
    
    public function obtenerConcentrado($id){
        try{
            $return_data = [];
            $concentrado = Concentrado::with('proyecto.direccion')->where('proyecto_id',$id)->first();

            if(!$concentrado){
                $return_data['concentrado'] = false;
                $proyecto = Proyecto::with('direccion')->find($id);
                $return_data['data'] = $proyecto;
            }else{
                $return_data['concentrado'] = true;

                $concentrado->load(['reportes'=>function($reportes){
                    $reportes->select('reportes.*', DB::raw('COUNT(checklists_reactivos.id) as total_checklist_reactivos'))
                            ->leftjoin('checklists','checklists.id','=','reportes.checklist_id')
                            ->leftjoin('checklists_titulos','checklists_titulos.checklist_id','=','checklists.id')
                            ->leftjoin('checklists_reactivos','checklists_reactivos.checklist_titulo_id','=','checklists_titulos.id')
                            ->groupBy('reportes.id');
                },'reportes.auditoria','reportes.respuestas'=>function($respuestas){
                    $respuestas->select('reportes_respuestas.reporte_id', DB::raw('COUNT(IF(reportes_respuestas.tiene_informacion,1,NULL)) as total_positivos'), DB::raw('COUNT(IF(reportes_respuestas.no_aplica,1,NULL)) as total_no_aplica'))
                                ->groupBy('reporte_id');
                }]);

                $return_data['data'] = $concentrado;
            }

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function obtenerChecklist(){
        try{
            $auditorias = Auditoria::get();
            $checklist = Checklist::with('titulos.reactivos')->where('activo',1)->first();

            $return_data = [
                'auditorias' => $auditorias,
                'checklist' => $checklist
            ];
            
            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function obtenerReporte(Request $request){
        try{
            $parametros = $request->all();

            $reporte = Reporte::with('respuestas')
                                ->where('id',$parametros['reporte_id'])
                                ->where('auditoria_id',$parametros['auditoria_id'])
                                ->where('checklist_id',$parametros['checklist_id'])->first();

            $return_data = ['data' => $reporte];
            
            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function guardarReporte(Request $request){
        try{
            $parametros = $request->all();

            $concentrado = Concentrado::where('proyecto_id',$parametros['proyecto_id'])->where('direccion_id',$parametros['direccion_id'])->first();
            $parametros['ultimo_reporte'] = $parametros['fecha'];
            if(!$concentrado){
                $concentrado = Concentrado::create($parametros);
            }else{
                $concentrado->update($parametros);
            }

            $reporte = Reporte::where('concentrado_id',$concentrado->id)->where('auditoria_id',$parametros['auditoria_id'])->where('checklist_id',$parametros['checklist_id'])->first();
            if(!$reporte){
                $parametros['concentrado_id'] = $concentrado->id;
                $reporte = Reporte::create($parametros);
                $reporte->respuestas()->createMany($parametros['respuestas']);
            }else{
                $reporte->update($parametros);
                $reporte->load('respuestas');
                $respuestas_guardadas = [];
                foreach ($reporte->respuestas as $respuesta) {
                    $respuestas_guardadas[$respuesta->id] = $respuesta;
                }
                $crear_respuestas = [];
                foreach ($parametros['respuestas'] as $respuesta) {
                    if($respuesta['respuesta_id']){
                        $editar = $respuestas_guardadas[$respuesta['respuesta_id']];
                        $editar->update($respuesta);
                    }else{
                        $crear_respuestas[] = $respuesta;
                    }
                }
                if(count($crear_respuestas) > 0){
                    $reporte->respuestas()->createMany($crear_respuestas);
                }
            }

            $concentrado = Reporte::select('reportes.*', DB::raw('COUNT(checklists_reactivos.id) as total_checklist_reactivos'))
                                    ->leftjoin('checklists','checklists.id','=','reportes.checklist_id')
                                    ->leftjoin('checklists_titulos','checklists_titulos.checklist_id','=','checklists.id')
                                    ->leftjoin('checklists_reactivos','checklists_reactivos.checklist_titulo_id','=','checklists_titulos.id')
                                    ->groupBy('reportes.id')
                                    ->with(['auditoria','respuestas'=>function($respuestas){
                                        $respuestas->select('reportes_respuestas.reporte_id', DB::raw('COUNT(IF(reportes_respuestas.tiene_informacion,1,NULL)) as total_positivos'), DB::raw('COUNT(IF(reportes_respuestas.no_aplica,1,NULL)) as total_no_aplica'))
                                                    ->groupBy('reporte_id');
                                    }])
                                    ->where('reportes.id',$reporte->id)->first();

            $return_data['data'] = $concentrado;

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
    public function exportExcel(Request $request){
        ini_set('memory_limit', '-1');
        try{
            $parametros = $request->all();
            $auth_user = auth()->user();
            
            $concentrado = Reporte::select('reportes.*', DB::raw('COUNT(checklists_reactivos.id) as total_checklist_reactivos'))
                                    ->leftjoin('checklists','checklists.id','=','reportes.checklist_id')
                                    ->leftjoin('checklists_titulos','checklists_titulos.checklist_id','=','checklists.id')
                                    ->leftjoin('checklists_reactivos','checklists_reactivos.checklist_titulo_id','=','checklists_titulos.id')
                                    ->groupBy('reportes.id')
                                    ->with(['concentrado.proyecto.direccion','auditoria','respuestas'=>function($respuestas){
                                        $respuestas->select('reportes_respuestas.reporte_id', DB::raw('COUNT(IF(reportes_respuestas.tiene_informacion,1,NULL)) as total_positivos'), 
                                                            DB::raw('COUNT(IF(reportes_respuestas.no_aplica,1,NULL)) as total_no_aplica'))
                                                    ->groupBy('reporte_id');
                                    }])
                                    ->where('reportes.id',$parametros['id'])->first();
            $reporte_id = $parametros['id'];
            $checklist = Checklist::with(['titulos.reactivos'=>function($reactivos)use($reporte_id){
                $reactivos->select('checklists_reactivos.*','reportes_respuestas.tiene_informacion','reportes_respuestas.no_aplica','reportes_respuestas.comentarios')
                            ->leftjoin('reportes_respuestas',function($join)use($reporte_id){
                                $join->on('reportes_respuestas.checklist_reactivo_id','=','checklists_reactivos.id')->where('reportes_respuestas.reporte_id',$reporte_id)->whereNull('reportes_respuestas.deleted_at');
                            });
            }])->where('activo',1)->first();

            $filename = 'concentrado';
            $data = [
                'checklist' => $checklist,
                'concentrado' => $concentrado
            ];
            
            return (new ConcentradoExport($data))->download($filename.'.xlsx');
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }

    private function getUserAccessData($loggedUser = null){
        if(!$loggedUser){
            $loggedUser = auth()->userOrFail();
        }
        
        //$loggedUser->load('grupos.unidadesMedicas','grupos.unidadMedicaPrincipal');
        
        //$lista_clues = [];
        /*foreach ($loggedUser->grupos as $grupo) {
            $lista_unidades = $grupo->unidadesMedicas->toArray();
            
            $lista_clues += $lista_clues + $lista_unidades;
        }*/
        //$accessData->lista_clues = $lista_clues;

        $accessData = (object)[];

        /*if (\Gate::allows('has-permission', \Permissions::ADMIN_PERSONAL_ACTIVO)){
            $accessData->is_admin = true;
        }else{
            $accessData->is_admin = false;
        }*/

        return $accessData;
    }
}
