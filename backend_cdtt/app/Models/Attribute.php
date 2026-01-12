<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $table = 'attribute'; // Tên bảng
    public $timestamps = false; // Nếu bạn tự quản lý created_at/updated_at

    // Các trường có thể gán hàng loạt
    protected $fillable = [
        'name',
    ];

    // Quan hệ với ProductAttribute
    public function productAttributes()
    {
        return $this->hasMany(ProductAttribute::class, 'attribute_id', 'id');
    }

    // Quan hệ nhiều-nhiều với Product qua bảng product_attribute
    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'product_attribute',
            'attribute_id',
            'product_id'
        );
    }
}
