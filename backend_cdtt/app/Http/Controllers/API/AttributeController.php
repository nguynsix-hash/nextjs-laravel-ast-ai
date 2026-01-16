<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class AttributeController extends Controller
{
    /**
     * GET /api/client/attributes-filter
     * Lấy danh sách Attribute và các Value ĐANG CÓ trong sản phẩm (để làm bộ lọc)
     */
    public function clientList()
    {
        // Lấy tất cả thuộc tính
        $attributes = Attribute::all();
        $data = [];

        foreach ($attributes as $attr) {
            // Lấy các giá trị (value) duy nhất của thuộc tính này từ các sản phẩm ĐANG HOẠT ĐỘNG (status=1)
            $values = \App\Models\ProductAttribute::where('attribute_id', $attr->id)
                ->whereHas('product', function ($q) {
                    $q->where('status', 1); // Chỉ lấy sản phẩm active
                })
                ->select('value')
                ->distinct()
                ->pluck('value');

            // Nếu thuộc tính này có giá trị nào đó được sử dụng thì mới trả về
            if ($values->count() > 0) {
                $data[] = [
                    'id' => $attr->id,
                    'name' => $attr->name,
                    'values' => $values
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách bộ lọc thành công',
            'data' => $data
        ]);
    }

    /**
     * GET /api/attributes
     * Lấy danh sách Attribute kèm sản phẩm
     * Có filter sản phẩm, search theo name, sort, paginate
     */
    public function index(Request $request)
    {
        $query = Attribute::with(['products.category', 'products.store', 'products.sales', 'products.images']);

        // -----------------------------
        // 1) Filter theo Product
        // -----------------------------
        if ($request->product_id) {
            $query->whereHas('products', function($q) use ($request){
                $q->where('id', $request->product_id);
            });
        }

        if ($request->category_id) {
            $query->whereHas('products', function($q) use ($request){
                $q->where('category_id', $request->category_id);
            });
        }

        if ($request->price_min) {
            $query->whereHas('products', function($q) use ($request){
                $q->where('price_buy', '>=', $request->price_min);
            });
        }

        if ($request->price_max) {
            $query->whereHas('products', function($q) use ($request){
                $q->where('price_buy', '<=', $request->price_max);
            });
        }

        if ($request->color) {
            $query->whereHas('products.attributes', function($q) use ($request){
                $q->where('type', 'color')->where('value', $request->color);
            });
        }

        if ($request->size) {
            $query->whereHas('products.attributes', function($q) use ($request){
                $q->where('type', 'size')->where('value', $request->size);
            });
        }

        if ($request->status !== null) {
            $query->whereHas('products', function($q) use ($request){
                $q->where('status', $request->status);
            });
        }

        // -----------------------------
        // 2) Search theo tên attribute
        // -----------------------------
        if ($request->search) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // -----------------------------
        // 3) Sort sản phẩm trong mỗi attribute
        // -----------------------------
        $sort = $request->sort;
        $query->with(['products' => function($q) use ($sort){
            switch ($sort) {
                case 'newest':
                    $q->orderBy('created_at', 'desc');
                    break;
                case 'price_asc':
                    $q->orderBy('price_buy', 'asc');
                    break;
                case 'price_desc':
                    $q->orderBy('price_buy', 'desc');
                    break;
                case 'sale_desc':
                    $q->leftJoin('product_sale', 'product.id', '=', 'product_sale.product_id')
                      ->orderBy('product_sale.discount_percent', 'desc');
                    break;
                case 'views_desc':
                    if (Schema::hasColumn('product', 'views')) {
                        $q->orderBy('views', 'desc');
                    }
                    break;
                default:
                    $q->orderBy('created_at', 'desc');
            }
        }]);

        // -----------------------------
        // 4) Pagination / Limit
        // -----------------------------
        if ($request->limit) {
            $data = $query->limit((int)$request->limit)->get();
        } else {
            $perPage = $request->per_page ?? 12;
            $data = $query->paginate($perPage);
        }

        return response()->json([
            'status' => true,
            'message' => 'Danh sách thuộc tính kèm sản phẩm',
            'data' => $data
        ]);
    }

    // ============================
    // CRUD Attribute
    // ============================

    public function show($id)
    {
        $attr = Attribute::with('products')->find($id);
        if (!$attr) {
            return response()->json(['status'=>false,'message'=>'Không tìm thấy thuộc tính'],404);
        }
        return response()->json(['status'=>true,'data'=>$attr]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), ['name'=>'required|string|max:255']);
        if ($validator->fails()) {
            return response()->json(['status'=>false,'message'=>'Dữ liệu không hợp lệ','errors'=>$validator->errors()],422);
        }

        $attr = Attribute::create(['name'=>$request->name]);

        if ($request->product_ids) {
            $attr->products()->sync($request->product_ids);
        }

        return response()->json(['status'=>true,'message'=>'Tạo Attribute thành công','data'=>$attr->load('products')],201);
    }

    public function update(Request $request, $id)
    {
        $attr = Attribute::find($id);
        if (!$attr) return response()->json(['status'=>false,'message'=>'Không tìm thấy Attribute'],404);

        $validator = Validator::make($request->all(), [
            'name'=>'sometimes|required|string|max:255',
            'product_ids'=>'sometimes|array'
        ]);
        if ($validator->fails()) return response()->json(['status'=>false,'message'=>'Dữ liệu không hợp lệ','errors'=>$validator->errors()],422);

        if ($request->has('name')) $attr->name = $request->name;
        $attr->save();

        if ($request->has('product_ids')) $attr->products()->sync($request->product_ids);

        return response()->json(['status'=>true,'message'=>'Cập nhật thành công','data'=>$attr->load('products')]);
    }

    public function destroy($id)
    {
        $attr = Attribute::find($id);
        if (!$attr) return response()->json(['status'=>false,'message'=>'Không tìm thấy Attribute'],404);

        $attr->products()->detach();
        $attr->delete();

        return response()->json(['status'=>true,'message'=>'Xóa Attribute thành công']);
    }
}
