<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'menu';
    public $timestamps = true;

    protected $fillable = [
        'name','link','type','parent_id','sort_order','table_id','position','created_at','created_by','updated_at','updated_by','status'
    ];
}
