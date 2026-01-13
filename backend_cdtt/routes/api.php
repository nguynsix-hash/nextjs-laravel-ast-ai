<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductImageController;
use App\Http\Controllers\Api\ProductSaleController;
use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\ProductAttributeController;
use App\Http\Controllers\Api\ProductStoreController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderDetailController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\ChatController;



// ---------------------------
// PUBLIC API ROUTES
// ---------------------------
Route::get('client/products', [ProductController::class, 'clientIndex']);
Route::apiResource('banners', BannerController::class);
Route::apiResource('contacts', ContactController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('product-images', ProductImageController::class);
Route::post('product-sales/import', [ProductSaleController::class, 'import']);
Route::apiResource('product-sales', ProductSaleController::class);
Route::apiResource('attributes', AttributeController::class);
Route::apiResource('product-attributes', ProductAttributeController::class);
Route::apiResource('product-stores', ProductStoreController::class);
Route::apiResource('orders', OrderController::class);
Route::apiResource('order-details', OrderDetailController::class);
Route::apiResource('posts', PostController::class);
Route::apiResource('topics', TopicController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('menus', MenuController::class);
Route::apiResource('configs', ConfigController::class);
// Upload ảnh sản phẩm
Route::post('products/{product}/upload', [ProductController::class, 'uploadImages']);
Route::delete('product-images/{id}', [ProductImageController::class, 'destroy']);
Route::post('/product-attributes/multiple', [ProductAttributeController::class, 'storeMultiple']);

// Chat AI (Gemini)
Route::post('/chat', [ChatController::class, 'chat']);

///////////
// --- NHÓM ROUTE CHO CLIENT (Người dùng cuối) ---
Route::prefix('client')->group(function () {
    // Lấy danh sách sản phẩm theo logic: còn hàng & đang khuyến mãi
    Route::get('/products', [ProductController::class, 'productClient']);

    // Chi tiết sản phẩm
    Route::get('/products/{id}', [ProductController::class, 'show']);
    
    // Sản phẩm liên quan
    Route::get('/products/{id}/related', [ProductController::class, 'getRelated']);

    // Các route khác như danh mục, banner...
    Route::get('/categories', [CategoryController::class, 'index']);
});
///////////////jwt
// 1. Nhóm Auth (Giữ nguyên)
Route::prefix('auth')->group(function () {
    Route::post('admin/login', [AuthController::class, 'adminLogin']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::post('update-profile', [AuthController::class, 'updateProfile']);
        // Route hủy đơn hàng cho user (cần check quyền sở hữu)
        Route::post('cancel-order/{id}', [OrderController::class, 'cancelOrder']); 
    });
});

// 2. Route cho User thường (Nếu cần)
// Route::middleware('auth:api')->get('profile', [UserController::class, 'profile']);

// 3. Nhóm Admin (Nơi quản lý Users)
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    // URL sẽ là: http://localhost:8000/api/admin/users
    Route::apiResource('users', UserController::class);
    Route::apiResource('products', ProductController::class);
});
