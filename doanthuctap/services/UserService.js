import httpAxios from "./httpAxios";

const UserService = {
    // Lấy danh sách user (có hỗ trợ search, filter, sort, pagination)
    getAll: (params = {}) => {
        return httpAxios.get("users", { params });
    },

    // Lấy chi tiết user
    getById: (id) => {
        return httpAxios.get(`users/${id}`);
    },

    // Tạo mới user
    create: (data) => {
        return httpAxios.post("users", data);
    },

    // Cập nhật user
    update: (id, data) => {
        // Nếu là FormData, dùng POST với _method=PUT để Laravel xử lý file upload
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return httpAxios.post(`users/${id}`, data);
        }
        return httpAxios.put(`users/${id}`, data);
    },

    // Xóa user
    remove: (id) => {
        return httpAxios.delete(`users/${id}`);
    },
};

export default UserService;
