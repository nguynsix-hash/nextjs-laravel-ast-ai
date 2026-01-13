<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\ProductStore;
use App\Models\ProductSale;

class ProductController extends Controller
{
    /**
     * ============================
     *  LẤY DS SẢN PHẨM (FILTER + SORT + PAGINATE)
     * ============================
     */
    public function index(Request $request)
    {
        $query = Product::query()->with(['category', 'images', 'sales', 'attributes', 'store']);
        // --- SEARCH ---
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter theo category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter theo khoảng giá
        if ($request->filled('price_min')) {
            $query->where('price_buy', '>=', $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('price_buy', '<=', $request->price_max);
        }

        // Filter theo màu sắc / size (LƯU Ý: Giữ nguyên cách lọc cũ, nếu muốn lọc đúng theo DB mới,
        // cần phải cập nhật logic whereHas để tham chiếu đến tên Attribute trong bảng 'hsn_attribute'
        // hoặc sử dụng ID của Thuộc tính đó).
        // THAY THẾ toàn bộ đoạn lọc color/size cũ bằng đoạn sau (nên dùng ID):

        // Filter theo màu sắc (ID 1 = Màu sắc)
        if ($request->filled('color')) {
            $query->whereHas('attributes', function ($q) use ($request) {
                $q->where('attribute_id', 1) // ID của Màu sắc là 1
                    ->where('value', $request->color);
            });
        }
        // Filter theo size (ID 2 = Kích thước)
        if ($request->filled('size')) {
            $query->whereHas('attributes', function ($q) use ($request) {
                $q->where('attribute_id', 2) // ID của Kích thước là 2
                    ->where('value', $request->size);
            });
        }

        // Filter theo status
        // ===== STATUS FILTER =====
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'new':
                    // sản phẩm đang hoạt động
                    $query->where('status', 1);
                    break;

                case 'sale':
                    // có bản ghi trong product_sales
                    $query->whereHas('sales');
                    break;

                case 'out_of_stock':
                    $query->whereDoesntHave('store');
                    break;

                case 'inactive':
                    $query->where('status', 0);
                    break;
            }
        }

