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
        'motivo',
        'observaciones',
        'lugar_acontecimiento',
        'fecha_acontecimiento',
        'foto',
        'extension',
        'esAnonimo',
        'nombre_completo',
        'numero_celular'
    ];

    // public function entidad_federativa(){
    //     return $this->belongsTo('App\Models\EntidadFederativa','entidad_federativa_id');
    // }

    // public function seguro(){
    //     return $this->belongsTo('App\Models\Seguro','seguro_id');
    // }

}
