// ===================== CLIENT =====================
export const saveAuth = (token, user) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("client_token", token);
    localStorage.setItem("client_user", JSON.stringify(user));
};

export const getUser = () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("client_user");
    return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
};

// ===================== ADMIN =====================
export const saveAdminAuth = (token, user) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
};

export const getAdminUser = () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("admin_user");
    return user ? JSON.parse(user) : null;
};

export const clearAdminAuth = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
};

// ===================== UTILS =====================
// Kiểm tra user có role admin
export const isAdmin = () => {
    const user = getUser(); // dùng client user
    return user?.roles === "admin";
};
