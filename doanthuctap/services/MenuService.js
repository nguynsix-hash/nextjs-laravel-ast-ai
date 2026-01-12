import httpAxios from "./httpAxios";

const MenuService = {
    // Lấy danh sách menu + filter + search
    getAll: (params = {}) => {
        return httpAxios.get("menus", { params });
    },

    // Lấy chi tiết menu
    getById: (id) => {
        return httpAxios.get(`menus/${id}`);
    },

    // Tạo menu
    create: (data) => {
        return httpAxios.post("menus", data);
    },

    // Cập nhật menu
    update: (id, data) => {
        return httpAxios.put(`menus/${id}`, data);
    },

    // Xóa menu
    delete: (id) => {
        return httpAxios.delete(`menus/${id}`);
    }
};

export default MenuService;
