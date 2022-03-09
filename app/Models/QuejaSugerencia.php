<?php

namespace App\Models;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;
//use Illuminate\Database\Eloquent\SoftDeletes;

class QuejaSugerencia extends Model
{
    //use SoftDeletes;
    protected $table = 'quejas_sugerencias';
    protected $fillable = [
        
        'id',
        'tipo_incidencia_id',
        'folio',
        'esAnonimo',
        'nombre_completo',
        'numero_celular',
        'fecha_acontecimiento',
        'numero_de_placa',
        'lugar_acontecimiento',
        'motivo',
        'observaciones',
        'datos_usuarios',
        'preguntas',
        'respuestas'

    ];

    protected $casts = [

        'preguntas' => Json::class,
        'respuestas' => Json::class
        
    ];

    public function evidencias(){
        return $this->hasMany('App\Models\Evidencia','queja_sugerencia_id');
    }

    // public function entidad_federativa(){
    //     return $this->belongsTo('App\Models\EntidadFederativa','entidad_federativa_id');
    // }

    // public function seguro(){
    //     return $this->belongsTo('App\Models\Seguro','seguro_id');
    // }

}
