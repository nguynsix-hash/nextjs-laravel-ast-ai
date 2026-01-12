import httpAxios from "./httpAxios";

/**
 * Service tương tác với API Post
 */
const PostService = {

    /* =========================
     * GET LIST
     * ========================= */
    index: (params = {}) => {
        return httpAxios.get("posts", { params });
    },

    /* =========================
     * GET DETAIL
     * ========================= */
    show: (id) => {
        return httpAxios.get(`posts/${id}`);
    },

    /* =========================
     * CREATE (UPLOAD ẢNH)
     * ========================= */
    store: (data) => {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        return httpAxios.post("posts", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /* =========================
     * UPDATE (UPLOAD ẢNH)
     * ========================= */
    update: (id, data) => {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        // Laravel PUT multipart workaround
        formData.append("_method", "PUT");

        return httpAxios.post(`posts/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /* =========================
     * DELETE
     * ========================= */
    destroy: (id) => {
        return httpAxios.delete(`posts/${id}`);
    },

    /* =========================
     * IMAGE URL HELPER
     * ========================= */
    getImageUrl: (path) => {
        const API_BASE_URL = "http://localhost:8000";

        if (!path) return null;

        // Nếu đã là URL đầy đủ
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Chuẩn với API bạn đang dùng: public/uploads/posts/xxx.jpg
        return `${API_BASE_URL}/${path.startsWith("/") ? path.substring(1) : path}`;
    },
};

export default PostService;
