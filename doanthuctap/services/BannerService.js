import httpAxios from "./httpAxios";

const API_BASE_URL = "http://localhost:8000"; // Đảm bảo đúng cổng backend Laravel

const BannerService = {
    index: (params = {}) => {
        return httpAxios.get("banners", { params });
    },

    show: (id) => {
        return httpAxios.get(`banners/${id}`);
    },

    store: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return httpAxios.post("banners", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    update: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        formData.append("_method", "PUT");
        return httpAxios.post(`banners/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    destroy: (id) => {
        return httpAxios.delete(`banners/${id}`);
    },

    /* =========================
     * XỬ LÝ ĐƯỜNG DẪN ẢNH
     * ========================= */
    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        const cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return `${API_BASE_URL}/${cleanPath}`;
    },

    // Sửa lại hàm này để nhận trực tiếp chuỗi hoặc object
    getBannerImageUrl: (imagePath) => {
        if (!imagePath) return null;
        // Nếu truyền vào object, lấy thuộc tính image, nếu là chuỗi thì dùng luôn
        const path = typeof imagePath === 'object' ? imagePath.image : imagePath;
        return BannerService.getImageUrl(path);
    },
};

export default BannerService;