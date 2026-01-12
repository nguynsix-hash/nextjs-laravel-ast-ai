<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConfigSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('config')->insert([
            [
                'site_name' => 'Website Demo',
                'email' => 'info@example.com',
                'phone' => '0123456789',
                'hotline' => '0987654321',
                'address' => '123 Đường ABC, Quận 1, TP.HCM',
                'status' => 1,
            ],
        ]);
    }
}
