<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('contact')->insert([
            [
                'user_id' => 1,
                'name' => 'Nguyễn Văn A',
                'email' => 'vana@example.com',
                'phone' => '0123456789',
                'content' => 'Tôi muốn hỏi về sản phẩm A.',
                'reply_id' => 0,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'user_id' => 2,
                'name' => 'Trần Thị B',
                'email' => 'ttb@example.com',
                'phone' => '0987654321',
                'content' => 'Tôi muốn tư vấn sản phẩm B.',
                'reply_id' => 0,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
