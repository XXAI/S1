<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estatus extends Model{

    use SoftDeletes;
    //public $incrementing = false;
    protected $table = 'catalogo_status_queja_sugerencia';
    protected $fillable = ["id", "nombre", "descripcion"];

    // public function tipo_incidencia(){
    //     return $this->belongsTo('App\Models\TipoIncidencia','queja_sugerencia_id');
    // }

}