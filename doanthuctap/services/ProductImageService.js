import httpAxios from "./httpAxios"; // Điều chỉnh đường dẫn nếu cần

const ProductImageService = {
    /**
     * Lấy danh sách ProductImage
     * GET /api/product-images
     * @param {Object} params - Các tham số truy vấn (product_id, search, sort_by, sort_order, limit, per_page)
     * @returns {Promise<Object>} Dữ liệu trả về từ API
     */
    index: async (params = {}) => {
        try {
            const response = await httpAxios.get('product-images', { params });
            // API Laravel trả về { success: true, message: '...', data: ... }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy chi tiết ProductImage theo ID
     * GET /api/product-images/{id}
     * @param {number} id - ID của ProductImage
     * @returns {Promise<Object>} Dữ liệu chi tiết ProductImage
     */
    show: async (id) => {
        try {
            const response = await httpAxios.get(`product-images/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Tạo mới ProductImage
     * POST /api/product-images
     * @param {Object} data - Dữ liệu ProductImage mới ({ product_id: integer, image: string, alt: string|null, title: string|null })
     * @returns {Promise<Object>} Dữ liệu ProductImage đã tạo
     */
    store: async (data) => {
        try {
            const response = await httpAxios.post('product-images', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật ProductImage theo ID
     * PUT /api/product-images/{id}
     * @param {number} id - ID của ProductImage
     * @param {Object} data - Dữ liệu cần cập nhật
     * @returns {Promise<Object>} Dữ liệu ProductImage đã cập nhật
     */
    update: async (id, data) => {
        try {
            const response = await httpAxios.put(`product-images/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa ProductImage theo ID
     * DELETE /api/product-images/{id}
     * @param {number} id - ID của ProductImage
     * @returns {Promise<Object>} Phản hồi thành công
     */
    destroy: async (id) => {
        try {
            const response = await httpAxios.delete(`product-images/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default ProductImageService;