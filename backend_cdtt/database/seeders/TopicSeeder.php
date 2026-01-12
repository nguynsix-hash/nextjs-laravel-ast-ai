<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TopicSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('topic')->insert([
            [
                'name' => 'Công nghệ',
                'slug' => 'cong-nghe',
                'sort_order' => 1,
                'description' => 'Chủ đề về công nghệ mới nhất',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Tin tức',
                'slug' => 'tin-tuc',
                'sort_order' => 2,
                'description' => 'Chủ đề tin tức hàng ngày',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Hướng dẫn',
                'slug' => 'huong-dan',
                'sort_order' => 3,
                'description' => 'Chủ đề hướng dẫn sử dụng sản phẩm',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
