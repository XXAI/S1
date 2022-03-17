<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAclaracionesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('aclaraciones', function (Blueprint $table) {
            
            $table->id()->unsigned();
            $table->unsignedBigInteger('queja_sugerencia_id')->index();
            $table->unsignedBigInteger('estatus_id')->index();
            $table->date('fecha')->index();
            $table->string('observaciones')->index();
            $table->integer('user_id')->unsigned()->index();

            $table->timestamps();
            $table->softDeletes();

        });

        Schema::table('aclaraciones', function($table) {

            $table->foreign('estatus_id')->references('id')->on('catalogo_status_queja_sugerencia');
            $table->foreign('queja_sugerencia_id')->references('id')->on('quejas_sugerencias');
            $table->foreign('user_id')->references('id')->on('users');

        });



        
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('aclaraciones');
    }
}
