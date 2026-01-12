<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    protected $table = 'user'; // giữ nếu DB dùng 'user'

    protected $fillable = [
        'name',
        'email',
        'phone',
        'username',
        'password',
        'roles',
        'avatar',
        'created_by',
        'updated_by',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public $timestamps = true; // KHUYẾN NGHỊ

    // ===== Password Mutator =====
    public function setPasswordAttribute($value)
    {
        if (!empty($value)) {
            $this->attributes['password'] = Hash::make($value);
        }
    }

    // ===== JWT =====
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'id' => $this->id,
            'roles' => $this->roles,
            'status' => $this->status,
        ];
    }
}
