<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    /**
     * GET /api/banners
     * Lấy danh sách banner, có filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = Banner::query();

        // Filter theo status (0=inactive, 1=active)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter theo position
        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        // Search theo name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort theo sort_order hoặc created_at
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = strtolower($request->get('sort_order', 'asc'));

        // Chỉ cho phép sort theo các cột hợp lệ
        $allowedSortBy = ['sort_order', 'created_at'];
        if (!in_array($sortBy, $allowedSortBy)) {
            $sortBy = 'sort_order';
        }

        // Chỉ cho phép asc | desc
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $query->orderBy($sortBy, $sortOrder);

        // Pagination hoặc limit
        if ($request->has('limit')) {
            $data = $query->limit((int)$request->limit)->get();
        } else {
            $perPage = $request->get('per_page', 10);
            $data = $query->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'message' => 'Danh sách banner',
            'data' => $data
        ]);
    }

    /**
     * GET /api/banners/{id}
     * Chi tiết banner
     */
    public function show($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy banner'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $banner
        ]);
    }

    /**
     * POST /api/banners
     * Tạo mới banner
     */
  public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        'link' => 'nullable|string|max:255',
        'position' => 'nullable|in:slideshow,ads',
        'sort_order' => 'nullable|integer',
        'description' => 'nullable|string|max:500',
        'status' => 'required|integer|in:0,1'
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
        'link',
        'position',
        'sort_order',
        'description',
        'status'
    ]);

    // Upload image
    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $filename = time().'_'.$file->getClientOriginalName();
        $file->move(public_path('uploads/banners'), $filename);
        $data['image'] = 'uploads/banners/'.$filename;
    }

    $banner = Banner::create($data);

    return response()->json([
        'success' => true,
        'message' => 'Tạo banner thành công',
        'data' => $banner
    ], 201);
}



    /**
     * PUT /api/banners/{id}
     * Cập nhật banner
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy banner'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'link' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:100',
            'sort_order' => 'sometimes|nullable|integer',
            'description' => 'sometimes|nullable|string|max:500',
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

        // Upload ảnh mới nếu có
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu có
            if ($banner->image && file_exists(public_path($banner->image))) {
                unlink(public_path($banner->image));
            }
            
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/banners'), $filename);
            $data['image'] = 'uploads/banners/' . $filename;
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật banner thành công',
            'data' => $banner
        ]);
    }

    /**
     * DELETE /api/banners/{id}
     * Xóa banner
     */
    public function destroy($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy banner'
            ], 404);
        }

        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa banner thành công'
        ]);
    }
}
