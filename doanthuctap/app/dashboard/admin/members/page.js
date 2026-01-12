"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, Plus, Edit, Search, Users, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import UserService from "@/services/UserService"; // Import UserService

// Component hiển thị trạng thái (status: 1/0 từ DB)
const StatusBadge = ({ status }) => {
    const baseClass = "px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ring-1";
    // Giả định 1 = active/hoạt động, 0 = inactive/khóa
    const isActive = status === 1; 

    return isActive ? (
        <span className={`${baseClass} bg-green-50 text-green-700 ring-green-600/20`}>
            Hoạt động
        </span>
    ) : (
        <span className={`${baseClass} bg-red-50 text-red-700 ring-red-600/20`}>
            Khóa
        </span>
    );
};

// Component hiển thị vai trò (role: chuỗi 'admin', 'customer' từ DB)
const RoleBadge = ({ role }) => {
    const baseClass = "px-3 py-1 text-xs font-medium rounded-full inline-block";
    let colorClass;
    let displayName = role || 'N/A';

    switch (role.toLowerCase()) {
        case 'admin':
            colorClass = 'bg-indigo-100 text-indigo-800';
            displayName = 'Quản trị viên';
            break;
        case 'customer':
            colorClass = 'bg-blue-100 text-blue-800';
            displayName = 'Khách hàng';
            break;
        default:
            colorClass = 'bg-gray-100 text-gray-800';
    }
    return (
        <span className={`${baseClass} ${colorClass}`}>
            {displayName}
        </span>
    );
};

export default function MembersManagement() {
    const router = useRouter();

    // ===============================
    // STATE
    // ===============================
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', '1', '0'
    
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10); 

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // ===============================
    // LOAD DATA FROM API
    // ===============================
    const loadUsers = useCallback(async () => {
        setLoading(true);

        try {
            const params = {
                page: currentPage,
                per_page: limit,
                // Tìm kiếm theo name, email, hoặc phone (giả định API Controller xử lý)
                search: search || undefined, 
                // Lọc theo status (chuyển về số 1 hoặc 0 nếu không phải 'all')
                status: filterStatus !== "all" ? Number(filterStatus) : undefined,
                // Giả định API controller hỗ trợ sort theo created_at
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            const res = await UserService.getAll(params); // API trả về { success, data: { data: [], total, last_page, ... } }
            
            const data = res.data;
            setUsers(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.last_page || 1);

        } catch (error) {
            console.error("Load users error:", error);
        }

        setLoading(false);
    }, [currentPage, limit, search, filterStatus]);

    // Gọi API mỗi khi filter / search / phân trang thay đổi
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Đặt lại trang về 1 khi thay đổi search/filter/limit
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus, limit]);

    // ===============================
    // DELETE USER
    // ===============================
    const deleteUser = async (id, name) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" (ID: ${id})?`)) return;

        try {
            await UserService.remove(id); 
            alert(`Xóa thành viên ID: ${id} thành công!`);
            loadUsers(); // Reload danh sách
        } catch (error) {
            console.error("Delete user error:", error);
            alert("Lỗi khi xóa thành viên. Vui lòng kiểm tra console.");
        }
    };
    
    // Chuyển trang
    const goToPage = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" /> Quản lý Thành viên
                    <span className="text-lg font-semibold text-gray-500">
                        (Tổng {total} mục)
                    </span>
                </h1>
                
                {/* Add Button */}
                <button
                    onClick={() => router.push("/dashboard/admin/members/add")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-md hover:bg-blue-700 transition duration-200"
                >
                    <Plus size={18} /> Thêm Thành viên
                </button>
            </header>

            {/* SEARCH + FILTER SECTION */}
            <div className="bg-white p-5 rounded-xl shadow-lg mb-8 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-start">
                    
                    {/* Search Input */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm Tên, Email, SĐT..."
                            className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 w-full transition duration-150"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Status */}
                    <select
                        className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-xl w-full sm:w-36 transition duration-150 bg-white appearance-none pr-8"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả TT</option>
                        <option value="1">Hoạt động</option>
                        <option value="0">Khóa</option>
                    </select>

                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-xl overflow-x-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Thông tin Cơ bản</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-32">Vai trò</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-32">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-32">Ngày tạo</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-32">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-blue-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Đang tải dữ liệu thành viên...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition duration-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="font-semibold text-gray-800">{user.name}</div>
                                        <div className="text-gray-500 text-xs">{user.email} | SĐT: {user.phone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <RoleBadge role={user.roles} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <StatusBadge status={user.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center items-center gap-2">
                                            {/* Edit Button */}
                                            <button
                                                className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-150 shadow-sm"
                                                title="Chỉnh sửa"
                                                onClick={() => router.push(`/dashboard/admin/members/edit?id=${user.id}`)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {/* Delete Button */}
                                            <button
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 shadow-sm"
                                                title="Xóa"
                                                onClick={() => deleteUser(user.id, user.name)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500 text-lg">
                                    Không tìm thấy thành viên nào. 😥
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {total > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-5 bg-white rounded-xl shadow-lg border border-gray-200">
                    
                    {/* Info */}
                    <p className="text-sm font-medium text-gray-700 mb-4 sm:mb-0">
                        Hiển thị 
                        <span className="font-semibold text-blue-600 mx-1">
                            {Math.min(currentPage * limit - limit + 1, total)}
                        </span>
                        -
                        <span className="font-semibold text-blue-600 mx-1">
                            {Math.min(currentPage * limit, total)}
                        </span>
                        / 
                        <span className="font-semibold text-blue-600 mx-1">
                            {total}
                        </span>
                        mục
                    </p>

                    {/* Controls */}
                    <div className="flex items-center gap-4">

                        {/* Limit */}
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={5}>5 / trang</option>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                        </select>

                        {/* Prev */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-full transition duration-150 ${
                                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                            }`}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Page Number */}
                        <span className="px-4 py-1.5 font-bold bg-blue-500 text-white rounded-lg shadow-inner">
                            {currentPage} / {totalPages}
                        </span>

                        {/* Next */}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-full transition duration-150 ${
                                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
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