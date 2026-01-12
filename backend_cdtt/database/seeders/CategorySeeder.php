<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('category')->insert([
            [
                'name' => 'Điện thoại',
                'slug' => 'dien-thoai',
                'image' => null,
                'parent_id' => 0,
                'sort_order' => 1,
                'description' => 'Danh mục điện thoại',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Laptop',
                'slug' => 'laptop',
                'image' => null,
                'parent_id' => 0,
                'sort_order' => 2,
                'description' => 'Danh mục laptop',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Phụ kiện',
                'slug' => 'phu-kien',
                'image' => null,
                'parent_id' => 0,
                'sort_order' => 3,
                'description' => 'Danh mục phụ kiện',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
