<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('banner')->insert([
            [
                'name' => 'Slide 1',
                'image' => 'slide1.jpg',
                'link' => '#',
                'position' => 'slideshow',
                'sort_order' => 1,
                'description' => 'Banner slideshow đầu tiên',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Quảng cáo 1',
                'image' => 'ads1.jpg',
                'link' => '#',
                'position' => 'ads',
                'sort_order' => 2,
                'description' => 'Banner quảng cáo đầu tiên',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
            [
                'name' => 'Slide 2',
                'image' => 'slide2.jpg',
                'link' => '#',
                'position' => 'slideshow',
                'sort_order' => 3,
                'description' => 'Banner slideshow thứ hai',
                'created_at' => now(),
                'created_by' => 1,
                'updated_at' => null,
                'updated_by' => null,
                'status' => 1,
            ],
        ]);
    }
}
