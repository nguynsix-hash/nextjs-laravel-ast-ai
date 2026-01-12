<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product', function (Blueprint $table) {
            $table->id(); // unsignedBigInteger + AUTO_INCREMENT
            $table->unsignedTinyInteger('status')->default(1);

            $table->unsignedInteger('category_id'); // Not Null

            $table->string('name');   // Not Null
            $table->string('slug');   // Not Null
            $table->string('thumbnail')->nullable(); // Not Null

            $table->longText('content')->nullable(); // Not Null
            $table->tinyText('description')->nullable(); // Null

            $table->decimal('price_buy', 12, 2); // Not Null

            $table->dateTime('created_at');
            $table->unsignedInteger('created_by')->default(1);

            $table->dateTime('updated_at')->nullable();
            $table->unsignedInteger('updated_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product');
    }
};
