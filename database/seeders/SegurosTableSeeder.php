<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use DB;

class SegurosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $archivo_csv = storage_path().'/app/seeds/seguros.csv';
        $query = sprintf("
            LOAD DATA local INFILE '%s' 
            INTO TABLE seguros
            CHARACTER SET utf8 
            FIELDS TERMINATED BY ',' 
            OPTIONALLY ENCLOSED BY '\"' 
            ESCAPED BY '\\\\' 
            LINES TERMINATED BY '\\n' 
            IGNORE 1 LINES", addslashes($archivo_csv));
        DB::connection()->getpdo()->exec($query);
    }
}
