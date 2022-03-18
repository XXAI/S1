<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seguimiento extends Model{

    use SoftDeletes;
    //public $incrementing = false;
    protected $table = 'seguimientos';
    protected $fillable = [
        "id",
        "queja_sugerencia_id",
        "estatus_id",
        "fecha",
        "observaciones",
        "user_id"
    ];

    public function estatus(){
        return $this->belongsTo('App\Models\Estatus','estatus_id');
    }

    public function queja_sugerencia(){
        return $this->belongsTo('App\Models\QuejaSugerencia','queja_sugerencia_id');
    }

}