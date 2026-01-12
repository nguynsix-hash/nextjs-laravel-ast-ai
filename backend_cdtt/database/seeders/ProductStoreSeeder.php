<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductStoreSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_store')->insert([
            [
                'product_id' => 1,
                'price_root' => 15000000,
                'qty' => 50,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'product_id' => 2,
                'price_root' => 25000000,
                'qty' => 30,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'product_id' => 3,
                'price_root' => 5000000,
                'qty' => 100,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
