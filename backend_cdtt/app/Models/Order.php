<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'order';
    public $timestamps = false;

    protected $fillable = [
        'user_id','name','email','phone','address','note','created_at','created_by','updated_at','updated_by','status'
    ];

    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // Giả định khóa ngoại là user_id
    }
}
