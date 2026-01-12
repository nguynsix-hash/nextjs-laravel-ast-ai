"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, Search, Mail, ChevronLeft, ChevronRight, MessageSquare, Loader2, Eye } from "lucide-react";
import ContactService from "@/services/ContactService"; // Import ContactService

// Component hiển thị trạng thái (status: 1/0 từ DB)
const StatusBadge = ({ status }) => {
    const baseClass = "px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ring-1";
    // Giả định: status = 1 (active/đã xử lý/đã trả lời), status = 0 (inactive/chưa xử lý/chưa trả lời)
    const isReplied = status === 1; 

    return isReplied ? (
        <span className={`${baseClass} bg-green-50 text-green-700 ring-green-600/20`}>
            Đã xử lý
        </span>
    ) : (
        <span className={`${baseClass} bg-red-50 text-red-700 ring-red-600/20`}>
            Chưa xử lý
        </span>
    );
};

export default function ContactsManagement() {
    // ===============================
    // STATE
    // ===============================
    const [contacts, setContacts] = useState([]);
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
    const loadContacts = useCallback(async () => {
        setLoading(true);

        try {
            const params = {
                page: currentPage,
                per_page: limit,
                // Tìm kiếm theo name, email, hoặc content (giả định API Controller xử lý)
                search: search || undefined, 
                // Lọc theo status (chuyển về số 1 hoặc 0 nếu không phải 'all')
                status: filterStatus !== "all" ? Number(filterStatus) : undefined,
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            const res = await ContactService.getAll(params); // API trả về { success, data: { data: [], total, last_page, ... } }
            
            const data = res.data;
            setContacts(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.last_page || 1);

        } catch (error) {
            console.error("Load contacts error:", error);
        }

        setLoading(false);
    }, [currentPage, limit, search, filterStatus]);

    // Gọi API mỗi khi filter / search / phân trang thay đổi
    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    // Đặt lại trang về 1 khi thay đổi search/filter/limit
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus, limit]);

    // ===============================
    // HÀNH ĐỘNG
    // ===============================

    // XÓA liên hệ
    const deleteContact = async (id, name) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa tin nhắn của "${name}" (ID: ${id})?`)) return;

        try {
            await ContactService.delete(id); 
            alert(`Xóa liên hệ ID: ${id} thành công!`);
            loadContacts(); // Reload danh sách
        } catch (error) {
            console.error("Delete contact error:", error);
            alert("Lỗi khi xóa liên hệ. Vui lòng kiểm tra console.");
        }
    };

    // TRẢ LỜI/ĐÁNH DẤU ĐÃ XỬ LÝ (Sử dụng update status = 1)
    const handleReply = async (contact) => {
        if (contact.status === 1) {
            alert("Tin nhắn này đã được đánh dấu là đã xử lý.");
            return;
        }

        const replyMessage = prompt(`Nhập nội dung trả lời cho ${contact.email} (SĐT: ${contact.phone}):\n\n[Nội dung gốc: ${contact.content.substring(0, 50)}...]`, "");
        
        if (replyMessage !== null) {
            try {
                // Giả định: Đánh dấu status = 1 (Đã xử lý) sau khi admin nhập nội dung trả lời (hoặc gửi email qua một dịch vụ khác)
                await ContactService.update(contact.id, { 
                    status: 1, 
                    reply_id: contact.user_id || 1, // Giả định id của admin là 1 hoặc dùng user_id của admin đang đăng nhập
                    // Trong thực tế, bạn sẽ gửi email trả lời ở đây
                });
                alert(`Đã đánh dấu liên hệ ID: ${contact.id} là Đã xử lý.`);
                loadContacts(); 
            } catch (error) {
                console.error("Update contact status error:", error);
                alert("Lỗi khi cập nhật trạng thái liên hệ.");
            }
        }
    };
    
    // Xem chi tiết
    const viewDetails = (contact) => {
        alert(
            `CHI TIẾT LIÊN HỆ ID: ${contact.id}\n\n` +
            `Tên: ${contact.name}\n` +
            `Email: ${contact.email}\n` +
            `Điện thoại: ${contact.phone || 'N/A'}\n` +
            `Ngày gửi: ${new Date(contact.created_at).toLocaleDateString('vi-VN')} \n\n` +
            `Nội dung:\n${contact.content}`
        );
    };

    // Chuyển trang
    const goToPage = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-2 flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-blue-600" /> Quản lý Tin nhắn Liên hệ 📧
                </h1>
            </header>

            {/* SEARCH & FILTER SECTION */}
            <div className="bg-white p-5 rounded-xl shadow-lg mb-8 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-start">
                    
                    {/* Search Input */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm Tên, Email, Nội dung..."
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
                        <option value="0">Chưa xử lý</option>
                        <option value="1">Đã xử lý</option>
                    </select>

                    {/* Total Info */}
                    <span className="text-gray-600 font-medium">
                         Tổng: <span className="text-blue-600 font-bold">{total}</span> liên hệ
                    </span>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-xl overflow-x-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nội dung (Tóm tắt)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-24">Ngày gửi</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-36">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-36">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-blue-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Đang tải dữ liệu liên hệ...
                                </td>
                            </tr>
                        ) : contacts.length > 0 ? (
                            contacts.map(contact => (
                                <tr key={contact.id} className="hover:bg-gray-50 transition duration-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{contact.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="font-semibold text-gray-800">{contact.name}</div>
                                        <div className="text-gray-500 text-xs italic">{contact.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                                        <MessageSquare size={14} className="inline-block mr-1 text-blue-500" />
                                        {contact.content.substring(0, 70)}{contact.content.length > 70 ? '...' : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(contact.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <StatusBadge status={contact.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center items-center gap-2">
                                            {/* View Details Button */}
                                            <button
                                                className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-150 shadow-sm"
                                                title="Xem chi tiết"
                                                onClick={() => viewDetails(contact)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            
                                            {/* Reply Button */}
                                            <button
                                                className={`p-2 rounded-lg transition shadow-sm ${contact.status === 1 ? 'bg-green-100 text-green-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                title={contact.status === 1 ? "Đã xử lý" : "Đánh dấu Đã xử lý"}
                                                onClick={() => handleReply(contact)}
                                                disabled={contact.status === 1}
                                            >
                                                <Mail size={16} />
                                            </button>
                                            
                                            {/* Delete Button */}
                                            <button
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 shadow-sm"
                                                title="Xóa"
                                                onClick={() => deleteContact(contact.id, contact.name)}
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
                                    Không tìm thấy tin nhắn liên hệ nào. 😥
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