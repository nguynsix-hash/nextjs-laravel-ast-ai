<?php

namespace App\Http\Controllers\API;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\OrderDetail;

class OrderController extends Controller
{
    /**
     * GET /api/orders
     * Lấy danh sách đơn hàng, filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = Order::with('details');

        // Filter theo status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter theo user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search theo name, email, phone, address, note
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('address', 'like', '%' . $search . '%')
                    ->orWhere('note', 'like', '%' . $search . '%');
            });
        }

        // Sort theo created_at hoặc id
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
            'message' => 'Danh sách đơn hàng',
            'data' => $data
        ]);
    }

    /**
     * GET /api/orders/{id}
     * Chi tiết đơn hàng
     */
    public function show($id)
    {
        // Tải chi tiết đơn hàng và thông tin sản phẩm (rất quan trọng cho Frontend)
        $order = Order::with('details.product')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * POST /api/orders
     * Tạo đơn hàng
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|integer',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'note' => 'nullable|string',
            'status' => 'required|integer|in:1,2,3,4',

            // 🔹 validate details
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|integer|exists:product,id',
            'details.*.price' => 'required|numeric|min:0',
            'details.*.qty' => 'required|integer|min:1',
            'details.*.discount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // 1️⃣ Tạo order
            $order = Order::create([
                'user_id' => $request->user_id,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'note' => $request->note,
                'status' => $request->status,
                'created_at' => now(),
                'created_by' => 1
            ]);

            // 2️⃣ Tạo order_detail
            foreach ($request->details as $item) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'qty' => $item['qty'],
                    'discount' => $item['discount'] ?? 0,
                    'amount' => ($item['price'] * $item['qty']) - ($item['discount'] ?? 0),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'data' => $order->load('details')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Tạo đơn hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/orders/{id}
     * Cập nhật đơn hàng
     */
    public function update(Request $request, $id)
{
    $order = Order::find($id);
    if (!$order) {
        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy đơn hàng'
        ], 404);
    }

    $validator = Validator::make($request->all(), [
        'user_id' => 'sometimes|nullable|integer',
        'name' => 'sometimes|required|string|max:255',
        'email' => 'sometimes|nullable|email|max:255',
        'phone' => 'sometimes|required|string|max:50',
        'address' => 'sometimes|required|string|max:255',
        'note' => 'sometimes|nullable|string',
        // ĐÃ SỬA: Thay đổi quy tắc 'in:0,1' thành 'in:1,2,3,4' để khớp với frontend của bạn
        'status' => 'sometimes|required|integer|in:1,2,3,4' 
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ',
            'errors' => $validator->errors()
        ], 422);
    }

    $order->update($request->all());

    return response()->json([
        'success' => true,
        'message' => 'Cập nhật đơn hàng thành công',
        'data' => $order
    ]);
}

    /**
     * DELETE /api/orders/{id}
     * Xóa đơn hàng
     */
    public function destroy($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa đơn hàng thành công'
        ]);
    }
}
