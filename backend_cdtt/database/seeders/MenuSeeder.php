<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('menu')->insert([
            [
                'name' => 'Trang chủ',
                'link' => '/',
                'type' => 'custom',
                'parent_id' => 0,
                'sort_order' => 1,
                'table_id' => null,
                'position' => 'mainmenu',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Danh mục điện thoại',
                'link' => '/category/dien-thoai',
                'type' => 'category',
                'parent_id' => 0,
                'sort_order' => 2,
                'table_id' => 1, // id category
                'position' => 'mainmenu',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Liên hệ',
                'link' => '/contact',
                'type' => 'page',
                'parent_id' => 0,
                'sort_order' => 3,
                'table_id' => null,
                'position' => 'mainmenu',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Footer Menu 1',
                'link' => '/about',
                'type' => 'page',
                'parent_id' => 0,
                'sort_order' => 1,
                'table_id' => null,
                'position' => 'footermenu',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
