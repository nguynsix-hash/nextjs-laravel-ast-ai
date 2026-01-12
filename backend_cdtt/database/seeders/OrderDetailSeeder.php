<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderDetailSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('order_detail')->insert([
            [
                'order_id' => 1,
                'product_id' => 1,
                'price' => 15000000,
                'qty' => 2,
                'amount' => 30000000,
                'discount' => 0,
            ],
            [
                'order_id' => 1,
                'product_id' => 2,
                'price' => 25000000,
                'qty' => 1,
                'amount' => 25000000,
                'discount' => 500000,
            ],
            [
                'order_id' => 2,
                'product_id' => 3,
                'price' => 5000000,
                'qty' => 3,
                'amount' => 15000000,
                'discount' => 0,
            ],
        ]);
    }
}
