<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCatalogoCorreosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('catalogo_correos', function (Blueprint $table) {
            
            $table->smallIncrements('id')->unsigned();
            $table->smallInteger('tipo_incidencia_id')->unsigned()->index();
            $table->string('email')->index();
            $table->string('nombre_responsable')->index();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('catalogo_correos');
    }
}
