import axios from "axios";

const httpAxios = axios.create({
    baseURL: "http://localhost:8000/api/",
});

// ✅ REQUEST INTERCEPTOR: gắn token đúng loại
httpAxios.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            let token = null;

            // Nếu URL chứa 'admin', dùng token admin
            if (config.url.includes("/auth/admin") || config.url.includes("/admin")) {
                token = localStorage.getItem("admin_token");
            } else {
                // Ngược lại, dùng token client
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
