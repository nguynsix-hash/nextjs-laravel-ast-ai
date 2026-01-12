<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // ===== REGISTER =====
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:user,email',
            'username' => 'required|string|unique:user,username',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|unique:user,phone',
            'avatar'   => 'nullable|string'
        ]);



        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'username' => $request->username,
            'password' => $request->password,
            'roles'    => 'customer',
            'status'   => 1
        ]);


        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thành công',
            'token'   => $token,
            'user'    => $user->only([
                'id',
                'name',
                'email',
                'username',
                'roles',
                'status'
            ])
        ], 201);
    }
    //////////// ADMIN LOGIN ///////
    public function adminLogin(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Sai tài khoản'], 401);
        }

        $user = JWTAuth::user();

        if ($user->roles !== 'admin') {
            return response()->json(['message' => 'Không phải admin'], 403);
        }

        if ($user->status != 1) {
            return response()->json(['message' => 'Tài khoản bị khóa'], 403);
        }

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    // ===== LOGIN =====
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng'
            ], 401);
        }

        $user = JWTAuth::user();

        // 🚫 Chặn user bị khóa
        if ($user->status == 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => $user->only([
                'id',
                'name',
                'email',
                'username',
                'roles',
                'status'
            ])
        ]);
    }

    // ===== LOGOUT =====
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json([
                'success' => true,
                'message' => 'Đăng xuất thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ'
            ], 401);
        }
    }


    // ===== ME =====
    public function me()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            return response()->json([
                'success' => true,
                'user' => $user->only([
                    'id',
                    'name',
                    'email',
                    'username',
                    'roles',
                    'status',
                    'avatar',
                    'phone'
                ])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    }

    // ===== REFRESH =====
    public function refresh()
    {
        try {
            return response()->json([
                'success' => true,
                'token' => JWTAuth::refresh(JWTAuth::getToken())
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ'
            ], 401);
        }
    }
}
