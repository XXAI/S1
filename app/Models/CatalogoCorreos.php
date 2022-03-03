<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CatalogoCorreos extends Model{

    use SoftDeletes;
    //public $incrementing = false;
    protected $table = 'catalogo_correos';
    protected $fillable = ["id", "tipo_incidencia_id", "email", "nombre_responsable"];

    // public function tipo_incidencia(){
    //     return $this->belongsTo('App\Models\TipoIncidencia','queja_sugerencia_id');
    // }

}