<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('order')->insert([
            [
                'user_id' => 2,
                'name' => 'Nguyễn Văn A',
                'email' => 'vana@example.com',
                'phone' => '0123456789',
                'address' => '123 Đường ABC, Quận 1, TP.HCM',
                'note' => 'Giao hàng nhanh',
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
                'address' => '456 Đường XYZ, Quận 3, TP.HCM',
                'note' => 'Giao hàng giờ hành chính',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
