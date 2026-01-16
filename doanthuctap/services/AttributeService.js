// /services/AttributeService.js

import httpAxios from "./httpAxios";

const AttributeService = {
    /**
     * FIX: Đổi tên hàm từ index thành getAll
     * Lấy danh sách Attribute gốc (hsn_attribute)
     * GET /api/attributes
     * @param {Object} params - Các tham số truy vấn (ví dụ: filter, search)
     * @returns {Promise<Object>} Dữ liệu trả về từ API
     */
    getAll: async (params = {}) => {
        try {
            const response = await httpAxios.get('attributes', { params });
            // API Laravel trả về { status: true, message: '...', data: ... }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy danh sách bộ lọc cho Client (chỉ lấy attribute có sản phẩm)
     * GET /api/client/attributes-filter
     * @returns {Promise<Object>} Dữ liệu trả về từ API
     */
    getClientFilterList: async () => {
        try {
            const response = await httpAxios.get("client/attributes-filter");
            return response; // Trả về nguyên body { success: true, data: [...] }
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy chi tiết Attribute theo ID
     * GET /api/attributes/{id}
     */
    show: async (id) => {
        try {
            const response = await httpAxios.get(`attributes/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Tạo mới Attribute
     * POST /api/attributes
     */
    store: async (data) => {
        try {
            const response = await httpAxios.post('attributes', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật Attribute theo ID
     * PUT /api/attributes/{id}
     */
    update: async (id, data) => {
        try {
            const response = await httpAxios.put(`attributes/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa Attribute theo ID
     * DELETE /api/attributes/{id}
     */
    destroy: async (id) => {
        try {
            const response = await httpAxios.delete(`attributes/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default AttributeService;