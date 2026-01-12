<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductImageController extends Controller
{
    /**
     * GET /api/product-images
     * Lấy danh sách ProductImage, filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = ProductImage::with('product');

        // Filter theo product_id
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Search theo alt hoặc title
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('alt', 'like', '%'.$search.'%')
                  ->orWhere('title', 'like', '%'.$search.'%');
            });
        }

        // Sort theo id
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
            'message' => 'Danh sách ProductImage',
            'data' => $data
        ]);
    }

    /**
     * GET /api/product-images/{id}
     * Chi tiết ProductImage
     */
    public function show($id)
    {
        $item = ProductImage::with('product')->find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductImage'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * POST /api/product-images
     * Tạo ProductImage
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:product,id',
            'image' => 'required|string|max:255',
            'alt' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $item = ProductImage::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo ProductImage thành công',
            'data' => $item
        ], 201);
    }

    /**
     * PUT /api/product-images/{id}
     * Cập nhật ProductImage
     */
    public function update(Request $request, $id)
    {
        $item = ProductImage::find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductImage'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|required|integer|exists:product,id',
            'image' => 'sometimes|required|string|max:255',
            'alt' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $item->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật ProductImage thành công',
            'data' => $item
        ]);
    }

    /**
     * DELETE /api/product-images/{id}
     * Xóa ProductImage
     */
    public function destroy($id)
    {
        $item = ProductImage::find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductImage'
            ], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa ProductImage thành công'
        ]);
    }
}
