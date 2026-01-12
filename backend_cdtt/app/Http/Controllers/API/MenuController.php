<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    /**
     * GET /api/menus
     */
    public function index(Request $request)
    {
        $query = Menu::query();

        // Filter theo status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter theo type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter theo parent_id
        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Search theo name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        /**
         * SORT (FIX LỖI CHÍNH)
         */
        $allowedSortBy = ['id', 'name', 'sort_order', 'created_at'];

        $sortBy = $request->get('sort_by', 'sort_order');
        if (!in_array($sortBy, $allowedSortBy)) {
            $sortBy = 'sort_order';
        }

        $order = strtolower($request->get('order', 'asc'));
        if (!in_array($order, ['asc', 'desc'])) {
            $order = 'asc';
        }

        $query->orderBy($sortBy, $order);

        // Pagination hoặc limit
        if ($request->filled('limit')) {
            $data = $query->limit((int) $request->limit)->get();
        } else {
            $perPage = (int) $request->get('per_page', 10);
            $data = $query->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'message' => 'Danh sách menu',
            'data' => $data
        ]);
    }

    /**
     * GET /api/menus/{id}
     */
    public function show($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy menu'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menu
        ]);
    }

    /**
     * POST /api/menus
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'link'       => 'nullable|string|max:255',
            'type'       => 'nullable|string|max:50',
            'parent_id'  => 'nullable|integer',
            'sort_order' => 'nullable|integer',
            'table_id'   => 'nullable|integer',
            'position'   => 'nullable|string|max:50',
            'status'     => 'required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        $menu = Menu::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo menu thành công',
            'data'    => $menu
        ], 201);
    }

    /**
     * PUT /api/menus/{id}
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy menu'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'       => 'sometimes|required|string|max:255',
            'link'       => 'sometimes|nullable|string|max:255',
            'type'       => 'sometimes|nullable|string|max:50',
            'parent_id'  => 'sometimes|nullable|integer',
            'sort_order' => 'sometimes|nullable|integer',
            'table_id'   => 'sometimes|nullable|integer',
            'position'   => 'sometimes|nullable|string|max:50',
            'status'     => 'sometimes|required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        $menu->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật menu thành công',
            'data'    => $menu
        ]);
    }

    /**
     * DELETE /api/menus/{id}
     */
    public function destroy($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy menu'
            ], 404);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa menu thành công'
        ]);
    }
}
