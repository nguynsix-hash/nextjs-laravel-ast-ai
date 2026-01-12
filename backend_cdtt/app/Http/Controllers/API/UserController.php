<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Lấy danh sách User
     * Hỗ trợ: phân trang, search, filter, sort
     * GET /api/users
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filter theo status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search theo name, email, username
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                  ->orWhere('email', 'like', '%'.$search.'%')
                  ->orWhere('username', 'like', '%'.$search.'%');
            });
        }

        // Sort
        $sort_by = $request->get('sort_by', 'id');        // default: id
        $sort_order = $request->get('sort_order', 'desc'); // default: desc
        $query->orderBy($sort_by, $sort_order);

        // Pagination hoặc limit
        if ($request->has('limit')) {
            $data = $query->limit((int)$request->limit)->get();
        } else {
            $perPage = $request->get('per_page', 10);
            $data = $query->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách User thành công.',
            'data' => $data
        ]);
    }

    /**
     * Chi tiết User
     * GET /api/users/{id}
     */
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy User'], 404);
        }
        return response()->json(['success' => true, 'data' => $user]);
    }

    /**
     * Tạo mới User
     * POST /api/users
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:user,email',
            'username' => 'required|string|unique:user,username',
            'password' => 'required|string|min:6',
            'roles' => 'nullable|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success'=>false,'errors'=>$validator->errors()],422);
        }

        $user = User::create($request->all());

        return response()->json(['success'=>true,'message'=>'Tạo User thành công','data'=>$user],201);
    }

    /**
     * Cập nhật User
     * PUT/PATCH /api/users/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success'=>false,'message'=>'Không tìm thấy User'],404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:user,email,'.$id,
            'username' => 'sometimes|required|string|unique:user,username,'.$id,
            'password' => 'nullable|string|min:6',
            'roles' => 'nullable|string',
            'status' => 'sometimes|required|in:0,1',
            'avatar' => 'nullable|file|mimes:jpg,jpeg,png,gif|max:2048' // Add avatar validation
        ]);

        if ($validator->fails()) {
            return response()->json(['success'=>false,'errors'=>$validator->errors()],422);
        }

        $data = $request->except(['avatar']); // Exclude avatar from direct assignment first

        // Handle Avatar Upload
        if ($request->hasFile('avatar')) {
             $file = $request->file('avatar');
             $ext = $file->extension();
             $filename = time() . '-' . 'avatar-' . $id . '.' . $ext;
             $file->move(public_path('images/avatar'), $filename);
             $data['avatar'] = asset('images/avatar/' . $filename);
        }

        if(isset($data['password']) && $data['password']) {
            // Password mutator handles hashing
        } else {
             unset($data['password']); // Don't update password if empty/null
        }

        $user->update($data);

        return response()->json(['success'=>true,'message'=>'Cập nhật User thành công','data'=>$user]);
    }

    /**
     * Xóa User
     * DELETE /api/users/{id}
     */
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success'=>false,'message'=>'Không tìm thấy User'],404);
        }

        $user->delete();

        return response()->json(['success'=>true,'message'=>'Xóa User thành công']);
    }
}
