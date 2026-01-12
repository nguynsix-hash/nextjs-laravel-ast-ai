import httpAxios from "./httpAxios";

const OrderService = {
    /**
     * Lấy danh sách đơn hàng (có search, filter, sort, pagination)
     * GET /orders
     */
    getAll(params = {}) {
        return httpAxios.get("orders", { params });
    },

    /**
     * Lấy chi tiết 1 đơn hàng
     * GET /orders/{id}
     */
    getById(id) {
        return httpAxios.get(`orders/${id}`);
    },

    /**
     * Tạo đơn hàng mới
     * POST /orders
     */
    create(data) {
        return httpAxios.post("orders", data);
    },

    /**
     * Cập nhật đơn hàng
     * PUT /orders/{id}
     */
    update(id, data) {
        return httpAxios.put(`orders/${id}`, data);
    },

    /**
     * Xóa đơn hàng
     * DELETE /orders/{id}
     */
    delete(id) {
        return httpAxios.delete(`orders/${id}`);
    }
};

export default OrderService;
