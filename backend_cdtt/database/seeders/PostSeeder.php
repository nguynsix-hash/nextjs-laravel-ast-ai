<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('post')->insert([
            [
                'topic_id' => 1,
                'title' => 'Bài viết hướng dẫn sử dụng iPhone',
                'slug' => 'huong-dan-su-dung-iphone',
                'image' => 'iphone-guide.jpg',
                'content' => 'Nội dung chi tiết hướng dẫn sử dụng iPhone...',
                'description' => 'Hướng dẫn sử dụng iPhone cơ bản.',
                'post_type' => 'post',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'topic_id' => 2,
                'title' => 'Chính sách bảo hành sản phẩm',
                'slug' => 'chinh-sach-bao-hanh',
                'image' => 'warranty.jpg',
                'content' => 'Nội dung chính sách bảo hành...',
                'description' => 'Thông tin bảo hành sản phẩm.',
                'post_type' => 'page',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'topic_id' => null,
                'title' => 'Tin tức công nghệ mới nhất',
                'slug' => 'tin-tuc-cong-nghe-moi-nhat',
                'image' => 'tech-news.jpg',
                'content' => 'Cập nhật các tin tức công nghệ mới nhất...',
                'description' => 'Tin tức công nghệ hàng ngày.',
                'post_type' => 'post',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
