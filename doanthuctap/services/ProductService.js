// ProductService.js
import api from "./httpAxios";

const ProductService = {
    /**
     * DÀNH CHO ADMIN
     * @param {object} params - { search, category_id, price_min, price_max, color, size, status, sortBy, limit, per_page }
     */
    getAll: (params = {}) => api.get("/products", { params }),

    /**
     * DÀNH CHO CLIENT (Người dùng)
     * Backend xử lý JoinSub để lọc hàng tồn kho > 0 và lấy giá Sale (price_sale)
     * @param {object} params - { search, category_id, price_min, price_max, color, size, sortBy, limit, per_page }
     */
    productClient: (params = {}) => api.get("/client/products", { params }),

    /**
     * Chi tiết sản phẩm (Eager load: category, images, sales, attributes, store)
     */
    getById: (id) => api.get(`/products/${id}`),

    /**
     * Lấy sản phẩm liên quan
     */
    getRelated: (id, limit = 4) => api.get(`/client/products/${id}/related`, { params: { limit } }),

    /**
     * Tạo mới sản phẩm (Dùng FormData vì có upload file)
     */
    create: (formData) => {
        return api.post("/products", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    /**
     * Cập nhật sản phẩm
     * Lưu ý: Laravel đôi khi không nhận PUT với multipart/form-data. 
     * Nếu lỗi, hãy đổi api.put thành api.post và thêm formData.append('_method', 'PUT')
     */
    update: (id, formData) => {
        formData.append("_method", "PUT");
        return api.post(`/products/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    /**
     * Xóa sản phẩm
     */
    delete: (id) => api.delete(`/products/${id}`),

    // --- HELPER METHODS ---

    /**
     * Xử lý URL hình ảnh từ Backend
     */
    getImageUrl: (path) => {
        const API_BASE_URL = "http://localhost:8000/storage";
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        // Xóa dấu / ở đầu nếu có để tránh double slash
        const cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return `${API_BASE_URL}/${cleanPath}`;
    },

    /**
     * Lấy ảnh đại diện (Thumbnail) của sản phẩm
     * Ưu tiên lấy từ mảng 'images' (đã eager load ở backend)
     */
    getProductThumbnailUrl: (product) => {
        let path = null;
        if (product.images && product.images.length > 0) {
            path = product.images[0].image;
        } else if (product.thumbnail) {
            path = product.thumbnail;
        }
        return ProductService.getImageUrl(path);
    }
};

export default ProductService;