<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TopicController extends Controller
{
    /**
     * Lấy danh sách Topic, filter, search, phân trang, sort
     * GET /api/topics
     */
    public function index(Request $request)
    {
        $query = Topic::query();

        // Filter theo status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search theo name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', '%'.$search.'%');
        }

        // Sort
        $sort_by = $request->get('sort_by', 'id');
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
            'message' => 'Lấy danh sách Topic thành công.',
            'data' => $data
        ]);
    }

    /**
     * Chi tiết Topic
     * GET /api/topics/{id}
     */
    public function show($id)
    {
        $item = Topic::with('posts')->find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy Topic'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * Tạo mới Topic
     * POST /api/topics
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:topic,slug',
            'sort_order' => 'nullable|integer',
            'description' => 'nullable|string|max:500',
            'status' => 'required|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Tạo slug nếu trống
        if (empty($data['slug']) && isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $item = Topic::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tạo Topic thành công.',
            'data' => $item
        ], 201);
    }

    /**
     * Cập nhật Topic
     * PUT/PATCH /api/topics/{id}
     */
    public function update(Request $request, $id)
    {
        $item = Topic::find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy Topic'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:topic,slug,' . $id,
            'sort_order' => 'nullable|integer',
            'description' => 'nullable|string|max:500',
            'status' => 'sometimes|required|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Tạo slug nếu trống
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        } elseif (isset($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        }

        $item->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật Topic thành công.',
            'data' => $item
        ]);
    }

    /**
     * Xóa Topic
     * DELETE /api/topics/{id}
     */
    public function destroy($id)
    {
        $item = Topic::find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy Topic'
            ], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa Topic thành công.'
        ]);
    }
}
