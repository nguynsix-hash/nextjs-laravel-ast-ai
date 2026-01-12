"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Trash2, Eye, Edit, Loader2, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"; 
import { useRouter } from "next/navigation";
import OrderService from "../../../../services/OrderService"; 
import toast from "react-hot-toast"; 

// ===========================
// UTILITY FUNCTIONS (Giữ nguyên)
// ===========================

const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "N/A";
    const roundedAmount = Math.round(amount); 
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roundedAmount);
};

const calculateOrderTotal = (details = []) => {
    return details.reduce((sum, item) => {
        const itemAmount = parseFloat(item.amount) || 0;
        const itemDiscount = parseFloat(item.discount) || 0;
        const netAmount = itemAmount - itemDiscount;
        return sum + netAmount;
    }, 0);
};

const getStatusBadge = (status) => {
    const statusInt = parseInt(status, 10); 
    
    switch (statusInt) {
        case 1:
            return { text: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800 border-yellow-300", value: 1 };
        case 2:
            return { text: "Đang xử lý", className: "bg-blue-100 text-blue-800 border-blue-300", value: 2 };
        case 3:
            return { text: "Hoàn thành", className: "bg-green-100 text-green-800 border-green-300", value: 3 };
        case 4:
            return { text: "Hủy", className: "bg-red-100 text-red-800 border-red-300", value: 4 };
        default:
            return { text: "Không rõ", className: "bg-gray-100 text-gray-800 border-gray-300", value: status };
    }
};

// ===========================
// MAIN COMPONENT
// ===========================

export default function OrdersManagement() {
    const router = useRouter();

    // Dữ liệu từ API (Tất cả đơn hàng)
    const [allOrders, setAllOrders] = useState([]); // Chứa TẤT CẢ đơn hàng từ API
    
    // Trạng thái chung
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Trạng thái cho Filtering và Pagination (Frontend)
    const [searchTermInput, setSearchTermInput] = useState(""); 
    const [debouncedSearch, setDebouncedSearch] = useState(""); 
    const [filterStatus, setFilterStatus] = useState("all"); 
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(5); // Fixed items per page
    
    // ⭐ LOGIC DEBOUNCE ⭐
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            setDebouncedSearch(searchTermInput);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTermInput]); 
    
    // ⭐ EFFECT ĐỂ RESET TRANG KHI BỘ LỌC/TÌM KIẾM THAY ĐỔI ⭐
    useEffect(() => {
        // Reset về trang 1 khi giá trị tìm kiếm đã debounce hoặc trạng thái lọc thay đổi
        setCurrentPage(1);
    }, [debouncedSearch, filterStatus]); 

    // ===========================
    // FETCH ALL DATA LOGIC
    // API được gọi chỉ MỘT LẦN để lấy TẤT CẢ đơn hàng
    // ===========================
    const fetchAllOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        // Loại bỏ limit và page để lấy TẤT CẢ dữ liệu (Không tối ưu nếu dữ liệu lớn!)
        const params = {}; 

        try {
            console.log("Fetching ALL orders...");

            // Giả định API trả về TẤT CẢ dữ liệu
            const response = await OrderService.getAll(params);
            
            const apiData = response.data; 
            const rawOrders = apiData?.orders || apiData?.data || apiData || [];
            
            const mappedOrders = Array.isArray(rawOrders) ? rawOrders.map(order => {
                const calculatedTotal = calculateOrderTotal(order.details); 
                const customerInfo = order.shippingInfo || order; 
                
                // Trả về đối tượng order chuẩn hóa, thêm cả trường cho việc tìm kiếm
                return {
                    id: order.orderId || order.id, 
                    status: parseInt(order.orderStatus || order.status, 10), 
                    total: order.totalAmount || calculatedTotal, 
                    
                    customer: customerInfo.name || `User ID: ${order.user_id}`, 
                    date: customerInfo.created_at ? new Date(customerInfo.created_at).toLocaleDateString('vi-VN') : 'N/A',

                    email: customerInfo.email || 'N/A',
                    // Thêm các trường cần thiết để tìm kiếm theo yêu cầu
                    // Giả sử có thêm trường `orderCode` (hoặc dùng `id`) và `shippingAddress`
                    orderCode: order.orderCode || order.orderId || order.id.toString(),
                    shippingAddress: customerInfo.address || 'N/A',
                    
                    details: order.details || [], 
                };
            }) : [];

            setAllOrders(mappedOrders); 

        } catch (err) {
            console.error("Lỗi khi fetch đơn hàng:", err);
            const errorMessage = err.response?.data?.message || "Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra API hoặc thử lại.";
            setError(errorMessage);
            setAllOrders([]);
            toast.error(errorMessage); 
        } finally {
            setLoading(false);
        }
    }, []); 

    // Gọi API khi component mount lần đầu
    useEffect(() => {
        fetchAllOrders();
    }, [fetchAllOrders]);


    // ===========================
    // ⭐ SEARCH, FILTER & PAGINATION LOGIC (FRONTEND) ⭐
    // ===========================
    
    // 1. Lọc và Tìm kiếm
    const filteredOrders = useMemo(() => {
        let currentOrders = allOrders;
        const searchQuery = debouncedSearch.toLowerCase().trim();

        // Lọc theo Trạng thái
        if (filterStatus !== "all") {
            const statusValue = parseInt(filterStatus, 10);
            currentOrders = currentOrders.filter(order => order.status === statusValue);
        }

        // Tìm kiếm theo nhiều trường (theo yêu cầu của bạn)
        if (searchQuery) {
            currentOrders = currentOrders.filter(order => {
                // Tên khách hàng, Email, ID đơn hàng, Địa chỉ giao hàng
                const fieldsToSearch = [
                    order.customer, 
                    order.email, 
                    order.orderCode,
                    order.shippingAddress 
                ];
                
                // Logic tìm kiếm giống như bạn mô tả (kiểm tra xem có khớp ít nhất 1 trường không)
                const matchesSearch = fieldsToSearch.some(field =>
                    field && field.toLowerCase().includes(searchQuery)
                );
                
                return matchesSearch;
            });
        }
        
        return currentOrders;
    }, [allOrders, debouncedSearch, filterStatus]); 

    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / limit);

    // 2. Phân trang
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return filteredOrders.slice(startIndex, endIndex);
    }, [filteredOrders, currentPage, limit]);


    // ===========================
    // HANDLE CHANGE FUNCTIONS (Giữ nguyên)
    // ===========================

    const handleSearchChange = (e) => {
        setSearchTermInput(e.target.value);
    };

    const handleFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    // ===========================
    // DELETE ORDER LOGIC (Thay đổi để cập nhật lại state allOrders)
    // ===========================
    const deleteOrder = useCallback(async (id) => {
        if (window.confirm("Xác nhận XÓA đơn hàng ID: " + id + "?")) {
            setLoading(true);
            try {
                await OrderService.delete(id);
                toast.success(`Đơn hàng #${id} đã được xóa.`); 
                
                // Cập nhật lại state allOrders
                setAllOrders(prev => prev.filter(order => order.id !== id));

                // Sau khi xóa, nếu trang hiện tại trở nên không hợp lệ, chuyển về trang cuối cùng
                // Lấy tổng số đơn hàng sau khi filter & xóa, sau đó tính lại tổng trang
                const currentFilteredOrders = allOrders.filter(order => order.id !== id);
                const newTotal = currentFilteredOrders.length; 
                const newTotalPages = Math.ceil(newTotal / limit);
                
                if (currentPage > newTotalPages && currentPage > 1) {
                    setCurrentPage(newTotalPages > 0 ? newTotalPages : 1); 
                }
                // KHÔNG cần gọi fetchAllOrders() vì đã cập nhật state allOrders

            } catch (err) {
                console.error("Lỗi khi xóa đơn hàng:", err);
                const errorMessage = err.response?.data?.message || `Lỗi khi xóa đơn hàng #${id}.`;
                toast.error(errorMessage); 
            } finally {
                setLoading(false);
            }
        }
    }, [allOrders, limit, currentPage]); 

    // ===========================
    // PHẦN HIỂN THỊ PHÂN TRANG (Giữ nguyên)
    // ===========================
    const renderPagination = () => {
        // ⭐ CHỈ KHÔNG HIỂN THỊ KHI KHÔNG CÓ KẾT QUẢ NÀO SAU KHI LỌC/TÌM KIẾM ⭐
        if (totalOrders === 0 && !loading) return null;

        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return (
            <div className="flex justify-center items-center mt-6 gap-2 flex-wrap p-4 bg-white rounded-lg shadow-inner border border-gray-200">
                <span className="text-sm text-gray-700 font-semibold mr-2 whitespace-nowrap">
                    Tổng: {totalOrders} đơn | Trang {currentPage} / {totalPages}
                </span>
                
                {/* Previous Button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className={`p-2 text-sm font-medium rounded-lg transition duration-150 flex items-center ${
                        currentPage === 1 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm"
                    }`}
                >
                    <ChevronLeft size={16} /> Trước
                </button>
                
                {/* Page Numbers */}
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={currentPage === page || loading}
                        className={`hidden sm:inline-block px-4 py-2 text-sm font-semibold rounded-lg transition duration-150 ${
                            currentPage === page 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50" 
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm"
                        }`}
                    >
                        {page}
                    </button>
                ))}
                
                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className={`p-2 text-sm font-medium rounded-lg transition duration-150 flex items-center ${
                        currentPage === totalPages 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm"
                    }`}
                >
                    Sau <ChevronRight size={16} />
                </button>
            </div>
        );
    }


    // ===========================
    // PAGE RENDER
    // ===========================
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-indigo-600" /> Quản lý Đơn hàng
                </h1>
                <p className="text-sm text-gray-500 mt-2 border-l-4 border-indigo-500 pl-3">
                    Xem, chỉnh sửa và quản lý các đơn hàng của khách hàng.
                </p>
            </header>
            
            <hr className="my-6" />

            {/* FILTER + SEARCH + CONTROL */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                
                {/* Search Input */}
                <div className="relative w-full sm:w-2/5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        placeholder="Tìm kiếm: Khách hàng, Email, ID đơn hàng, Địa chỉ..."
                        className="border border-gray-300 rounded-xl pl-12 pr-4 py-3 w-full text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-inner"
                        value={searchTermInput} 
                        onChange={handleSearchChange}
                        disabled={loading}
                    />
                    {/* Hiển thị Loading/Debouncing */}
                    {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-spin" />}
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-auto flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Lọc theo Trạng thái:</label>
                    <select
                        id="status-filter"
                        className="border border-gray-300 px-4 py-3 rounded-xl w-full sm:w-48 bg-white text-gray-700 hover:border-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 appearance-none pr-8 shadow-inner"
                        value={filterStatus}
                        onChange={handleFilterStatusChange}
                        disabled={loading}
                    >
                        <option value="all">Tất cả</option>
                        <option value="1">Chờ xử lý</option>
                        <option value="2">Đang xử lý</option>
                        <option value="3">Hoàn thành</option>
                        <option value="4">Hủy</option>
                    </select>
                </div>
            </div>

            {/* LOADING & ERROR STATES */}
            {loading && allOrders.length === 0 && (
                <div className="flex justify-center items-center py-20 text-indigo-600 bg-white rounded-xl shadow-lg">
                    <Loader2 className="animate-spin w-10 h-10 mr-3" />
                    <span className="text-xl font-semibold">Đang tải toàn bộ dữ liệu đơn hàng...</span>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative mb-6 shadow-md" role="alert">
                    <strong className="font-bold">Lỗi tải dữ liệu!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}
            
            {/* TABLE ĐƠN HÀNG */}
            {!loading && !error && (
                <>
                    <div className="bg-white shadow-2xl rounded-xl overflow-x-auto border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-indigo-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-extrabold text-white uppercase tracking-wider w-16">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-extrabold text-white uppercase tracking-wider w-64">Khách hàng</th>
                                    <th className="px-6 py-4 text-left text-sm font-extrabold text-white uppercase tracking-wider w-64">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-extrabold text-white uppercase tracking-wider w-32">Tổng tiền</th>
                                    <th className="px-6 py-4 text-left text-sm font-extrabold text-white uppercase tracking-wider w-32">Ngày đặt</th>
                                    <th className="px-6 py-4 text-left text-sm font-extrabold text-white uppercase tracking-wider w-28">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-sm font-extrabold text-white uppercase tracking-wider w-40">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedOrders.length > 0 ? (
                                    paginatedOrders.map((order) => {
                                        const statusInfo = getStatusBadge(order.status);
                                        return (
                                            <tr key={order.id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    #{order.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                    {order.customer}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs" title={order.email}>
                                                    {order.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-indigo-700">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {order.date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span 
                                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${statusInfo.className}`}
                                                    >
                                                        {statusInfo.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        {/* Detail Button - Đã sửa để dùng Query String */}
                                                        <button
                                                            title="Chi tiết"
                                                            className="p-2 text-blue-600 rounded-full hover:bg-blue-100 transition duration-150"
                                                            onClick={() => router.push(`/dashboard/admin/orders/show?id=${order.id}`)}
                                                            disabled={loading}
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        
                                                        {/* Edit Button - Đã sửa để dùng Query String */}
                                                        <button
                                                            title="Chỉnh sửa"
                                                            className="p-2 text-green-600 rounded-full hover:bg-green-100 transition duration-150"
                                                            onClick={() => router.push(`/dashboard/admin/orders/edit?id=${order.id}`)}
                                                            disabled={loading}
                                                        >
                                                            <Edit size={18} />
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            title="Xóa đơn hàng"
                                                            className="p-2 text-red-600 rounded-full hover:bg-red-100 transition duration-150"
                                                            onClick={() => deleteOrder(order.id)}
                                                            disabled={loading}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-lg bg-gray-50 font-medium">
                                            Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {renderPagination()}
                </>
            )}
        </div>
    );
}