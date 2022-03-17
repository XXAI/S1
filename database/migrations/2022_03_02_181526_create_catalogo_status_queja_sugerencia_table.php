<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCatalogoStatusQuejaSugerenciaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('catalogo_status_queja_sugerencia', function (Blueprint $table) {

            $table->id()->unsigned()->index();
            $table->string('nombre')->index();
            $table->string('descripcion')->nullable()->index();
            
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
        Schema::dropIfExists('catalogo_status_queja_sugerencia');
    }
}
