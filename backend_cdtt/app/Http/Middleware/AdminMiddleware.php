<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // 🔐 Xác thực token
         $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chưa đăng nhập'
                ], 401);
            }

            // 🚫 Tài khoản bị khóa
            if ($user->status != 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản đã bị khóa'
                ], 403);
            }

            // 🚫 Không phải admin
            if ($user->roles !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có quyền truy cập'
                ], 403);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ'
            ], 401);
        }

        return $next($request);
    }
}
