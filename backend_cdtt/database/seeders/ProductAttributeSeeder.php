<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductAttributeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_attribute')->insert([
            [
                'product_id' => 1,
                'attribute_id' => 1, // Màu sắc
                'value' => 'Đen',
            ],
            [
                'product_id' => 1,
                'attribute_id' => 2, // Kích thước
                'value' => '6.1 inch',
            ],
            [
                'product_id' => 2,
                'attribute_id' => 1, // Màu sắc
                'value' => 'Trắng',
            ],
            [
                'product_id' => 2,
                'attribute_id' => 2, // Kích thước
                'value' => '15 inch',
            ],
            [
                'product_id' => 3,
                'attribute_id' => 3, // Chất liệu
                'value' => 'Nhựa cao cấp',
            ],
        ]);
    }
}
