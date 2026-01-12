import axios from "axios";

const httpAxios = axios.create({
    baseURL: "http://localhost:8000/api/",
});

// ✅ REQUEST INTERCEPTOR: gắn token đúng loại
httpAxios.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            let token = null;
            const pathname = window.location.pathname;

            // Xác định xem có đang ở trang quản trị (dashboard/admin) hay không
            // Dựa vào URL trình duyệt hoặc URL API
            const isAdminRequest = config.url.includes("/auth/admin") ||
                config.url.includes("/admin") ||
                pathname.includes("/dashboard") ||
                pathname.includes("/admin");

            if (isAdminRequest) {
                token = localStorage.getItem("admin_token");
            } else {
                token = localStorage.getItem("client_token");
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// ❌ GIỮ NGUYÊN RESPONSE (KHÔNG ĐỤNG)
httpAxios.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);

export default httpAxios;
