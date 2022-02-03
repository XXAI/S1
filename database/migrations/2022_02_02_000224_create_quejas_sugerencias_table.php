<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQuejasSugerenciasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('quejas_sugerencias', function (Blueprint $table) {

            $table->id()->unsigned();
            $table->string('folio',10)->index();
            $table->boolean('esAnonimo');
            $table->string('nombre_completo')->nullable();
            $table->integer('numero_celular')->unsigned()->nullable();
            $table->date('fecha_acontecimiento')->index();
            $table->string('numero_de_placa')->nullable()->index();
            $table->string('lugar_acontecimiento');
            $table->string('motivo');
            $table->string('observaciones');
            $table->smallInteger('foto')->nullable();
            $table->string('extension',10)->nullable();
            

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
        Schema::dropIfExists('quejas_sugerencias');
    }
}
