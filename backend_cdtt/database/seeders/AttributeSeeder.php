<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('attribute')->insert([
            [
                'name' => 'Màu sắc',
            ],
            [
                'name' => 'Kích thước',
            ],
            [
                'name' => 'Chất liệu',
            ],
            [
                'name' => 'Trọng lượng',
            ],
            [
                'name' => 'Dung lượng pin',
            ],
        ]);
    }
}
