import httpAxios from "./httpAxios";

const DashboardService = {
    getStats: () => {
        return httpAxios.get("admin/dashboard");
    }
};

export default DashboardService;
