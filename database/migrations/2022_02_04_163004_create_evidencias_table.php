<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEvidenciasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('evidencias', function (Blueprint $table) {

            $table->id();
			$table->bigInteger('queja_sugerencia_id')->unsigned()->nullable()->index();
            //$table->string('extension',10)->nullable();
			$table->string('tipo', 191);
			$table->string('url', 191);
			$table->timestamps();
			$table->softDeletes();
            
        });

        Schema::table('evidencias', function($table) {

            $table->foreign('queja_sugerencia_id')->references('id')->on('quejas_sugerencias')->onUpdate('cascade');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('evidencias');
    }
}
