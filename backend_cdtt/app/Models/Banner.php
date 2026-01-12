<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $table = 'banner';
    public $timestamps = true;

    protected $fillable = [
        'name', 'image', 'link', 'position', 'sort_order', 'description', 'created_at', 'created_by', 'updated_at', 'updated_by', 'status'
    ];
}
