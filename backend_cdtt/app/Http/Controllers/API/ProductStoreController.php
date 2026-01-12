<?php

namespace App\Http\Controllers\API;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\ProductStore;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductStoreController extends Controller
{
    /**
     * GET /api/product-stores
     */
    public function index(Request $request)
    {
        $query = ProductStore::with([
            'product',
            'product.images',
            'product.category'
        ]);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('price_min')) {
            $query->where('price_root', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price_root', '<=', $request->price_max);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $sort_by = $request->get('sort_by', 'id');
        $sort_order = $request->get('sort_order', 'desc');
        $query->orderBy($sort_by, $sort_order);

        if ($request->filled('limit')) {
            $data = $query->limit((int) $request->limit)->get();

            return response()->json([
                'success' => true,
                'message' => 'Danh sách ProductStore (limit)',
                'data' => $data
            ]);
        }

        $perPage = $request->get('per_page', 10);
        $data = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Danh sách ProductStore',
            'data' => $data
        ]);
    }

    /**
     * GET /api/product-stores/{id}
     */
    public function show($id)
    {
        $item = ProductStore::with([
            'product',
            'product.images',
            'product.category',
        ])->find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductStore'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * POST /api/product-stores
     */
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'product_id' => 'required|integer|exists:product,id',
        'price_root' => 'required|numeric|min:0',
        'qty'        => 'required|integer|min:1',
        'status'     => 'required|integer|in:0,1',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ',
            'errors'  => $validator->errors()
        ], 422);
    }

    // 🔥 TÌM SẢN PHẨM ĐÃ CÓ TRONG KHO CHƯA
    $store = ProductStore::where('product_id', $request->product_id)->first();

    if ($store) {
        // ✅ ĐÃ CÓ → CỘNG DỒN
        $store->qty += $request->qty;

        // 👉 Quy tắc giá nhập (chọn 1)
        // Cách 1: Lấy giá nhập mới nhất
        $store->price_root = $request->price_root;

        // (Nếu muốn giá vốn trung bình, mình sẽ gửi công thức riêng)

        $store->status = $request->status;
        $store->updated_at = now();
        $store->updated_by = auth()->id() ?? 1;
        $store->save();
    } else {
        // ✅ CHƯA CÓ → TẠO MỚI
        $store = ProductStore::create([
            'product_id' => $request->product_id,
            'price_root' => $request->price_root,
            'qty'        => $request->qty,
            'status'     => $request->status,
            'created_at' => now(),
            'created_by' => auth()->id() ?? 1,
        ]);
    }

    $store->load(['product', 'product.images', 'product.category']);

    return response()->json([
        'success' => true,
        'message' => 'Nhập kho thành công',
        'data'    => $store
    ], 201);
}


    /**
     * PUT /api/product-stores/{id}
     */
    public function update(Request $request, $id)
    {
        $item = ProductStore::find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductStore'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|integer|exists:product,id',
            'price_root' => 'sometimes|numeric|min:0',
            'qty'        => 'sometimes|integer|min:0',
            'status'     => 'sometimes|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $item->update($request->all());
        $item->load(['product', 'product.images']);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật ProductStore thành công',
            'data' => $item
        ]);
    }

    /**
     * DELETE /api/product-stores/{id}
     */
    public function destroy($id)
    {
        $item = ProductStore::find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductStore'
            ], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa ProductStore thành công'
        ]);
    }
}
