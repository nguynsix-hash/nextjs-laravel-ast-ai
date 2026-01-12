<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductStore extends Model
{
    protected $table = 'product_store';
    public $timestamps = false;

    protected $fillable = [
        'product_id','price_root','qty','created_at','created_by','updated_at','updated_by','status'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
