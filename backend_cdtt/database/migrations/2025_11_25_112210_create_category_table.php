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
      Schema::create('category', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('image')->nullable();
    $table->unsignedInteger('parent_id')->default(0);
    $table->unsignedInteger('sort_order')->default(0);
    $table->text('description')->nullable();
    $table->timestamps(); // created_at & updated_at tự động
    $table->unsignedInteger('created_by')->default(1);
    $table->unsignedInteger('updated_by')->nullable();
    $table->unsignedTinyInteger('status')->default(1);
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category');
    }
};
