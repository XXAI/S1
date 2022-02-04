<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evidencia extends Model{

    use SoftDeletes;
    //public $incrementing = false;
    protected $table = 'evidencias';
    protected $fillable = ["id", "queja_sugerencia_id", "tipo", "url"];

    public function quejas_sugerencias(){
        return $this->belongsTo('App\Models\QuejaSugerencia','queja_sugerencia_id');
    }

}