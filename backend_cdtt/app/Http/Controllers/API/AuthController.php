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
    // ===== CHANGE PASSWORD =====
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'old_password' => 'required',
            'password' => 'required|min:6|confirmed', // password_confirmation
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = JWTAuth::user();

        if (!\Illuminate\Support\Facades\Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu cũ không chính xác'
            ], 400);
        }

        // Tự động hash qua User model mutator hoặc thủ công nếu cần
        // Ở model User đã có mutator setPasswordAttribute
        $user->update([
            'password' => $request->password
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }

    // ===== UPDATE PROFILE =====
    public function updateProfile(Request $request) 
    {
        $user = JWTAuth::user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'nullable|string',
            'avatar' => 'nullable|file|mimes:jpg,jpeg,png,gif|max:2048' // Validate file ảnh
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['name', 'phone', 'address']);

        // Xử lý upload Avatar
        if ($request->hasFile('avatar')) {
             $file = $request->file('avatar');
             $ext = $file->extension();
             $filename = time() . '-' . 'avatar' . '.' . $ext;
             
             // Move file vào public/images/avatar
             $file->move(public_path('images/avatar'), $filename);
             
             // Lưu đường dẫn đầy đủ hoặc tương đối
             // Ở đây lưu absolute URL hoặc path tương đối tuỳ logic hiển thị frontend. 
             // Frontend đang dùng `user.avatar` trực tiếp vào src.
             $data['avatar'] = asset('images/avatar/' . $filename);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công',
            'data' => $user
        ]);
    }
}
