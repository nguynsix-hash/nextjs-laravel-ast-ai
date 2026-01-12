"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Search, Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductStoreService from "@/services/ProductStoreService";

export default function WarehouseImport() {
    const router = useRouter();

    // ===========================
    // STATE
    // ===========================
    const [importsPaginate, setImportsPaginate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(5);

    const imports = importsPaginate?.data || [];
    const total = importsPaginate?.total || 0;
    const totalPages = importsPaginate?.last_page || 1;
    const apiCurrentPage = importsPaginate?.current_page || 1;

    // ===========================
    // FORMAT TIỀN
    // ===========================
    const formatPrice = (value) => {
        if (!value) return "0 ₫";
        return parseFloat(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    // ===========================
    // FETCH DATA FROM API
    // ===========================
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                page: currentPage,
                per_page: perPage,
            };
            if (searchQuery) params.search = searchQuery;
            if (filterStatus !== "all") params.status = filterStatus;

            const res = await ProductStoreService.getAll(params);

            if (!res?.data) throw new Error("Response data missing");

            setImportsPaginate(res.data);

            if (res.data.data.length === 0 && res.data.current_page > 1) {
                setCurrentPage(res.data.current_page - 1);
            }
        } catch (err) {
            console.error("Fetch imports error:", err);
            setError(err?.message || "Lỗi khi tải dữ liệu phiếu nhập từ API.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, searchQuery, filterStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ===========================
    // DELETE IMPORT
    // ===========================
    const deleteImport = async (id) => {
        if (!confirm(`Xác nhận xóa phiếu nhập ID: ${id}? Hành động này không thể hoàn tác.`)) return;

        try {
            setLoading(true);
            await ProductStoreService.delete(id);
            alert(`Đã xóa phiếu nhập ID: ${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err?.message || "Xóa thất bại. Vui lòng kiểm tra quyền.");
        } finally {
            setLoading(false);
        }
    };

    // ===========================
    // STATUS BADGE
    // ===========================
    const StatusBadge = ({ status }) => {
        if (status === "done") {
            return (
                <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-extrabold px-2.5 py-1 rounded-full border border-green-200">
                    ✅ HOÀN THÀNH
                </span>
            );
        }
        return (
            <span className="inline-flex items-center bg-orange-100 text-orange-800 text-xs font-extrabold px-2.5 py-1 rounded-full border border-orange-200">
                ⏳ CHỜ XỬ LÝ
            </span>
        );
    };

    // ===========================
    // RENDER
    // ===========================
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">📦 Quản Lý Phiếu Nhập Kho</h1>

            {/* FILTER + SEARCH + ADD */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            placeholder="Tìm kiếm theo Tên Sản phẩm..."
                            className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-72 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        className="border border-gray-300 px-4 py-2 rounded-lg text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white appearance-none pr-8"
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all" className="font-semibold">-- Tất cả Trạng thái --</option>
                        <option value="0">Hoàn thành</option>
                        <option value="1">Chờ xử lý</option>
                    </select>
                </div>

                {/* Add Button */}
                <button
                    onClick={() => router.push("/dashboard/admin/inventory/add")}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> TẠO PHIẾU NHẬP
                </button>
            </div>

            {/* LOADING & ERROR */}
            {loading && (
                <div className="flex items-center justify-center p-10 bg-white rounded-xl shadow-lg">
                    <Loader2 className="animate-spin w-6 h-6 mr-3 text-indigo-600" />
                    <span className="text-xl font-bold text-indigo-600">Đang tải dữ liệu...</span>
                </div>
            )}

            {!loading && error && (
                <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl shadow-md font-medium">
                    Lỗi: {error}
                </div>
            )}

            {/* TABLE PHIẾU NHẬP */}
            {!loading && !error && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-extrabold text-indigo-800 uppercase tracking-wider">ID</th>
                                    <th className="px-5 py-3 text-left text-xs font-extrabold text-indigo-800 uppercase tracking-wider">Sản phẩm</th>
                                    <th className="px-5 py-3 text-left text-xs font-extrabold text-indigo-800 uppercase tracking-wider">Giá gốc</th>
                                    <th className="px-5 py-3 text-left text-xs font-extrabold text-indigo-800 uppercase tracking-wider">Số lượng</th>
                                    <th className="px-5 py-3 text-left text-xs font-extrabold text-indigo-800 uppercase tracking-wider">Ngày nhập</th>
                                    <th className="px-5 py-3 text-left text-xs font-extrabold text-indigo-800 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-5 py-3 text-center text-xs font-extrabold text-indigo-800 uppercase tracking-wider w-36">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {imports.length > 0 ? (
                                    imports.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {(apiCurrentPage - 1) * perPage + idx + 1}
                                            </td>
                                            <td className="px-5 py-3 text-sm font-semibold text-gray-800">{item.product?.name || "N/A"}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-800 font-bold">
                                                {formatPrice(item.price_root)}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 font-extrabold">{item.qty || 0}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">{item.created_at?.split(" ")[0] || "N/A"}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm">
                                                <StatusBadge status={item.status || "done"} />
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-sm transition-colors"
                                                        onClick={() => router.push(`/dashboard/admin/inventory/edit/${item.id}`)}
                                                        title={`Chỉnh sửa phiếu ${item.id}`}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors"
                                                        onClick={() => deleteImport(item.id)}
                                                        title={`Xóa phiếu ${item.id}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-6 text-center text-gray-500 italic font-medium">
                                            Không tìm thấy phiếu nhập nào phù hợp với điều kiện lọc/tìm kiếm.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                            <span className="text-sm text-gray-600 font-semibold">
                                Hiển thị {(apiCurrentPage - 1) * perPage + 1} đến {Math.min(apiCurrentPage * perPage, total)} trên tổng số {total} phiếu nhập.
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={apiCurrentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    «
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={apiCurrentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Trang trước
                                </button>
                                <span className="px-3 py-1 text-sm font-bold bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
                                    {apiCurrentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={apiCurrentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Trang sau
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={apiCurrentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
