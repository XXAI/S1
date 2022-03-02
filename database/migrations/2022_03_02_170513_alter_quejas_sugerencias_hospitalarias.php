<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterQuejasSugerenciasHospitalarias extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quejas_sugerencias', function (Blueprint $table) {

            $table->smallInteger('tipo_incidencia_id')->unsigned()->nullable()->index()->after('id');
            $table->json('datos_usuarios')->index()->nullable()->after('observaciones');
            $table->json('preguntas')->index()->nullable()->after('datos_usuarios');
            $table->json('respuestas')->index()->nullable()->after('preguntas');

            $table->string('folio')->nullable(true)->change();
            $table->boolean('esAnonimo')->nullable(true)->change();
            $table->date('fecha_acontecimiento')->nullable(true)->change();
            $table->string('lugar_acontecimiento')->nullable(true)->change();
            $table->string('motivo')->nullable(true)->change();
    
            
            // $table->foreign('estado_republica_id')->references('id')->on('estados_republica')->onUpdate('cascade');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('quejas_sugerencias', function (Blueprint $table) {
            
            $table->dropColumn('tipo_incidencia_id');
            $table->dropColumn('datos_usuarios');
            $table->dropColumn('preguntas');
            $table->dropColumn('respuestas');

            $table->string('folio')->nullable(false)->change();
            $table->boolean('esAnonimo')->nullable(false)->change();
            $table->date('fecha_acontecimiento')->nullable(false)->change();
            $table->string('lugar_acontecimiento')->nullable(false)->change();
            $table->string('motivo')->nullable(false)->change();
            
        });
    }
}
