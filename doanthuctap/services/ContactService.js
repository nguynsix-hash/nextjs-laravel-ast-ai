import httpAxios from "./httpAxios";

const ContactService = {
    // Lấy danh sách contact + filter + search + sort + paginate
    getAll: (params = {}) => {
        return httpAxios.get("contacts", { params });
    },

    // Lấy chi tiết contact theo ID
    getById: (id) => {
        return httpAxios.get(`contacts/${id}`);
    },

    // Tạo mới contact
    create: (data) => {
        return httpAxios.post("contacts", data);
    },

    // Cập nhật contact
    update: (id, data) => {
        return httpAxios.put(`contacts/${id}`, data);
    },

    // Xóa contact
    delete: (id) => {
        return httpAxios.delete(`contacts/${id}`);
    }
};

export default ContactService;
