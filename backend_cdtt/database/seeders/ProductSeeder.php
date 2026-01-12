<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product')->insert([
            [
                'category_id' => 1,
                'name' => 'iPhone 13',
                'slug' => 'iphone-13',
                'thumbnail' => 'iphone-13-thumb.jpg',
                'content' => 'Chi tiết sản phẩm iPhone 13 với màn hình 6.1 inch, camera kép, chip A15.',
                'description' => 'iPhone 13 chính hãng, mới 100%',
                'price_buy' => 15000000,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'category_id' => 2,
                'name' => 'Laptop Dell Inspiron',
                'slug' => 'laptop-dell-inspiron',
                'thumbnail' => 'laptop-dell-thumb.jpg',
                'content' => 'Laptop Dell Inspiron với RAM 16GB, SSD 512GB, Intel i7.',
                'description' => 'Laptop Dell hiệu năng cao, bảo hành 12 tháng',
                'price_buy' => 25000000,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'category_id' => 3,
                'name' => 'Tai nghe Bluetooth',
                'slug' => 'tai-nghe-bluetooth',
                'thumbnail' => 'headphone-thumb.jpg',
                'content' => 'Tai nghe Bluetooth chất lượng cao, chống ồn, pin 20h.',
                'description' => 'Tai nghe tiện dụng, âm thanh sống động',
                'price_buy' => 5000000,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