        // Sort
        switch ($request->sortBy) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'price_asc':
                $query->orderBy('price_buy', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price_buy', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        // Lấy dữ liệu
        if ($request->filled('limit')) {
            $data = $query->limit((int)$request->limit)->get();
            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách sản phẩm (limit) thành công.',
                'data' => $data
            ], 200);
        }

        $perPage = $request->per_page ?? 12;
        $data = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách sản phẩm thành công.',
            'data' => $data
        ], 200);
    }
    public function productClient(Request $request)
    {
        $now = now();
        // Lấy tên bảng từ Model để tránh lỗi prefix hsn_ hoặc plural/singular
        $table = (new Product())->getTable();

        // 1. Query tính tổng tồn kho (chỉ lấy các sản phẩm có tổng qty > 0)
        $productStore = ProductStore::query()
            ->select('product_id', DB::raw('SUM(qty) AS product_qty'))
            ->groupBy('product_id');

        // 2. Query lấy thông tin khuyến mãi đang trong thời hạn
        $productSale = ProductSale::query()
            ->select('id', 'product_id', 'price_sale')
            ->where('date_begin', '<=', $now)
            ->where('date_end', '>=', $now);

        // 3. Truy vấn chính
        $query = Product::query()
            // JoinSub với bảng Store để lọc hàng tồn
            ->joinSub($productStore, 'ps', function ($join) use ($table) {
                $join->on('ps.product_id', '=', $table . '.id')
                    ->where('ps.product_qty', '>', 0);
            })
            // LeftJoinSub với bảng Sale để lấy giá giảm (nếu có)
            ->leftJoinSub($productSale, 'psale', function ($join) use ($table) {
                $join->on('psale.product_id', '=', $table . '.id');
            })
            ->select($table . '.*', 'ps.product_qty', 'psale.price_sale')
            ->with(['category', 'images', 'attributes', 'store']);

        // --- CÁC BỘ LỌC (FILTER) ---

        // Tìm kiếm theo tên hoặc mô tả
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Lọc theo Category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo khoảng giá (Sử dụng giá gốc price_buy)
        if ($request->filled('price_min')) {
            $query->where('price_buy', '>=', $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('price_buy', '<=', $request->price_max);
        }

        // Lọc theo Thuộc tính (Màu sắc/Size)
        if ($request->filled('color')) {
            $query->whereHas('attributes', function ($q) use ($request) {
                $q->where('attribute_id', 1)->where('value', $request->color);
            });
        }
        if ($request->filled('size')) {
            $query->whereHas('attributes', function ($q) use ($request) {
                $q->where('attribute_id', 2)->where('value', $request->size);
            });
        }

        // --- SẮP XẾP (SORT) ---
        switch ($request->sortBy) {
            case 'newest':
                $query->orderBy($table . '.created_at', 'DESC');
                break;
            case 'oldest':
                $query->orderBy($table . '.created_at', 'ASC');
                break;
            case 'price_asc':
                $query->orderBy('price_buy', 'ASC');
                break;
            case 'price_desc':
                $query->orderBy('price_buy', 'DESC');
                break;
            default:
                $query->orderBy($table . '.created_at', 'DESC');
        }

        // --- TRẢ DỮ LIỆU ---
        // Nếu có limit (ví dụ trang chủ cần lấy 10 sp mới)
        if ($request->filled('limit')) {
            $data = $query->limit((int)$request->limit)->get();
        } else {
            // Mặc định phân trang
            $perPage = $request->per_page ?? 12;
            $data = $query->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách sản phẩm cho Client thành công.',
            'data' => $data
        ], 200);
    }


    /**
     * ============================
     *  TẠO MỚI PRODUCT (ĐÃ FIX logic Attributes)
     * ============================
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:category,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product,slug',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'content'  => 'nullable|string',
            'description' => 'nullable|string|max:500',
            'price_buy' => 'required|numeric|min:0',
            'status' => 'required|integer|in:0,1',

            // THÊM VALIDATION CHO ATTRIBUTES (GIỮ NGUYÊN)
            'attributes' => 'nullable|array',
            'attributes.*.attribute_id' => 'required|integer|exists:attribute,id',
            'attributes.*.value' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // 💡 BƯỚC SỬA LỖI 1: Lấy dữ liệu attributes GỬI ĐI vào một biến riêng 
        // trước khi loại trừ nó khỏi mảng $data
        $attributes_data = $request->input('attributes', []);

        // LOẠI BỎ 'attributes' ra khỏi $data trước khi tạo Product (GIỮ NGUYÊN)
        $data = $request->except(['thumbnail', 'images', 'attributes']);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $data['created_at'] = now();
        $data['created_by'] = $request->created_by ?? 1;

        // Upload thumbnail (GIỮ NGUYÊN)
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('uploads/products', 'public');
            $data['thumbnail'] = $path;
        }

        $product = Product::create($data);

        // Upload multiple images (GIỮ NGUYÊN)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $path = $img->store('uploads/products', 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $path
                ]);
            }
        }

        // 💡 BƯỚC SỬA LỖI 2: Sử dụng biến $attributes_data đã được lưu trữ 
        // để đảm bảo dữ liệu luôn có sẵn sau khi Product được tạo.
        if (!empty($attributes_data) && is_array($attributes_data)) {
            foreach ($attributes_data as $attr) {
                if (isset($attr['attribute_id']) && isset($attr['value'])) {
                    // Cần đảm bảo quan hệ attributes() trong Product model là HasMany tới ProductAttribute.
                    $product->attributes()->create([
                        'attribute_id' => $attr['attribute_id'],
                        'value' => $attr['value']
                    ]);
                }
            }
        }


        $product->load(['category', 'images', 'sales', 'attributes', 'store']);
        $product->thumbnail_url = asset('storage/' . $product->thumbnail);

        foreach ($product->images as $img) {
            $img->image_url = asset('storage/' . $img->image);
        }


        return response()->json([
            'success' => true,
            'message' => 'Tạo sản phẩm thành công.',
            'data' => $product
        ], 201);
    }

    /**
     * ============================
     *  CHI TIẾT PRODUCT
     * ============================
     */
    public function show(Product $product)
    {
        // CẦN THAY ĐỔI DÒNG NÀY: Eager load 'attribute' lồng trong 'attributes'
        $product->load([
            'category',
            'images',
            'sales',
            'attributes.attribute', // <-- ĐÂY LÀ PHẦN SỬA LỖI
            'store'
        ]);

        // XỬ LÝ LẤY GIÁ SALE (NẾU CÓ)
        $sale = $product->sales()
            ->where('date_begin', '<=', now())
            ->where('date_end', '>=', now())
            ->first();

        if ($sale) {
            $product->price_sale = $sale->price_sale;
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết sản phẩm thành công.',
            'data' => $product
        ]);
    }

    /**
     * ============================
     *  LẤY SẢN PHẨM LIÊN QUAN
     * ============================
     */
    public function getRelated(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại.'
            ], 404);
        }

        $limit = $request->input('limit', 4);
        $now = now();

        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $id)
            ->where('status', 1)
            // Filter: Có tồn kho (Tổng QTY > 0)
            // Filter: Có tồn kho (qty > 0)
            ->whereHas('store', function ($q) {
                $q->where('qty', '>', 0);
            })
            // Filter: BỎ lọc khuyến mãi (lấy cả sp không sale)
            ->with(['images', 'sales' => function ($q) use ($now) {
                $q->where('date_begin', '<=', $now)
                  ->where('date_end', '>=', $now);
            }])
            ->limit($limit)
            ->inRandomOrder() 
            ->get();

        // Xử lý thêm url ảnh nếu cần thiết (tương tự method index)
        foreach ($relatedProducts as $p) {
             if ($p->thumbnail) {
                 $p->thumbnail_url = asset('storage/' . $p->thumbnail);
             }
             foreach ($p->images as $img) {
                 $img->image_url = asset('storage/' . $img->image);
             }
             
             // Attach price_sale
             $activeSale = $p->sales->first(); // Đã filter theo date ở query key 'sales' trên
             if ($activeSale) {
                 $p->price_sale = $activeSale->price_sale;
             }
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách sản phẩm liên quan thành công.',
            'data' => $relatedProducts
        ]);
    }

    /**
     * ============================
     *  CẬP NHẬT PRODUCT (ĐÃ FIX logic Attributes)
     * ============================
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|integer|exists:category,id',
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product,slug,' . $product->id,
            'thumbnail'  => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'content' => 'nullable|string',
            'description' => 'nullable|string|max:500',
            'price_buy' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|integer|in:0,1',

            // THÊM VALIDATION CHO ATTRIBUTES
            'attributes' => 'nullable|array',
            'attributes.*.attribute_id' => 'required|integer|exists:attribute,id',
            'attributes.*.value' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // LOẠI BỎ 'attributes' ra khỏi $data
        $data = $request->except(['thumbnail', 'images', 'attributes']);

        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $data['updated_at'] = now();
        $data['updated_by'] = $request->updated_by ?? 1;

        // Upload new thumbnail
        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }

            $path = $request->file('thumbnail')->store('uploads/products', 'public');
            $data['thumbnail'] = $path;
        }

        $product->update($data);

        // Upload new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $path = $img->store('uploads/products', 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $path
                ]);
            }
        }

        // XỬ LÝ XÓA ẢNH (Nếu frontend gửi mảng deleted_images)
        if ($request->filled('deleted_images')) {
            $deletedIds = $request->input('deleted_images');
            if (is_array($deletedIds)) {
                $imagesToDelete = ProductImage::whereIn('id', $deletedIds)
                    ->where('product_id', $product->id)
                    ->get();
                
                foreach ($imagesToDelete as $img) {
                    if ($img->image) {
                        Storage::disk('public')->delete($img->image);
                    }
                    $img->delete();
                }
            }
        }

        // XỬ LÝ CẬP NHẬT KHO (Store/Qty)
        // Frontend gửi lên field 'qty' hoặc 'stock'
        $qty = $request->input('qty', $request->input('stock'));
        if ($qty !== null) {
            $store = ProductStore::where('product_id', $product->id)->first();
            if ($store) {
                $store->qty = (int)$qty;
                $store->updated_at = now();
                $store->save();
            } else {
                ProductStore::create([
                    'product_id' => $product->id,
                    'qty' => (int)$qty,
                    'created_at' => now(),
                    'updated_at' => now(),
                    'status' => 1
                ]);
            }
        }

        // XỬ LÝ CẬP NHẬT PRODUCT ATTRIBUTE
        if ($request->has('attributes')) {
            // 1. Xóa tất cả thuộc tính cũ của sản phẩm này
            $product->attributes()->delete();

            // 2. Thêm các thuộc tính mới
            if (is_array($request->attributes)) {
                foreach ($request->attributes as $attr) {
                    if (isset($attr['attribute_id']) && isset($attr['value'])) {
                        $product->attributes()->create([
                            'attribute_id' => $attr['attribute_id'],
                            'value' => $attr['value']
                        ]);
                    }
                }
            }
        }


        $product->load(['category', 'images', 'sales', 'attributes', 'store']);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công.',
            'data' => $product
        ]);
    }

    /**
     * ============================
     *  XÓA PRODUCT
     * ============================
     */
    public function destroy(Product $product)
    {
        // Xóa thumbnail
        if ($product->thumbnail) {
            $oldPath = str_replace('/storage/', 'public/', $product->thumbnail);
            Storage::delete($oldPath);
        }

        // Xóa images
        foreach ($product->images as $img) {
            $oldPath = str_replace('/storage/', 'public/', $img->image);
            Storage::delete($oldPath);
            $img->delete();
        }

        // Xóa Product Attributes liên quan (Sử dụng Model Event hoặc thủ công)
        $product->attributes()->delete(); // Đảm bảo dọn dẹp các bản ghi trong hsn_product_attribute

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công.'
        ]);
    }
}
