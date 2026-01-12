import httpAxios from "./httpAxios";

const ConfigService = {
    // Lấy danh sách config + filter + search + sort + paginate
    getAll: (params = {}) => {
        return httpAxios.get("configs", { params });
    },

    // Lấy chi tiết config theo ID
    getById: (id) => {
        return httpAxios.get(`configs/${id}`);
    },

    // Tạo mới config
    create: (data) => {
        return httpAxios.post("configs", data);
    },

    // Cập nhật config
    update: (id, data) => {
        return httpAxios.put(`configs/${id}`, data);
    },

    // Xóa config
    delete: (id) => {
        return httpAxios.delete(`configs/${id}`);
    }
};

export default ConfigService;
