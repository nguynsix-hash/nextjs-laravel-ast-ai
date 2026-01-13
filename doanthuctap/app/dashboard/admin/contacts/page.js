"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Trash2, Search, Mail, ChevronLeft, ChevronRight, MessageSquare, Loader2, Eye, X, Send } from "lucide-react";
import ContactService from "@/services/ContactService";

// Component hiển thị trạng thái
const StatusBadge = ({ status }) => {
    const baseClass = "px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ring-1";
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

// Modal Trả lời
const ReplyModal = ({ isOpen, onClose, contact, onSend }) => {
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen) setReplyText("");
    }, [isOpen]);

    if (!isOpen || !contact) return null;

    const handleSend = async () => {
        if (!replyText.trim()) return alert("Vui lòng nhập nội dung trả lời.");

        setSending(true);
        await onSend(contact, replyText);
        setSending(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="text-blue-600" size={20} />
                        Trả lời khách hàng
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                    {/* Customer Info */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm space-y-1">
                        <div className="flex gap-2">
                            <span className="font-semibold text-gray-700 min-w-[80px]">Gửi tới:</span>
                            <span className="text-gray-900 font-medium">{contact.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-semibold text-gray-700 min-w-[80px]">Email:</span>
                            <span className="text-blue-600 underline">{contact.email}</span>
                        </div>
                    </div>

                    {/* Original Message (Read-only) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Tin nhắn gốc
                        </label>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-600 text-sm max-h-32 overflow-y-auto italic">
                            "{contact.content}"
                        </div>
                    </div>

                    {/* Reply Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Nội dung trả lời
                        </label>
                        <textarea
                            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[120px]"
                            placeholder="Nhập nội dung phản hồi của bạn..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                        ></textarea>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={sending}
                        className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        {sending ? "Đang gửi..." : "Gửi phản hồi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ContactsManagement() {
    // ===============================
    // STATE
    // ===============================
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ===============================
    // LOAD DATA
    // ===============================
    const loadContacts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: limit,
                search: search || undefined,
                status: filterStatus !== "all" ? Number(filterStatus) : undefined,
                sort_by: 'created_at',
                sort_order: 'desc'
            };
            const res = await ContactService.getAll(params);
            const data = res.data;
            setContacts(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.last_page || 1);
        } catch (error) {
            console.error("Load contacts error:", error);
        }
        setLoading(false);
    }, [currentPage, limit, search, filterStatus]);

    useEffect(() => { loadContacts(); }, [loadContacts]);
    useEffect(() => { setCurrentPage(1); }, [search, filterStatus, limit]);

    // ===============================
    // ACTIONS
    // ===============================
    const deleteContact = async (id, name) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa tin nhắn của "${name}"?`)) return;
        try {
            await ContactService.delete(id);
            alert(`Xóa thành công!`);
            loadContacts();
        } catch (error) {
            alert("Lỗi khi xóa liên hệ.");
        }
    };

    // Open Modal
    const handleReplyClick = (contact) => {
        if (contact.status === 1) {
            // Optional: Allow re-replying or viewing history? For now blocks like before.
            if (!confirm("Tin nhắn này đã xử lý. Bạn có muốn gửi thêm phản hồi không?")) return;
        }
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    // Handle Submit from Modal
    const submitReply = async (contact, replyText) => {
        try {
            // Append reply to content to save history
            const updatedContent = `${contact.content}\n\n----------------\n[Ngày ${new Date().toLocaleDateString('vi-VN')} - Admin đã trả lời]:\n${replyText}`;

            await ContactService.update(contact.id, {
                status: 1,
                content: updatedContent, // Update content with history
                reply_id: contact.user_id || 1,
            });

            alert(`Đã gửi phản hồi thành công!`);
            setIsModalOpen(false);
            loadContacts();
        } catch (error) {
            console.error("Reply error:", error);
            alert("Lỗi khi gửi phản hồi: " + (error.response?.data?.message || error.message));
        }
    };

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

    const goToPage = (page) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-2 flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-blue-600" /> Quản lý Tin nhắn Liên hệ 📧
                </h1>
            </header>

            {/* CONTROLS */}
            <div className="bg-white p-5 rounded-xl shadow-lg mb-8 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm..."
                            className="border border-gray-300 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 w-full transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border border-gray-300 focus:border-blue-500 px-3 py-2 rounded-xl w-full sm:w-36 bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả TT</option>
                        <option value="0">Chưa xử lý</option>
                        <option value="1">Đã xử lý</option>
                    </select>
                    <span className="text-gray-600 font-medium flex items-center">
                        Tổng: <span className="text-blue-600 font-bold ml-1">{total}</span>
                    </span>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-xl overflow-x-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nội dung</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase w-32">Ngày gửi</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase w-32">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase w-40">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10 text-blue-500"><Loader2 className="animate-spin mx-auto" />Đang tải...</td></tr>
                        ) : contacts.map(contact => (
                            <tr key={contact.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm font-semibold">{contact.id}</td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="font-bold text-gray-800">{contact.name}</div>
                                    <div className="text-gray-500 text-xs">{contact.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={contact.content}>
                                    {contact.content}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(contact.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-sm"><StatusBadge status={contact.status} /></td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => viewDetails(contact)} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm" title="Xem chi tiết">
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleReplyClick(contact)}
                                            className={`p-2 rounded-lg shadow-sm ${contact.status === 1 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                            title="Trả lời"
                                        >
                                            <Mail size={16} />
                                        </button>
                                        <button onClick={() => deleteContact(contact.id, contact.name)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm" title="Xóa">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {total > 0 && (
                <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow border border-gray-200">
                    <div className="text-sm text-gray-600">Trang {currentPage} / {totalPages}</div>
                    <div className="flex gap-2">
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-gray-100 rounded-lg disabled:opacity-50"><ChevronLeft size={18} /></button>
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-gray-100 rounded-lg disabled:opacity-50"><ChevronRight size={18} /></button>
                    </div>
                </div>
            )}

            {/* REPLY MODAL */}
            <ReplyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contact={selectedContact}
                onSend={submitReply}
            />
        </div>
    );
}