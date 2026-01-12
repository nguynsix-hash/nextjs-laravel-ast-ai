"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit3, Search, ChevronLeft, ChevronRight, Menu, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import MenuService from "../../../../services/MenuService";

// Helper function to map status
const mapStatusToText = (status) => {
    return status === 1 ? "Kích hoạt" : "Không kích hoạt";
};

export default function MenuManagement() {
    const router = useRouter();

    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // =====================================================
    // LOAD MENU API
    // =====================================================
    const loadMenus = useCallback(async () => {
        try {
            setLoading(true);

            const statusParam = filterStatus !== "all" ? Number(filterStatus) : undefined;

            const params = {
                search: search || undefined,
                status: statusParam,
            };

            // Reset current page when loading new data based on search/filter
            setCurrentPage(1); 

            const { data } = await MenuService.getAll(params);

            const processedMenus = (data?.data || data || []).map((menu) => ({
                ...menu,
                status: Number(menu.status),
            }));

            setMenus(processedMenus);
        } catch (error) {
            console.error("Load menu error:", error);
            // Có thể thêm một alert hoặc toast thông báo lỗi
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus]); // loadMenus phụ thuộc vào search và filterStatus

    useEffect(() => {
        loadMenus();
    }, [loadMenus]);

    // =====================================================
    // FILTER + SEARCH (Client-side filtering is removed 
    // since API filtering is used in loadMenus, making the 
    // client-side searchFiltered unnecessary for current logic)
    // The totalPages and paginatedMenus should now use the 
    // menus state directly because the API handles the filtering.
    // =====================================================
    
    // Sử dụng menus (đã được lọc từ API) thay vì searchFiltered
    const totalPages = Math.ceil(menus.length / itemsPerPage);

    const paginatedMenus = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return menus.slice(start, start + itemsPerPage);
    }, [menus, currentPage, itemsPerPage]);


    // =====================================================
    // DELETE MENU
    // =====================================================
    const deleteMenu = async (id) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa menu ID: ${id}? Thao tác này không thể hoàn tác.`)) return;

        try {
            await MenuService.delete(id);
            alert("Xóa menu thành công!");
            await loadMenus(); // Tải lại danh sách sau khi xóa
        } catch (error) {
            console.error("Delete error:", error);
            alert("Xóa menu thất bại! Vui lòng kiểm tra console.");
        }
    };
    
    // =====================================================
    // STATUS BADGE
    // =====================================================
    const StatusBadge = ({ status }) => {
        const isActive = status === 1;
        const base =
            "px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center transition-colors duration-150 shadow-sm";

        return isActive ? (
            <span className={`${base} bg-green-100 text-green-800 ring-1 ring-green-500/30`}>
                <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
                Kích hoạt
            </span>
        ) : (
            <span className={`${base} bg-red-100 text-red-800 ring-1 ring-red-500/30`}>
                <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                Tạm ẩn
            </span>
        );
    };

    // =====================================================
    // UI
    // =====================================================
    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl shadow-lg border-b-4 border-blue-600">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Menu className="w-9 h-9 text-blue-600 p-1 bg-blue-50 rounded-lg shadow-inner" /> Quản lý Menu Website
                    <span className="text-lg font-medium text-gray-500 ml-2">
                        ({menus.length} mục)
                    </span>
                </h1>

                <button
                    onClick={() => router.push("/dashboard/admin/menus/add")}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-blue-700 transition-transform duration-200 transform hover:scale-105 mt-4 md:mt-0 font-semibold"
                >
                    <Plus size={18} /> Thêm Menu Mới
                </button>
            </header>

            {/* --- FILTER + SEARCH --- */}
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                placeholder="Tìm kiếm theo tên menu..."
                                className="border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 w-full transition"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            className="border border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 rounded-xl appearance-none bg-white transition"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value={1}>✅ Kích hoạt</option>
                            <option value={0}>❌ Tạm ẩn</option>
                        </select>

                        {/* Refresh Button */}
                        <button
                            onClick={loadMenus}
                            disabled={loading}
                            className={`p-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title="Làm mới danh sách"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-2xl shadow-xl overflow-x-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-extrabold text-blue-700 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-extrabold text-blue-700 uppercase tracking-wider">Tên Menu</th>
                            <th className="px-6 py-4 text-left text-xs font-extrabold text-blue-700 uppercase tracking-wider">Loại</th>
                            <th className="px-6 py-4 text-left text-xs font-extrabold text-blue-700 uppercase tracking-wider">Vị trí</th>
                            <th className="px-6 py-4 text-left text-xs font-extrabold text-blue-700 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-center text-xs font-extrabold text-blue-700 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">

                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 text-blue-600">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                                    <span className="text-lg font-medium">Đang tải dữ liệu menu...</span>
                                </td>
                            </tr>
                        ) : paginatedMenus.length > 0 ? (
                            paginatedMenus.map((menu) => (
                                <tr key={menu.id} className="hover:bg-blue-50 transition duration-150">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{menu.id}</td>
                                    <td className="px-6 py-4 text-base font-semibold text-gray-900">{menu.name}</td>
                                    <td className="px-6 py-4 text-sm capitalize text-gray-700">{menu.type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{menu.position}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={menu.status} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => router.push(`/dashboard/admin/menus/edit?id=${menu.id}`)}
                                                className="p-2.5 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition-colors duration-150 transform hover:scale-105"
                                                title="Chỉnh sửa menu"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteMenu(menu.id)}
                                                className="p-2.5 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors duration-150 transform hover:scale-105"
                                                title="Xóa menu"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-16 text-gray-500 text-xl font-medium">
                                    Không tìm thấy menu nào phù hợp với điều kiện tìm kiếm. 😥
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION --- */}
            {menus.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="text-base font-medium text-gray-700 mb-4 sm:mb-0">
                        Hiển thị
                        <span className="font-extrabold text-blue-600 mx-1">
                            {Math.min((currentPage - 1) * itemsPerPage + 1, menus.length)}
                        </span>
                        -
                        <span className="font-extrabold text-blue-600 mx-1">
                            {Math.min(currentPage * itemsPerPage, menus.length)}
                        </span>
                        /
                        <span className="font-extrabold text-blue-600 mx-1">
                            {menus.length}
                        </span>
                        mục
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition"
                        >
                            <option value={5}>5 / trang</option>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                        </select>

                        <button
                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2.5 rounded-full transition-all duration-200 shadow-md ${
                                currentPage === 1
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="px-4 py-2 font-extrabold bg-blue-600 text-white rounded-xl shadow-lg">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-2.5 rounded-full transition-all duration-200 shadow-md ${
                                currentPage === totalPages || totalPages === 0
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}