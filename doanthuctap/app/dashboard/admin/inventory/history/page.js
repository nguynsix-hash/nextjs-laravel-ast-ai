"use client";
import React, { useState, useEffect } from "react";
import { History, ArrowLeft, Search, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import InventoryLogService from "@/services/InventoryLogService";

export default function InventoryHistory() {
    const router = useRouter();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await InventoryLogService.getAll({
                page: page,
                per_page: 10
            });
            // API returns { success: true, data: { data: [...], current_page: ... } }
            // or maybe just { data: [...] } depending on my controller pagination
            // Let's check controller: $data = $query->paginate($perPage); 
            // return ... 'data' => $data
            // So res.data is the paginated object

            setLogs(res.data.data || []);
            setTotalPages(res.data.last_page || 1);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <History className="text-blue-600" />
                        Lịch sử Nhập Kho
                    </h1>
                    <button
                        onClick={() => router.push('/dashboard/admin/inventory')}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition font-medium"
                    >
                        <ArrowLeft size={18} /> Quay lại Kho
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Thời gian</th>
                                    <th className="py-3 px-6 text-left">Sản phẩm</th>
                                    <th className="py-3 px-6 text-center">Số lượng nhập</th>
                                    <th className="py-3 px-6 text-right">Giá nhập gốc</th>
                                    <th className="py-3 px-6 text-center">Người nhập</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="py-3 px-4 text-left">
                                                <div className="flex items-center">
                                                    {log.product?.thumbnail && (
                                                        <img
                                                            src={`http://localhost:8000/storage/${log.product.thumbnail}`}
                                                            alt={log.product?.name}
                                                            className="w-10 h-10 rounded mr-3 object-cover border"
                                                        />
                                                    )}
                                                    <div>
                                                        <span className="font-semibold block text-gray-800">
                                                            {log.product?.name || `Sản phẩm #${log.product_id}`}
                                                        </span>
                                                        <span className="text-xs text-gray-500">ID: {log.product?.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full font-bold text-xs">
                                                    +{log.qty}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-right font-medium">
                                                {formatCurrency(log.price_root)}
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                Admin #{log.created_by}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-400 italic">
                                            Chưa có lịch sử nhập kho nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Simple */}
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className={`px-4 py-2 border rounded ${page <= 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'}`}
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded font-bold border border-blue-100">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className={`px-4 py-2 border rounded ${page >= totalPages ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'}`}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}
