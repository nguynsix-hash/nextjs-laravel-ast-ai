<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\Storage;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * Lấy danh sách category, có filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Filter theo status (0=inactive, 1=active)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter theo parent_id
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Search theo name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort theo sort_order hoặc created_at
        $sort_by = $request->get('sort_by', 'sort_order');
        $sort_order = $request->get('sort_order', 'asc');
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
            'message' => 'Danh sách category',
            'data' => $data
        ]);
    }

    /**
     * GET /api/categories/{id}
     * Chi tiết category
     */
    public function show($id)
    {
        $category = Category::with('products')->find($id);
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy category'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * POST /api/categories
     * Tạo mới category
     */
    public function store(Request $request)
    {
        // 1. Tự động tạo slug từ name nếu slug trống ĐỂ VALIDATE CHÍNH XÁC
        if (!$request->has('slug') || empty($request->slug)) {
            $request->merge(['slug' => Str::slug($request->name)]);
        }

        // 2. Validate dữ liệu (Lưu ý: unique:hsn_category vì log của bạn báo tên bảng là hsn_category)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:category,slug', // Sửa lại tên bảng cho đúng
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'parent_id' => 'nullable|integer',
            'sort_order' => 'nullable|integer',
            'description' => 'nullable|string|max:500',
            'status' => 'required|integer|in:0,1'
        ], [
            'slug.unique' => 'Tên danh mục hoặc đường dẫn này đã tồn tại!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422); // Trả về lỗi 422 để Frontend bắt được thông báo
        }

        $data = $request->all();

        // 3. Xử lý Upload ảnh chuyên nghiệp hơn
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            // Lưu vào public/storage/categories
            $file->move(public_path('storage/categories'), $filename);
            $data['image'] = 'categories/' . $filename;
        }

        try {
            $category = Category::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Tạo category thành công',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi thực thi database: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * PUT /api/categories/{id}
     * Cập nhật category
     */
  public function update(Request $request, $id)
{
    $category = Category::find($id);
    if (!$category) {
        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy category'
        ], 404);
    }

    $validator = Validator::make($request->all(), [
        'name' => 'sometimes|required|string|max:255',
        'slug' => 'sometimes|nullable|string|max:255|unique:categories,slug,' . $id,
        'image' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        'remove_image' => 'sometimes|nullable|in:0,1',
        'parent_id' => 'sometimes|nullable|integer',
        'sort_order' => 'sometimes|nullable|integer',
        'description' => 'sometimes|nullable|string|max:500',
        'status' => 'sometimes|required|in:0,1'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ',
            'errors' => $validator->errors()
        ], 422);
    }

    $data = $request->only([
        'name',
        'slug',
        'parent_id',
        'sort_order',
        'description',
        'status'
    ]);

    // XÓA ẢNH
    if ($request->boolean('remove_image')) {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }
        $data['image'] = null;
    }

    // UPLOAD ẢNH MỚI
    if ($request->hasFile('image')) {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $path = $request->file('image')->store('categories', 'public');
        $data['image'] = $path;
    }

    // SLUG
    if (isset($data['name']) && empty($data['slug'])) {
        $data['slug'] = Str::slug($data['name']);
    } elseif (isset($data['slug'])) {
        $data['slug'] = Str::slug($data['slug']);
    }

    $category->update($data);

    return response()->json([
        'success' => true,
        'message' => 'Cập nhật category thành công',
        'data' => $category
    ]);
}


    /**
     * DELETE /api/categories/{id}
     * Xóa category
     */
    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy category'
            ], 404);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa category thành công'
        ]);
    }
}
