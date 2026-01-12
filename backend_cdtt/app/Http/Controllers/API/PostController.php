<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * GET /api/posts
     * Lấy danh sách bài viết, filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = Post::with('topic');

        // Filter theo topic_id
        if ($request->has('topic_id')) {
            $query->where('topic_id', $request->topic_id);
        }

        // Filter theo status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter theo post_type
        if ($request->has('post_type')) {
            $query->where('post_type', $request->post_type);
        }

        // Search theo title, description, content
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%')
                  ->orWhere('description', 'like', '%'.$search.'%')
                  ->orWhere('content', 'like', '%'.$search.'%');
            });
        }

        // Sort theo created_at
        $sort_by = $request->get('sort_by', 'created_at');
        $sort_order = $request->get('sort_order', 'desc');
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
            'message' => 'Danh sách bài viết',
            'data' => $data
        ]);
    }

    /**
     * GET /api/posts/{id}
     * Chi tiết bài viết
     */
    public function show($id)
    {
        $post = Post::with('topic')->find($id);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * POST /api/posts
     * Tạo bài viết
     */
   public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'topic_id' => 'required|integer|exists:topic,id',
        'title' => 'required|string|max:255',
        'slug' => 'nullable|string|max:255|unique:post,slug',
        'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        'content' => 'nullable|string',
        'description' => 'nullable|string|max:500',
        'post_type' => 'required|integer|in:0,1',
        'status' => 'required|integer|in:0,1'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ',
            'errors' => $validator->errors()
        ], 422);
    }

    // Lấy dữ liệu trừ image
    $data = $request->except('image');

    // Tự tạo slug nếu không gửi
    if (empty($data['slug']) && isset($data['title'])) {
        $data['slug'] = Str::slug($data['title']);
    }

    // Upload ảnh
    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/posts'), $filename);
        $data['image'] = 'uploads/posts/' . $filename;
    }

    $post = Post::create($data);

    return response()->json([
        'success' => true,
        'message' => 'Tạo bài viết thành công',
        'data' => $post
    ], 201);
}

    /**
     * PUT /api/posts/{id}
     * Cập nhật bài viết
     */
    public function update(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'topic_id' => 'sometimes|required|integer|exists:topic,id',
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:post,slug,'.$post->id,
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'content' => 'nullable|string',
            'description' => 'nullable|string|max:500',
            'post_type' => 'sometimes|required|integer|in:0,1',
            'status' => 'sometimes|required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Lấy dữ liệu trừ image
        $data = $request->except('image');
        
        // Tự tạo slug nếu không gửi
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Upload ảnh mới nếu có
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu có
            if ($post->image && file_exists(public_path($post->image))) {
                unlink(public_path($post->image));
            }
            
            $file = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/posts'), $filename);
            $data['image'] = 'uploads/posts/' . $filename;
        }

        $post->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật bài viết thành công',
            'data' => $post
        ]);
    }

    /**
     * DELETE /api/posts/{id}
     * Xóa bài viết
     */
    public function destroy($id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết'
            ], 404);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa bài viết thành công'
        ]);
    }
}
