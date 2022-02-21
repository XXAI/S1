<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
//use Illuminate\Database\Eloquent\SoftDeletes;

class QuejaSugerencia extends Model
{
    //use SoftDeletes;
    protected $table = 'quejas_sugerencias';
    protected $fillable = [
        
        'id',
        'folio',
        'esAnonimo',
        'nombre_completo',
        'numero_celular',
        'fecha_acontecimiento',
        'numero_de_placa',
        'lugar_acontecimiento',
        'motivo',
        'observaciones',

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
