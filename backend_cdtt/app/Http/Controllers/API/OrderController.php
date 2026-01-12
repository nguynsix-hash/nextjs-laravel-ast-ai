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
        $query = Order::with('details.product');


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

        // Thêm tính toán Total cho mỗi đơn hàng
        if ($data instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $data->getCollection()->transform(function ($order) {
                $order->total = $order->details->sum('amount');
                return $order;
            });
        } else {
            $data->transform(function ($order) {
                $order->total = $order->details->sum('amount');
                return $order;
            });
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

        $order->total = $order->details->sum('amount');

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
                // 'created_by' => 1 // Tạm thời bỏ qua nếu chưa có Auth user thực tế để tránh lỗi foreign key k tồn tại
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

            // Load lại relation để gửi mail
            $order->load('details.product');

            // 3️⃣ Commit DB trước để chắc chắn đơn hàng được lưu
            DB::commit();

            // 4️⃣ Gửi Email (Thực hiện sau khi commit thành công)
            if ($request->email) {
                try {
                     \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\OrderConfirmMail($order));
                } catch (\Throwable $mailException) { // Catch Throwable để bắt cả Error và Exception
                    // Log lỗi mail nhưng không chặn response về client
                    \Illuminate\Support\Facades\Log::error("Mail send failed: " . $mailException->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'data' => $order
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Order create failed: " . $e->getMessage()); // Log chi tiết ra file log của Laravel

            return response()->json([
                'success' => false,
                'message' => 'Tạo đơn hàng thất bại: ' . $e->getMessage(), // Trả về lỗi chi tiết để debug
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
     * POST /api/cancel-order/{id}
     * Hủy đơn hàng (chỉ khi status = 1 (pending))
     */
    public function cancelOrder(Request $request, $id)
    {
        // Lấy user hiện tại từ token (nếu dùng middleware auth:api)
        // Tuy nhiên ở đây controller có thể được dùng chung. 
        // Nhưng route cancel-order được bảo vệ bởi middleware auth:api.
        
        $user = \Tymon\JWTAuth\Facades\JWTAuth::user();
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        // Check quyền sở hữu
        if ($order->user_id != $user->id && $user->roles !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền hủy đơn hàng này'
            ], 403);
        }

        // Chỉ hủy được khi status = 1 (Chờ xử lý)
        if ($order->status != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng không thể hủy ở trạng thái này'
            ], 400);
        }

        $order->status = 4; // 4 = Đã hủy (Giả định enum status: 1=Pending, 2=Confirmed, 3=Shipping, 4=Cancelled)
        // Hoặc Status = 0 tuỳ quy ước. Ở đây giả định 4.
        // Check OrderController store method: status in:1,2,3,4. OK.
        
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Hủy đơn hàng thành công',
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
