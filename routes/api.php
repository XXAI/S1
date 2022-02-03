<?php

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('logout',   'API\Auth\AuthController@logout');
    Route::get('perfil',   'API\Auth\AuthController@me');
});

Route::post('signin',   'API\Auth\AuthController@login');
Route::post('refresh',  'API\Auth\AuthController@refresh');

/**
 *  Para envio de correos
 */
Route::get('enviar-recuperar-pass',             'API\Admin\MailerController@enviarRecuperarContrasena');

Route::post('catalogos',                        'API\Catalogos\BusquedaCatalogosController@obtenerCatalogos');
Route::get('qr-donador/{codigo}',      'API\Modulos\DonantesController@obtenerDatosDonante');

//Donantes Lista
Route::apiResource('quejas-sugerencias',  'API\Modulos\QuejasSugerenciasController');


Route::group(['middleware'=>'auth'],function($router){
    Route::apiResource('user',          'API\Admin\UserController');
    Route::get('user-catalogs',         'API\Admin\UserController@getCatalogs');

    Route::apiResource('permission',    'API\Admin\PermissionController');
    Route::apiResource('role',          'API\Admin\RoleController');
    Route::apiResource('profile',       'API\ProfileController')->only([ 'show', 'update']);

    //Modulos del Sistema
    Route::apiResource('proyectos',              'API\Modulos\ProyectosController')->only(['index','show']);
    Route::get('catalogo-direcciones',           'API\Modulos\DireccionesController@datosDirecciones');
    Route::get('concentrado-proyecto/{id}',      'API\Modulos\ConcentradosController@obtenerConcentrado');
    Route::get('concentrado-checklist',          'API\Modulos\ConcentradosController@obtenerChecklist');
    Route::get('reporte-respuestas',             'API\Modulos\ConcentradosController@obtenerReporte');
    Route::post('guardar-reporte',               'API\Modulos\ConcentradosController@guardarReporte');
    Route::get('exportar-concentrado',           'API\Modulos\ConcentradosController@exportExcel');

    /**
     *  Modulo de Reportes
     */
    Route::get('ejecutar-query',                    'API\Admin\DevReporterController@executeQuery');
    Route::get('exportar-query',                    'API\Admin\DevReporterController@exportExcel');

    /**
     * Catalogo
     */

    Route::get('public//FormatoQuejaSugerencia//default.jpg', function($filename) {
        $file = \Illuminate\Support\Facades\Storage::get($filename);
        return response($file, 200) -> header('Content-Type', 'image/jpeg');
     });
});

Route::middleware('auth')->get('/avatar-images', function (Request $request) {
    $avatars_path = public_path() . config('ng-client.path') . '/assets/avatars';
    $image_files = glob( $avatars_path . '/*', GLOB_MARK );

    $root_path = public_path() . config('ng-client.path');

    $clean_path = function($value)use($root_path) {
        return str_replace($root_path,'',$value);
    };
    
    $avatars = array_map($clean_path, $image_files);

    return response()->json(['images'=>$avatars], HttpResponse::HTTP_OK);
});