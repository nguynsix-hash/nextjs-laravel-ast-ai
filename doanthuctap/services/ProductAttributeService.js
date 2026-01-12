// services/ProductAttributeService.js
import httpAxios from "./httpAxios";

const ProductAttributeService = {
    /**
     * Lấy danh sách ProductAttribute
     * @param {*} params 
     *  - product_id
     *  - attribute_id
     *  - search
     *  - sort_by
     *  - sort_order
     *  - per_page
     *  - limit
     */
    getList: (params = {}) => {
        return httpAxios.get("product-attributes", { params });
    },

    /**
     * Lấy chi tiết ProductAttribute theo ID
     */
    getById: (id) => {
        return httpAxios.get(`product-attributes/${id}`);
    },

    /**
     * Tạo mới ProductAttribute
     * {
     *   product_id: number,
     *   attribute_id: number,
     *   value: string
     * }
     */
    create: (data) => {
        return httpAxios.post("product-attributes", data);
    },

    /**
     * Cập nhật ProductAttribute
     */
    update: (id, data) => {
        return httpAxios.put(`product-attributes/${id}`, data);
    },

    /**
     * Xóa ProductAttribute
     */
    remove: (id) => {
        return httpAxios.delete(`product-attributes/${id}`);
    }
};

export default ProductAttributeService;
