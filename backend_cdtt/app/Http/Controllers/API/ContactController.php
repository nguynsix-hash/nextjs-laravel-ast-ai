<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * GET /api/contacts
     * Lấy danh sách contact, filter, search, phân trang
     */
    public function index(Request $request)
    {
        $query = Contact::query();

        // Filter theo status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter theo user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search theo name, email, phone, content
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                  ->orWhere('email', 'like', '%'.$search.'%')
                  ->orWhere('phone', 'like', '%'.$search.'%')
                  ->orWhere('content', 'like', '%'.$search.'%');
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
            'message' => 'Danh sách liên hệ',
            'data' => $data
        ]);
    }

    /**
     * GET /api/contacts/{id}
     * Chi tiết contact
     */
    public function show($id)
    {
        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy liên hệ'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $contact
        ]);
    }

    /**
     * POST /api/contacts
     * Tạo mới contact
     */
    public function store(Request $request)
    {
        // Update Validation: Email should be required if DB requires it. Phone can be optional but must be handling string/null mismatch.
        // Tuy nhiên, để linh hoạt, ta sẽ giữ nullable và xử lý gán chuỗi rỗng bên dưới nếu null.
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|integer',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255', // Changed to required
            'phone' => 'nullable|string|max:50',
            'content' => 'required|string',
            'reply_id' => 'nullable|integer',
            'status' => 'nullable|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['created_at'] = now();
            $data['updated_at'] = now();
            $data['user_id'] = $request->user_id ?? null; 
            // Fix 500 Error: created_by is NOT NULL check migration
            $data['created_by'] = $request->created_by ?? 1; // Default to 1 (Admin) instead of null
            $data['status'] = $request->status ?? 1;
            
            // Fix 500 Error: DB fields are NOT NULL
            $data['phone'] = $request->phone ?? ""; 
            $data['email'] = $request->email ?? ""; // Should be covered by required validation but safe to keep
            $data['reply_id'] = $request->reply_id ?? 0;

            $contact = Contact::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Tạo liên hệ thành công',
                'data' => $contact
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi Server: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/contacts/{id}
     * Cập nhật contact
     */
    public function update(Request $request, $id)
    {
        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy liên hệ'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'sometimes|nullable|integer',
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|max:255',
            'phone' => 'sometimes|nullable|string|max:50',
            'content' => 'sometimes|required|string',
            'reply_id' => 'sometimes|nullable|integer',
            'status' => 'sometimes|required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $contact->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật liên hệ thành công',
            'data' => $contact
        ]);
    }

    /**
     * DELETE /api/contacts/{id}
     * Xóa contact
     */
    public function destroy($id)
    {
        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy liên hệ'
            ], 404);
        }

        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa liên hệ thành công'
        ]);
    }
}
