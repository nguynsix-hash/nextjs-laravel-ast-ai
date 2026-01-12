<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'category';
    public $timestamps = true; // bật timestamps để tự động cập nhật created_at & updated_at

    protected $fillable = [
        'name','slug','image','parent_id','sort_order','description','created_by','updated_by','status'
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}

