<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seguro extends Model
{
    use SoftDeletes;
    protected $table = 'seguros';
    protected $fillable = ['descripcion'];
}
