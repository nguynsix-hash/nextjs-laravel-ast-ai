import httpAxios from "./httpAxios";

const API_STORAGE_URL = "http://localhost:8000/storage";

const CategoryService = {
    /**
     * Lấy danh sách categories
     */
    getAll: (params = {}) => {
        return httpAxios.get("categories", { params });
    },

    /**
     * Lấy chi tiết category
     */
    getById: (id) => {
        return httpAxios.get(`categories/${id}`);
    },

    /**
     * Tạo mới category (multipart/form-data)
     */
   create: (data) => {
    const formData = new FormData();

    // Duyệt qua tất cả các key để append vào FormData
    Object.keys(data).forEach((key) => {
        // Postman của bạn gửi status, sort_order... là Text nhưng giá trị là số
        // Ta chỉ append nếu giá trị không phải null/undefined
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });

    return httpAxios.post("categories", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
},

    /**
     * Cập nhật category (multipart/form-data)
     */
    update: (id, data) => {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        // Laravel nhận PUT multipart tốt khi fake method
        formData.append("_method", "PUT");

        return httpAxios.post(`categories/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    /**
     * Xóa category
     */
    delete: (id) => {
        return httpAxios.delete(`categories/${id}`);
    },

    /**
     * Build URL ảnh category
     */
    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `${API_STORAGE_URL}/${path.startsWith("/") ? path.substring(1) : path}`;
    }
};

export default CategoryService;
