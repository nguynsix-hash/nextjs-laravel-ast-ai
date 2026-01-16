<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use Illuminate\Http\Request;

class InventoryLogController extends Controller
{
    /**
     * GET /api/inventory-logs
     */
    public function index(Request $request)
    {
        // Eager load product info
        $query = InventoryLog::with(['product' => function ($q) {
            $q->select('id', 'name', 'thumbnail');
        }]);

        // Filter by Product
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Sort (Default newest first)
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 10);
        $data = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy lịch sử nhập kho thành công',
            'data' => $data
        ]);
    }
}
