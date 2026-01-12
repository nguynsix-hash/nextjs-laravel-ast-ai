<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    protected $table = 'topic';
    public $timestamps = true;

    protected $fillable = [
        'name','slug','sort_order','description','created_at','created_by','updated_at','updated_by','status'
    ];

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
