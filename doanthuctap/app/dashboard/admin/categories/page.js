"use client";
import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Tag,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Image as ImageIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import CategoryService from "@/services/CategoryService";

export default function Categories() {
    const router = useRouter();

    // ================= STATE =================
    const [categoriesPaginate, setCategoriesPaginate] = useState(null);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 5;
    const [loading, setLoading] = useState(false);

    // ================= LOAD DATA =================
    const loadCategories = async () => {
        try {
            setLoading(true);
            const params = {
                search: search || undefined,
                status: filterStatus !== "all" ? (filterStatus === "active" ? 1 : 0) : undefined,
                per_page: limit,
                page: currentPage
            };

            const res = await CategoryService.getAll(params);
            setCategoriesPaginate(res.data);
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [search, filterStatus, currentPage]);

    const deleteCategory = async (id) => {
        if (!confirm(`Xác nhận xóa danh mục ID: ${id}?`)) return;
        try {
            await CategoryService.delete(id);
            loadCategories();
        } catch (error) {
            console.error(error);
        }
    };

    // ================= RENDER STATUS =================
    const renderStatusBadge = (status) => {
        return status === 1 ? (
            <span className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200 border-2 border-emerald-500 rounded-lg">
                Đang hoạt động
            </span>
        ) : (
            <span className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-red-900 bg-red-200 border-2 border-red-500 rounded-lg">
                Ngừng hoạt động
            </span>
        );
    };

    return (
        <div className="p-8 bg-slate-100 min-h-screen font-sans text-slate-900">
            {/* HEADER */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                            <Settings size={40} className="text-white" />
                        </div>
                        QUẢN LÝ DANH MỤC
                    </h1>
                    <p className="text-slate-500 mt-2 font-bold ml-1">Quản lý hệ thống phân loại sản phẩm của bạn</p>
                </div>
                
                <button
                    onClick={() => router.push("/dashboard/admin/categories/add")}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black px-8 py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.6)] hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap"
                >
                    <Plus size={24} strokeWidth={3} /> THÊM DANH MỤC MỚI
                </button>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* FILTER BOX */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 bg-white rounded-[2rem] shadow-xl border-2 border-slate-100">
                    <div className="lg:col-span-2 relative">
                        <label className="block text-sm font-black text-slate-700 mb-2 ml-1">TÌM KIẾM</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500" strokeWidth={3} />
                            <input
                                placeholder="Nhập tên danh mục cần tìm..."
                                className="w-full border-3 border-slate-200 rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-indigo-500 focus:ring-0 transition-all text-lg shadow-sm"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-2 ml-1">TRẠNG THÁI</label>
                        <select
                            className="w-full border-3 border-slate-200 px-6 py-4 rounded-2xl font-black text-lg focus:border-indigo-500 focus:ring-0 appearance-none bg-slate-50 shadow-sm cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">-- TẤT CẢ --</option>
                            <option value="active">ĐANG HOẠT ĐỘNG</option>
                            <option value="inactive">NGỪNG HOẠT ĐỘNG</option>
                        </select>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-900">
                                    <th className="px-6 py-5 text-left text-white font-black uppercase tracking-widest text-sm">ID</th>
                                    <th className="px-6 py-5 text-left text-white font-black uppercase tracking-widest text-sm">Danh Mục</th>
                                    <th className="px-6 py-5 text-center text-white font-black uppercase tracking-widest text-sm">Hình Ảnh</th>
                                    <th className="px-6 py-5 text-left text-white font-black uppercase tracking-widest text-sm">Mô Tả</th>
                                    <th className="px-6 py-5 text-left text-white font-black uppercase tracking-widest text-sm">Trạng Thái</th>
                                    <th className="px-6 py-5 text-center text-white font-black uppercase tracking-widest text-sm">Thao Tác</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y-2 divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-r-4 border-transparent"></div>
                                            <p className="mt-4 font-black text-indigo-600 animate-pulse text-xl">ĐANG TẢI DỮ LIỆU...</p>
                                        </td>
                                    </tr>
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center font-black text-slate-400 text-xl">KHÔNG TÌM THẤY DỮ LIỆU</td>
                                    </tr>
                                ) : (
                                    categories.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                                            <td className="px-6 py-6 font-black text-indigo-600 text-lg">#{item.id}</td>
                                            
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        <Tag size={20} strokeWidth={3} />
                                                    </div>
                                                    <span className="font-black text-slate-800 text-lg uppercase">{item.name}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-6">
                                                <div className="flex justify-center">
                                                    {item.image ? (
                                                        <img
                                                            src={CategoryService.getImageUrl(item.image)}
                                                            alt={item.name}
                                                            className="w-20 h-20 object-cover rounded-2xl border-4 border-white shadow-lg group-hover:scale-110 transition-transform cursor-zoom-in"
                                                            onClick={() => window.open(CategoryService.getImageUrl(item.image), "_blank")}
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                                                            <ImageIcon size={24} />
                                                            <span className="text-[10px] font-bold mt-1">NO IMAGE</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-6 min-w-[250px]">
                                                <p className="text-slate-600 font-bold leading-relaxed line-clamp-2 italic">
                                                    {item.description || "Chưa có mô tả..."}
                                                </p>
                                            </td>

                                            <td className="px-6 py-6 whitespace-nowrap">
                                                {renderStatusBadge(item.status)}
                                            </td>

                                            <td className="px-6 py-6">
                                                <div className="flex justify-center gap-3 whitespace-nowrap">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/admin/categories/edit/${item.id}`)}
                                                        className="p-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-100 hover:-translate-y-1 transition-all"
                                                        title="Sửa"
                                                    >
                                                        <Edit size={22} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCategory(item.id)}
                                                        className="p-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-100 hover:-translate-y-1 transition-all"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={22} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {categoriesPaginate?.last_page > 1 && (
                        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 bg-slate-50 border-t-2 border-slate-100 gap-4">
                            <span className="font-black text-slate-700 text-lg bg-white px-6 py-2 rounded-full border-2 border-slate-200">
                                TỔNG CỘNG: <span className="text-indigo-600">{categoriesPaginate.total}</span>
                            </span>
                            
                            <div className="flex gap-3 items-center">
                                <PaginationButton onClick={() => setCurrentPage(1)} disabled={currentPage === 1} icon={<ChevronsLeft size={24} strokeWidth={3} />} />
                                <PaginationButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} icon={<ChevronLeft size={24} strokeWidth={3} />} />
                                
                                <div className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black shadow-md shadow-indigo-200 text-lg">
                                    {currentPage} / {categoriesPaginate.last_page}
                                </div>

                                <PaginationButton onClick={() => setCurrentPage(p => Math.min(categoriesPaginate.last_page, p + 1))} disabled={currentPage === categoriesPaginate.last_page} icon={<ChevronRight size={24} strokeWidth={3} />} />
                                <PaginationButton onClick={() => setCurrentPage(categoriesPaginate.last_page)} disabled={currentPage === categoriesPaginate.last_page} icon={<ChevronsRight size={24} strokeWidth={3} />} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper component cho nút phân trang
const PaginationButton = ({ onClick, disabled, icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-3 rounded-xl transition-all ${
            disabled 
            ? "text-slate-300 cursor-not-allowed bg-slate-50" 
            : "text-indigo-600 bg-white border-2 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:shadow-lg active:scale-90"
        }`}
    >
        {icon}
    </button>
);