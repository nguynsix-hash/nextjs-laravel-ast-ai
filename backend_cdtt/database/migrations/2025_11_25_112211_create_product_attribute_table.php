<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // Sửa đổi trong Migration product_attribute (Chạy lại migration nếu DB chưa có dữ liệu quan trọng)

public function up(): void
{ 
    Schema::create('product_attribute', function (Blueprint $table) {
        $table->id(); 

        // SỬA TẠI ĐÂY: Sử dụng foreignId (chuẩn Laravel cho BIGINT) 
        // hoặc unsignedBigInteger để khớp với $table->id() của bảng gốc.
        $table->foreignId('product_id')->constrained('product')->cascadeOnDelete();
        $table->foreignId('attribute_id')->constrained('attribute')->cascadeOnDelete();
        
        // HOẶC:
        /*
        $table->unsignedBigInteger('product_id'); 
        $table->unsignedBigInteger('attribute_id'); 
        $table->foreign('product_id')->references('id')->on('product')->cascadeOnDelete();
        $table->foreign('attribute_id')->references('id')->on('attribute')->cascadeOnDelete();
        */

        $table->string('value'); 
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attribute');
    }
};
