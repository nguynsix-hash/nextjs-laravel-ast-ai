"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Trash2, Plus, Edit, Search, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BannerService from "@/services/BannerService";

// Badge hiển thị trạng thái
const StatusBadge = ({ status }) => {
    const base = "px-3 py-1 text-xs font-black rounded-full inline-flex items-center gap-1 uppercase tracking-tighter";
    return status === 1 ? (
        <span className={`${base} bg-green-100 text-green-700 border border-green-200`}>Hiển thị</span>
    ) : (
        <span className={`${base} bg-red-100 text-red-700 border border-red-200`}>Đang Ẩn</span>
    );
};

export default function BannersManagement() {
    const router = useRouter();

    // State quản lý dữ liệu
    const [banners, setBanners] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPosition, setFilterPosition] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách các vị trí banner duy nhất để filter
    const uniquePositions = useMemo(() => {
        const positions = banners.map(b => b.position).filter(Boolean);
        return [...new Set(positions)].sort();
    }, [banners]);

    // Hàm gọi API lấy dữ liệu
    const loadBanners = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: limit,
                search: search || undefined,
                status: filterStatus !== "all" ? Number(filterStatus) : undefined,
                position: filterPosition !== "all" ? filterPosition : undefined,
            };

            const res = await BannerService.index(params);
            if (res.data) {
                setBanners(res.data.data || []);
                setTotal(res.data.total || 0);
                setTotalPages(res.data.last_page || 1);
            }
        } catch (error) {
            console.error("Lỗi tải Banner:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, search, filterStatus, filterPosition]);

    useEffect(() => {
        loadBanners();
    }, [loadBanners]);

    // Xử lý xóa
    const deleteBanner = async (id) => {
        if (!confirm(`Bạn có chắc muốn xóa banner ID: ${id}?`)) return;
        try {
            await BannerService.destroy(id);
            alert("Xóa thành công!");
            loadBanners();
        } catch (error) {
            alert("Lỗi khi xóa banner!");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tight">
                        <ImageIcon className="w-10 h-10 text-blue-600" /> Quản lý Banner
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Hệ thống có tổng cộng {total} banner</p>
                </div>
                
                <button
                    onClick={() => router.push("/dashboard/admin/banners/add")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
                >
                    <Plus size={20} /> THÊM BANNER MỚI
                </button>
            </header>

            {/* BỘ LỌC TÌM KIẾM */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Tìm kiếm banner..."
                            className="w-full border border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-600"
                        value={filterPosition}
                        onChange={(e) => setFilterPosition(e.target.value)}
                    >
                        <option value="all">Tất cả vị trí</option>
                        <option value="slideshow">Slideshow</option>
                        <option value="ads">Quảng cáo</option>
                        {uniquePositions.map(pos => (
                            pos !== 'slideshow' && pos !== 'ads' && <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                    <select
                        className="border border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-600"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="1">Đang hiển thị</option>
                        <option value="0">Đang ẩn</option>
                    </select>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Banner</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Vị trí</th>
                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Thứ tự</th>
                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Hành động</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center">
                                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-2" />
                                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Đang tải dữ liệu...</p>
                                </td>
                            </tr>
                        ) : banners.length > 0 ? (
                            banners.map((banner) => (
                                <tr key={banner.id} className="hover:bg-blue-50/30 transition duration-150 group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            {/* HIỂN THỊ HÌNH ẢNH */}
                                            <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm flex-shrink-0">
                                                <img
                                                    src={BannerService.getBannerImageUrl(banner.image)}
                                                    alt={banner.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                                    onError={(e) => { e.target.src = "https://placehold.co/200x120?text=No+Image"; }}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 uppercase">{banner.name}</div>
                                                <div className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{banner.link || 'Không có link'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600 uppercase italic">
                                        {banner.position}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-black text-blue-600">
                                        #{banner.sort_order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <StatusBadge status={banner.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/admin/banners/edit?id=${banner.id}`)}
                                                className="p-2.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition duration-200"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteBanner(banner.id)}
                                                className="p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition duration-200"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-20 text-gray-400 italic font-medium">
                                    Không có dữ liệu banner nào phù hợp...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PHÂN TRANG */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter">
                    Trang <span className="text-blue-600">{currentPage}</span> trên {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-bold transition ${
                                    currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}