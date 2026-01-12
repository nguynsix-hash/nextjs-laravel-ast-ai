<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Config extends Model
{
    protected $table = 'config';
    public $timestamps = false;

    protected $fillable = [
        'site_name','email','phone','hotline','address','status'
    ];
}
