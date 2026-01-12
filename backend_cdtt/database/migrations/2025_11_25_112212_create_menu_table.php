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
        Schema::create('menu', function (Blueprint $table) {
            $table->id(); // unsignedBigInteger + AUTO_INCREMENT

            $table->string('name'); // Not Null
            $table->string('link'); // Not Null

            $table->enum('type', ['category', 'page', 'topic', 'custom']); // Not Null

            $table->unsignedInteger('parent_id')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->unsignedInteger('table_id')->nullable();

            $table->enum('position', ['mainmenu', 'footermenu']); // Not Null

            $table->dateTime('created_at'); 
            $table->unsignedInteger('created_by')->default(1);

            $table->dateTime('updated_at')->nullable();
            $table->unsignedInteger('updated_by')->nullable();

            $table->unsignedTinyInteger('status')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu');
    }
};
