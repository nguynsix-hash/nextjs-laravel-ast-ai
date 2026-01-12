<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderDetailController extends Controller
{
    /**
     * GET /api/order-details
     * Lấy danh sách chi tiết đơn hàng, filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = OrderDetail::with(['order', 'product']);

        // Filter theo order_id
        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        // Filter theo product_id
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Search theo price, qty, amount
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('price', 'like', '%'.$search.'%')
                  ->orWhere('qty', 'like', '%'.$search.'%')
                  ->orWhere('amount', 'like', '%'.$search.'%');
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
            'message' => 'Danh sách chi tiết đơn hàng',
            'data' => $data
        ]);
    }

    /**
     * GET /api/order-details/{id}
     * Chi tiết chi tiết đơn hàng
     */
    public function show($id)
    {
        $detail = OrderDetail::with(['order', 'product'])->find($id);
        if (!$detail) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy chi tiết đơn hàng'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $detail
        ]);
    }

    /**
     * POST /api/order-details
     * Tạo chi tiết đơn hàng
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer|exists:order,id',
            'product_id' => 'required|integer|exists:product,id',
            'price' => 'required|numeric|min:0',
            'qty' => 'required|integer|min:1',
            'amount' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $detail = OrderDetail::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo chi tiết đơn hàng thành công',
            'data' => $detail
        ], 201);
    }

    /**
     * PUT /api/order-details/{id}
     * Cập nhật chi tiết đơn hàng
     */
    public function update(Request $request, $id)
    {
        $detail = OrderDetail::find($id);
        if (!$detail) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy chi tiết đơn hàng'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'order_id' => 'sometimes|required|integer|exists:order,id',
            'product_id' => 'sometimes|required|integer|exists:product,id',
            'price' => 'sometimes|required|numeric|min:0',
            'qty' => 'sometimes|required|integer|min:1',
            'amount' => 'sometimes|required|numeric|min:0',
            'discount' => 'sometimes|nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $detail->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật chi tiết đơn hàng thành công',
            'data' => $detail
        ]);
    }

    /**
     * DELETE /api/order-details/{id}
     * Xóa chi tiết đơn hàng
     */
    public function destroy($id)
    {
        $detail = OrderDetail::find($id);
        if (!$detail) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy chi tiết đơn hàng'
            ], 404);
        }

        $detail->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa chi tiết đơn hàng thành công'
        ]);
    }
}
