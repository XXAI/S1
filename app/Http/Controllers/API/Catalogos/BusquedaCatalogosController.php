<?php

namespace App\Http\Controllers\API\Catalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use App\Http\Controllers\Controller;

use App\Models\TipoIncidencia;
use App\Models\Estatus;



class BusquedaCatalogosController extends Controller
{

    public function obtenerCatalogos(Request $request)
    {
        try {
            $listado_catalogos = [
                
                'tipo_incidencia'   => TipoIncidencia::getModel(),
                'estatus'           => Estatus::orderBy('id'),

            ];

            //$parametros = Input::all();
            $parametros = $request->all();

            $catalogos = [];
            for ($i = 0; $i < count($parametros); $i++) {
                $catalogo = $parametros[$i]; //podemos agregar filtros y ordenamiento

                if (isset($listado_catalogos[$catalogo['nombre']])) {
                    $modelo = $listado_catalogos[$catalogo['nombre']];
                    //podemos agregar filtros y ordenamiento
                    if (isset($catalogo['orden']) && $catalogo['orden']) { //hacer arrays
                        $modelo = $modelo->orderBy($catalogo['orden']);
                    }
                    //throw new \Exception(isset($catalogo['filtro_id']), 1);
                    if (isset($catalogo['filtro_id']) && $catalogo['filtro_id']) {  //hacer arrays

                        $modelo = $modelo->where($catalogo['filtro_id']['campo'], $catalogo['filtro_id']['valor']);
                    }

                    if (isset($catalogo['filtro_some_id']) && $catalogo['filtro_some_id']) {  //hacer arrays

                        $modelo = $modelo->whereIn($catalogo['filtro_some_id']['campo'], $catalogo['filtro_some_id']['valor']);
                    }

                    $catalogos[$catalogo['nombre']] = $modelo->get(); //por el momento bastara con esto
                } else {
                    $catalogos[$catalogo['nombre']] = '404';
                }
            }

            return response()->json(['data' => $catalogos], HttpResponse::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => ['message' => $e->getMessage(), 'line' => $e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

}
