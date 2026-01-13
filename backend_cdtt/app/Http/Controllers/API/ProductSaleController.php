<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductSale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductSaleController extends Controller
{
    /**
     * GET /api/product-sales
     * Lấy danh sách ProductSale, filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = ProductSale::with('product');

        // Filter theo product_id
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter theo status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        // Filter sale đang hiệu lực (mặc định)
if (!$request->has('include_expired')) {
    $now = now();
    $query->where('date_begin', '<=', $now)
          ->where('date_end', '>=', $now);
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
            'message' => 'Danh sách ProductSale',
            'data' => $data
        ]);
    }

    /**
     * GET /api/product-sales/{id}
     * Chi tiết ProductSale
     */
    public function show($id)
    {
        $item = ProductSale::with('product')->find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductSale'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * POST /api/product-sales
     * Tạo ProductSale
     */
    /**
     * POST /api/product-sales
     * Tạo Chương trình Khuyến mãi (Hỗ trợ nhiều sản phẩm)
     */
    public function store(Request $request)
    {
        // 1. Validation cho thông tin chương trình (tên, ngày, trạng thái)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'date_begin' => 'required|date',
            'date_end' => 'required|date|after_or_equal:date_begin',
            'status' => 'required|integer|in:0,1',
            
            // 2. Validation cho MẢNG sản phẩm khuyến mãi
            'product_sales' => 'required|array|min:1', // Phải là mảng và không rỗng
            
            // 3. Validation cho TỪNG phần tử trong mảng product_sales
            'product_sales.*.product_id' => 'required|integer|exists:product,id', // Sửa 'product' thành 'products' nếu tên bảng là 'products'
            'product_sales.*.price_sale' => 'required|numeric|min:0',
            
            // (Tuỳ chọn: Nếu bạn muốn lưu sale_type và sale_value)
            'product_sales.*.sale_type' => 'nullable|string|in:percent,price',
            'product_sales.*.sale_value' => 'nullable|numeric|min:0',
            
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // --- Bắt đầu Transaction để đảm bảo tính toàn vẹn ---
        try {
            // Lấy thông tin chung của chương trình
            $commonData = $request->only(['name', 'date_begin', 'date_end', 'status']);
            $sales = $request->input('product_sales');
            $createdItems = [];

            // 4. Lặp qua mảng và tạo nhiều bản ghi
            foreach ($sales as $saleItem) {
                // Kết hợp dữ liệu chung (name, date, status) với dữ liệu sản phẩm (product_id, price_sale,...)
                $dataToCreate = array_merge($commonData, $saleItem);
                
                // Giả định bảng ProductSale có các trường: name, product_id, price_sale, date_begin, date_end, status
                $item = ProductSale::create($dataToCreate);
                $createdItems[] = $item;
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo chương trình khuyến mãi thành công cho ' . count($createdItems) . ' sản phẩm',
                'data' => $createdItems // Trả về danh sách các bản ghi đã tạo
            ], 201);

        } catch (\Exception $e) {
            // Xử lý lỗi nếu có
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server khi tạo khuyến mãi: ' . $e->getMessage(),
                'errors' => 'Database operation failed.'
            ], 500);
        }
    }
    public function update(Request $request, $id)
{
    $item = ProductSale::find($id);

    if (!$item) {
        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy ProductSale'
        ], 404);
    }

    // ❌ KHÔNG cho sửa product_id
    $validator = Validator::make($request->all(), [
        'name'        => 'required|string|max:255',
        'price_sale' => 'required|numeric|min:0',
        'date_begin' => 'required|date',
        'date_end'   => 'required|date|after_or_equal:date_begin',
        'status'     => 'required|integer|in:0,1',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ',
            'errors'  => $validator->errors()
        ], 422);
    }

    $item->update([
        'name'        => $request->name,
        'price_sale' => $request->price_sale,
        'date_begin' => $request->date_begin,
        'date_end'   => $request->date_end,
        'status'     => $request->status,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Cập nhật ProductSale thành công',
        'data'    => $item
    ]);
}

    /**
     * POST /api/product-sales/import
     * Import Excel -> Preview Data
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:csv,txt|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $path = $file->getRealPath();
            
            $data = array_map('str_getcsv', file($path));
            
            // Remove header row if exists (check if first cell is 'product_id')
            $header = $data[0] ?? [];
            if (isset($header[0]) && strtolower(trim($header[0], "\xEF\xBB\xBF")) === 'product_id') {
                array_shift($data);
            }

            $formattedData = [];
            foreach ($data as $row) {
                // Ensure row has enough columns
                if (count($row) < 3) continue;
                
                $formattedData[] = [
                    'product_id' => $row[0],
                    'sale_type'  => $row[1],
                    'sale_value' => $row[2],
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Đọc file CSV thành công',
                'data' => $formattedData
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi đọc file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/product-sales/{id}
     * Xóa ProductSale
     */
    public function destroy($id)
    {
        $item = ProductSale::find($id);
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy ProductSale'
            ], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa ProductSale thành công'
        ]);
    }
}
