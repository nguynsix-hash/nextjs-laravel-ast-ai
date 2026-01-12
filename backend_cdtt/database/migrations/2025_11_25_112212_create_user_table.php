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
        Schema::create('user', function (Blueprint $table) {
            $table->id(); // unsignedBigInteger + AUTO_INCREMENT

            $table->string('name');     // Not Null
            $table->string('email');    // Not Null
            $table->string('phone');    // Not Null
            $table->string('username'); // Not Null
            $table->string('password'); // Not Null

            $table->enum('roles', ['admin', 'customer'])->default('customer');

            $table->string('avatar')->nullable();

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
        Schema::dropIfExists('user');
    }
};
