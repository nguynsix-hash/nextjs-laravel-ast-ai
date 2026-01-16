import httpAxios from "./httpAxios";

const InventoryLogService = {
    getAll: (params) => {
        return httpAxios.get("inventory-logs", { params });
    },
};

export default InventoryLogService;
