<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Config;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConfigController extends Controller
{
    /**
     * GET /api/configs
     * Lấy danh sách config, có filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = Config::query();

        // Filter theo status (0=inactive, 1=active)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search theo site_name, email, phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('site_name', 'like', '%'.$search.'%')
                  ->orWhere('email', 'like', '%'.$search.'%')
                  ->orWhere('phone', 'like', '%'.$search.'%');
            });
        }

        // Sort theo site_name hoặc id
        $sort_by = $request->get('sort_by', 'id');
        $sort_order = $request->get('sort_order', 'asc');
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
            'message' => 'Danh sách cấu hình',
            'data' => $data
        ]);
    }

    /**
     * GET /api/configs/{id}
     * Chi tiết config
     */
    public function show($id)
    {
        $config = Config::find($id);
        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy config'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $config
        ]);
    }

    /**
     * POST /api/configs
     * Tạo mới config
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'site_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'hotline' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'status' => 'required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $config = Config::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo cấu hình thành công',
            'data' => $config
        ], 201);
    }

    /**
     * PUT /api/configs/{id}
     * Cập nhật config
     */
    public function update(Request $request, $id)
    {
        $config = Config::find($id);
        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy config'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'site_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|max:255',
            'phone' => 'sometimes|nullable|string|max:50',
            'hotline' => 'sometimes|nullable|string|max:50',
            'address' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $config->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật cấu hình thành công',
            'data' => $config
        ]);
    }

    /**
     * DELETE /api/configs/{id}
     * Xóa config
     */
    public function destroy($id)
    {
        $config = Config::find($id);
        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy config'
            ], 404);
        }

        $config->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa cấu hình thành công'
        ]);
    }
}
