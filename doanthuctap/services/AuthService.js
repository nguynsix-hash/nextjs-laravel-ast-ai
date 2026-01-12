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
    const response = await apiClient.post("/change-password", data);
    return response.data;
};

// Hàm cập nhật thông tin cá nhân
export const updateProfile = async (userData) => {
    // userData bao gồm: name, phone, address...
    const response = await apiClient.put("/update-profile", userData);
    return response.data;
};
// Lưu token + user
export const saveAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
};

