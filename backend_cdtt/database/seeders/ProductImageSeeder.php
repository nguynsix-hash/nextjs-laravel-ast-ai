<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_images')->insert([
            [
                'product_id' => 1,
                'image' => 'iphone-13-front.jpg',
                'alt' => 'iPhone 13 Front',
                'title' => 'iPhone 13 mặt trước',
            ],
            [
                'product_id' => 1,
                'image' => 'iphone-13-back.jpg',
                'alt' => 'iPhone 13 Back',
                'title' => 'iPhone 13 mặt sau',
            ],
            [
                'product_id' => 2,
                'image' => 'laptop-dell.jpg',
                'alt' => 'Laptop Dell',
                'title' => 'Laptop Dell Inspiron',
            ],
            [
                'product_id' => 3,
                'image' => 'headphone.jpg',
                'alt' => 'Tai nghe',
                'title' => 'Tai nghe chất lượng cao',
            ],
        ]);
    }
}
