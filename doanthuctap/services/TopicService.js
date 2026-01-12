import httpAxios from "./httpAxios";

/**
 * Service quản lý các thao tác CRUD (Create, Read, Update, Delete) cho tài nguyên Topic.
 */
const TopicService = {
    // Đường dẫn gốc cho resource Topic
    basePath: 'topics',

    /**
     * Lấy danh sách Topics.
     * Hỗ trợ filtering, searching, sorting và pagination thông qua query parameters.
     * @param {object} params - Các tham số query (status, search, sort_by, sort_order, per_page, limit)
     * @returns {Promise<object>} Dữ liệu response từ API (đã được intercept để trả về trực tiếp response.data)
     */
    getAll: async (params = {}) => {
        try {
            // Sử dụng httpAxios để gửi request GET
            const response = await httpAxios.get(TopicService.basePath, { params });
            return response;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Topics:", error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết một Topic dựa trên ID.
     * @param {number|string} id - ID của Topic cần xem chi tiết
     * @returns {Promise<object>} Chi tiết Topic (bao gồm cả posts)
     */
    getById: async (id) => {
        try {
            const response = await httpAxios.get(`${TopicService.basePath}/${id}`);
            return response;
        } catch (error) {
            console.error(`Lỗi khi lấy chi tiết Topic có ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo mới một Topic.
     * @param {object} data - Dữ liệu Topic cần tạo (name, description, status, v.v.)
     * @returns {Promise<object>} Topic vừa được tạo
     */
    create: async (data) => {
        try {
            const response = await httpAxios.post(TopicService.basePath, data);
            return response;
        } catch (error) {
            console.error("Lỗi khi tạo mới Topic:", error);
            throw error;
        }
    },

    /**
     * Cập nhật một Topic.
     * @param {number|string} id - ID của Topic cần cập nhật
     * @param {object} data - Dữ liệu cập nhật (name, description, status, v.v.)
     * @returns {Promise<object>} Topic đã được cập nhật
     */
    update: async (id, data) => {
        try {
            // Sử dụng PUT/PATCH tùy thuộc vào API (Controller của bạn dùng PUT/PATCH)
            const response = await httpAxios.put(`${TopicService.basePath}/${id}`, data);
            return response;
        } catch (error) {
            console.error(`Lỗi khi cập nhật Topic có ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa một Topic.
     * @param {number|string} id - ID của Topic cần xóa
     * @returns {Promise<object>} Message thành công
     */
    remove: async (id) => {
        try {
            const response = await httpAxios.delete(`${TopicService.basePath}/${id}`);
            return response;
        } catch (error) {
            console.error(`Lỗi khi xóa Topic có ID ${id}:`, error);
            throw error;
        }
    },
};

export default TopicService;