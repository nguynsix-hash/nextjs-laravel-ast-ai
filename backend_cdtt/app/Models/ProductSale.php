<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSale extends Model
{
    protected $table = 'product_sale';
    public $timestamps = false;

    protected $fillable = [
        'name','product_id','price_sale','date_begin','date_end','created_at','created_by','updated_at','updated_by','status'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
