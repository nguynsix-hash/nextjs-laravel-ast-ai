<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'product';
    public $timestamps = false;

    protected $fillable = [
        'category_id','name','slug','thumbnail','content','description','price_buy','created_at','created_by','updated_at','updated_by','status'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function sales()
    {
        return $this->hasMany(ProductSale::class);
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class, 'product_id', 'id');
    }

    public function store()
    {
        return $this->hasOne(ProductStore::class);
    }
}
