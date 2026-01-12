<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user')->insert([
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'phone' => '0123456789',
                'username' => 'admin',
                'password' => Hash::make('123456'), // Mật khẩu đã hash
                'roles' => 'admin',
                'avatar' => null,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Nguyễn Văn A',
                'email' => 'vana@example.com',
                'phone' => '0987654321',
                'username' => 'vana',
                'password' => Hash::make('123456'),
                'roles' => 'customer',
                'avatar' => null,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Trần Thị B',
                'email' => 'ttb@example.com',
                'phone' => '0912345678',
                'username' => 'ttb',
                'password' => Hash::make('123456'),
                'roles' => 'customer',
                'avatar' => null,
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
