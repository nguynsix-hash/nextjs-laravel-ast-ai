import httpAxios from "./httpAxios";

const ProductStoreService = {
  /**
   * Lấy danh sách ProductStore
   * @param {object} params - filter, search, pagination
   */
  getAll: (params = {}) => {
    return httpAxios.get("product-stores", { params });
  },

  /**
   * Lấy chi tiết ProductStore theo id
   * @param {number} id
   */
  getById: (id) => {
    return httpAxios.get(`product-stores/${id}`);
  },

  /**
   * Tạo mới ProductStore
   * @param {object} data
   */
  create: (data) => {
    return httpAxios.post("product-stores", data);
  },

  /**
   * Cập nhật ProductStore theo id
   * @param {number} id
   * @param {object} data
   */
  update: (id, data) => {
    return httpAxios.put(`product-stores/${id}`, data);
  },

  /**
   * Xóa ProductStore theo id
   * @param {number} id
   */
  delete: (id) => {
    return httpAxios.delete(`product-stores/${id}`);
  }
};

export default ProductStoreService;
