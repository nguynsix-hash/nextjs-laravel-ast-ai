import httpAxios from "./httpAxios";

/**
 * ===== CLIENT REGISTER =====
 * POST /api/auth/register
 */
export const register = (data) => {
    return httpAxios.post("auth/register", data);
};

/**
 * ===== CLIENT LOGIN =====
 * POST /api/auth/login
 */
export const login = (data) => {
    return httpAxios.post("auth/login", data);
};

/**
 * ===== ADMIN LOGIN =====
 * POST /api/auth/admin/login
 */
export const adminLogin = (data) => {
    return httpAxios.post("auth/admin/login", data);
};

/**
 * ===== LOGOUT =====
 * POST /api/auth/logout
 */
export const logout = () => {
    return httpAxios.post("auth/logout");
};

/**
 * ===== GET CURRENT USER =====
 * GET /api/auth/me
 */
export const me = () => {
    return httpAxios.get("auth/me");
};

/**
 * ===== REFRESH TOKEN =====
 * POST /api/auth/refresh
 */
export const refreshToken = () => {
    return httpAxios.post("auth/refresh");
};

export const changePassword = async (data) => {
    // data bao gồm: old_password, password, password_confirmation
    const response = await httpAxios.post("auth/change-password", data);
    return response;
};

// Hàm cập nhật thông tin cá nhân (Hỗ trợ FormData cho Avatar)
export const updateProfile = async (userData) => {
    // userData có thể là JSON object hoặc FormData
    // Nếu là FormData, axios tự động set Content-Type: multipart/form-data

    // Endpoint: PUT /api/users/{id} hoặc route riêng. 
    // Tuy nhiên, UserController dùng Resource route `api/users/{id}` cho update. 
    // Profile pages đang dùng `updateProfile`, cần xem endpoint thực tế là gì.
    // Ở file cũ ghi `/update-profile`. Cần check route backend. 
    // Tạm thời giả định backend có route `auth/update-profile` hoặc dùng `users/{id}`.
    // Check AuthController không thấy updateProfile.
    // Check UserController có update.
    // Khả năng cao frontend đang gọi sai hoặc thiếu route.
    // Tôi sẽ trỏ về `auth/update-profile` và cần tạo route này hoặc dùng `users/profile`.
    // Để an toàn và đúng chuẩn RESTful cho profile, ta nên dùng `POST` (vì có file) lên `auth/profile` hoặc `users/{id}?_method=PUT` (Laravel trick cho file upload on PUT).

    // Sửa lại: Dùng POST để upload file dễ dàng hơn với Laravel.
    return httpAxios.post("auth/update-profile", userData);
};
// Lưu token + user
// Lưu token + user (Nên dùng utils/auth.js thay thế)
export const saveAuth = (token, user) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("client_token", token);
    localStorage.setItem("client_user", JSON.stringify(user));
};

