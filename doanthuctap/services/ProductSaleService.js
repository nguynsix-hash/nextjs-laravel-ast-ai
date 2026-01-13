import httpAxios from "./httpAxios";

const ProductSaleService = {
  /**
   * Lấy danh sách ProductSale
   * @param {object} params - filter, search, pagination
   */
  getAll: (params = {}) => {
    return httpAxios.get("product-sales", { params });
  },

  /**
   * Lấy chi tiết ProductSale theo id
   * @param {number} id
   */
  getById: (id) => {
    return httpAxios.get(`product-sales/${id}`);
  },

  /**
   * Tạo mới ProductSale
   * @param {object} data
   */
  create: (data) => {
    return httpAxios.post("product-sales", data);
  },

  /**
   * Cập nhật ProductSale theo id
   * @param {number} id
   * @param {object} data
   */
  update: (id, data) => {
    return httpAxios.put(`product-sales/${id}`, data);
  },

  /**
   * Xóa ProductSale theo id
   * @param {number} id
   */
  delete: (id) => {
    return httpAxios.delete(`product-sales/${id}`);
  },

  /**
   * Import sản phẩm khuyến mãi từ file Excel/CSV
   * @param {FormData} formData - Chứa file
   */
  import: (formData) => {
    return httpAxios.post("product-sales/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};

export default ProductSaleService;
