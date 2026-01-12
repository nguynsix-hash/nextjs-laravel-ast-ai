<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductAttributeController extends Controller
{
    /**
     * GET /api/product-attributes
     * Lấy danh sách ProductAttribute, filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = ProductAttribute::with(['product', 'attribute']);

        // Filter theo product_id
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter theo attribute_id
        if ($request->has('attribute_id')) {
            $query->where('attribute_id', $request->attribute_id);
        }

        // Search theo value
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('value', 'like', '%'.$search.'%');
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
            'message' => 'Danh sách ProductAttribute',
            'data' => $data
        ]);
    }

    /**
     * GET /api/product-attributes/{id}
     * Chi tiết ProductAttribute
     */
    public function show($id)
    {
        $item = ProductAttribute::with(['product', 'attribute'])->find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductAttribute'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * POST /api/product-attributes
     * Tạo ProductAttribute
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:product,id',
            'attribute_id' => 'required|integer|exists:attribute,id',
            'value' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $item = ProductAttribute::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo ProductAttribute thành công',
            'data' => $item
        ], 201);
    }
    public function storeMultiple(Request $request)
{
    $validator = Validator::make($request->all(), [
        'product_id' => 'required|integer|exists:product,id',
        'attributes' => 'required|array|min:1',

        'attributes.*.attribute_id' => 'required|integer|exists:attribute,id',
        'attributes.*.value' => 'required|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ',
            'errors' => $validator->errors()
        ], 422);
    }

    $product_id = $request->product_id;
    $items = [];

    foreach ($request->attributes as $attr) {
        $items[] = ProductAttribute::create([
            'product_id' => $product_id,
            'attribute_id' => $attr['attribute_id'],
            'value' => $attr['value'],
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => 'Tạo nhiều ProductAttribute thành công',
        'data' => $items
    ], 201);
}

    /**
     * PUT /api/product-attributes/{id}
     * Cập nhật ProductAttribute
     */
    public function update(Request $request, $id)
    {
        $item = ProductAttribute::find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductAttribute'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|required|integer|exists:product,id',
            'attribute_id' => 'sometimes|required|integer|exists:attribute,id',
            'value' => 'sometimes|required|string|max:255',
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
            'message' => 'Cập nhật ProductAttribute thành công',
            'data' => $item
        ]);
    }

    /**
     * DELETE /api/product-attributes/{id}
     * Xóa ProductAttribute
     */
    public function destroy($id)
    {
        $item = ProductAttribute::find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductAttribute'
            ], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa ProductAttribute thành công'
        ]);
    }
}
