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
        Schema::create('product_sale', function (Blueprint $table) {
            $table->id(); // unsignedBigInteger + AUTO_INCREMENT

            $table->string('name'); // Not Null
            $table->unsignedInteger('product_id'); // Not Null

            $table->decimal('price_sale', 12, 2); // Not Null

            $table->dateTime('date_begin'); // Not Null
            $table->dateTime('date_end');   // Not Null

            $table->dateTime('created_at')->useCurrent(); 
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
        Schema::dropIfExists('product_sale');
    }
};
