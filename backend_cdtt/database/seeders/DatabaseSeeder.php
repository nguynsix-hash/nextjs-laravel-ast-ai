<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    $this->call([
        BannerSeeder::class,
        ContactSeeder::class,
        CategorySeeder::class,
        ProductSeeder::class,
        ProductImageSeeder::class,
        ProductSaleSeeder::class,
        AttributeSeeder::class,
        ProductAttributeSeeder::class,
        ProductStoreSeeder::class,
        OrderSeeder::class,
        OrderDetailSeeder::class,
        PostSeeder::class,
        TopicSeeder::class,
        UserSeeder::class,
        MenuSeeder::class,
        ConfigSeeder::class,
    ]);
}
}
