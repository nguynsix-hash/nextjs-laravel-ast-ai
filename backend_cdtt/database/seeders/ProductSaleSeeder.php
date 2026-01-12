<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSaleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_sale')->insert([
            [
                'name' => 'Giảm giá iPhone 13',
                'product_id' => 1,
                'price_sale' => 14000000, // Giá giảm
                'date_begin' => now(),
                'date_end' => now()->addDays(7),
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Khuyến mãi Laptop Dell',
                'product_id' => 2,
                'price_sale' => 23000000,
                'date_begin' => now(),
                'date_end' => now()->addDays(10),
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Giảm giá tai nghe',
                'product_id' => 3,
                'price_sale' => 4500000,
                'date_begin' => now(),
                'date_end' => now()->addDays(5),
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
