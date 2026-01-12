"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Layers3, ArrowDownWideNarrow, Trash2, Pencil, Eye, RefreshCcw } from "lucide-react";
import ProductService from "../../../../services/ProductService";
import CategoryService from "../../../../services/CategoryService";

const API_BASE_URL = "http://localhost:8000";

export default function AdminProducts() {
    const router = useRouter();

    const [productsPaginate, setProductsPaginate] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const products = productsPaginate?.data || [];
    const currentPage = productsPaginate?.current_page || 1;
    const lastPage = productsPaginate?.last_page || 1;
    const total = productsPaginate?.total || 0;

    const fetchCategories = async () => {
        try {
            const res = await CategoryService.getAll({ per_page: 999 });
            setCategories(res.data?.data || []);
        } catch (err) {
            console.error("Load categories error:", err);
        }
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = { page, per_page: perPage };

            if (categoryId) params.category_id = categoryId;
            if (sortBy) params.sortBy = sortBy;
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) {
                if (statusFilter === "new") params.status = "new";
                else if (statusFilter === "sale") params.status = "sale";
                else if (statusFilter === "out_of_stock") params.status = "out_of_stock";
                else if (statusFilter === "inactive") params.status = "inactive";
            }

            const res = await ProductService.getAll(params);
            if (!res?.data) throw new Error("Response data missing");
            setProductsPaginate(res.data);
        } catch (err) {
            console.error("Fetch products error:", err);
            setError(err?.message || "Lỗi khi tải sản phẩm");
        } finally {
            setLoading(false);
        }
    }, [page, perPage, categoryId, sortBy, searchQuery, statusFilter]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa sản phẩm này vĩnh viễn?")) return;
        try {
            setLoading(true);
            await ProductService.delete(id);
            alert("Xóa sản phẩm thành công!");

            const remaining = products.length - 1;
            if (remaining <= 0 && currentPage > 1) setPage(p => p - 1);
            else fetchProducts();
        } catch (err) {
            console.error("Delete error:", err);
            alert(err?.message || "Xóa thất bại. Vui lòng kiểm tra quyền.");
        } finally {
            setLoading(false);
        }
    };

    const goToAdd = () => router.push("/dashboard/admin/product/add");
    const goToEdit = (id) => router.push(`/dashboard/admin/product/${id}/edit`);
    const goToDetail = (id) => router.push(`/dashboard/admin/product/${id}/show`);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${API_BASE_URL}/storage/${path.startsWith('uploads') ? path : 'uploads/' + path}`;
    };

    const getProductThumbnailUrl = (p) => {
        let path = null;
        if (p.thumbnail) path = p.thumbnail;
        else if (p.images?.length) path = p.images[0]?.image;
        return getImageUrl(path);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setCategoryId("");
        setSortBy("");
        setStatusFilter("");
        setPage(1);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b-4 border-blue-600">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                        Quản lý Sản phẩm 🛍️
                    </h1>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <select
                            value={perPage}
                            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                            className="border-2 border-gray-300 rounded-xl px-4 py-2.5 bg-white shadow-md font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                            <option value={5}>5 sản phẩm / trang</option>
                            <option value={10}>10 sản phẩm / trang</option>
                            <option value={20}>20 sản phẩm / trang</option>
                        </select>

                        <button
                            onClick={goToAdd}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white font-extrabold rounded-xl shadow-lg shadow-green-500/50 hover:bg-green-800 transition transform hover:scale-105"
                        >
                            <Plus size={20} /> Thêm sản phẩm mới
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 flex flex-wrap items-center gap-4 border-t-4 border-blue-500">
                    <div className="relative flex-grow min-w-[250px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            placeholder="Tìm kiếm tên/SKU/mô tả..."
                            className="border-2 border-gray-300 rounded-xl pl-12 pr-6 py-3 w-full font-semibold text-gray-800 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>

                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Layers3 size={20} className="text-blue-500" />
                        <select
                            value={categoryId}
                            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 bg-white font-bold text-gray-800 shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all flex-grow"
                        >
                            <option value="" className="font-semibold">-- Tất cả danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id} className="font-semibold">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 min-w-[150px]">
                        <ArrowDownWideNarrow size={20} className="text-blue-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 bg-white font-bold text-gray-800 shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all flex-grow"
                        >
                            <option value="">Sắp xếp theo</option>
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 min-w-[150px]">
                        <span className="text-blue-500 font-bold">Trạng thái:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 bg-white font-bold text-gray-800 shadow-sm focus:ring-blue-600 focus:border-blue-600 transition-all flex-grow"
                        >
                            <option value="">-- Tất cả --</option>
                            <option value="new">Hoạt động</option>
                            <option value="inactive">Ngưng hoạt động</option>
                            <option value="sale">Đang sale</option>
                            <option value="out_of_stock">Hết hàng</option>
                        </select>
                    </div>

                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-400 rounded-xl text-gray-800 font-extrabold hover:bg-gray-100 transition transform hover:scale-105"
                        title="Đặt lại tất cả bộ lọc và tìm kiếm"
                    >
                        <RefreshCcw size={18} /> Đặt lại
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">
                    {loading && <div className="p-10 text-center text-xl text-blue-600 font-extrabold">Đang tải dữ liệu sản phẩm...</div>}
                    {!loading && error && <div className="p-10 text-center text-xl text-red-700 font-extrabold">{error}</div>}
                    {!loading && !error && (
                        <>
                            <table className="min-w-full table-auto">
                                <thead className="bg-blue-600 text-white shadow-inner">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider">STT</th>
                                        <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider">Tên Sản phẩm</th>
                                        <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider">Danh mục</th>
                                        <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider">Giá Bán</th>
                                        <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider">Tồn Kho</th>
                                        <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider">Ảnh</th>
                                        <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider">Mô tả</th>
                                        <th className="px-5 py-4 text-center text-sm font-extrabold uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-5 py-4 text-center text-sm font-extrabold uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-10 text-center text-xl text-gray-600 font-bold">
                                                Không có sản phẩm nào được tìm thấy.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((p, idx) => (
                                            <tr key={p.id} className="border-t border-gray-100 hover:bg-blue-50 transition duration-150">
                                                <td className="px-5 py-4 font-extrabold text-gray-900">{(currentPage - 1) * perPage + idx + 1}</td>
                                                <td className="px-5 py-4 font-bold text-blue-700">{p.name}</td>
                                                <td className="px-5 py-4 font-semibold text-gray-700">{p.category?.name ?? "Chưa phân loại"}</td>
                                                <td className="px-5 py-4 font-extrabold text-green-700 whitespace-nowrap">{(p.price_buy ?? 0).toLocaleString("vi-VN")} ₫</td>
                                                <td className="px-5 py-4 font-extrabold text-orange-600">
                                                    <span className={`px-3 py-1 rounded-full ${p.store?.qty > 0 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{p.store?.qty ?? 0}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {getProductThumbnailUrl(p) ? (
                                                        <img
                                                            src={getProductThumbnailUrl(p)}
                                                            alt={p.name}
                                                            className="w-16 h-12 object-cover rounded-lg shadow-md border-2 border-gray-100"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-500 italic">No Image</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-gray-700 font-medium">{p.description ?? "-"}</td>
                                                <td className="px-5 py-4 text-center flex flex-wrap justify-center gap-1">
                                                    {p.status === 1 && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Hoạt động</span>}
                                                    {p.status === 0 && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Ngưng hoạt động</span>}
                                                    {p.sales?.length > 0 && <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Sale</span>}
                                                    {p.store?.qty === 0 && <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Hết hàng</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-center gap-3">
                                                        <button onClick={() => goToDetail(p.id)} className="p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition transform hover:scale-110" title="Xem chi tiết"><Eye size={18} /></button>
                                                        <button onClick={() => goToEdit(p.id)} className="p-2 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition transform hover:scale-110" title="Chỉnh sửa"><Pencil size={18} /></button>
                                                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-700 text-white rounded-xl shadow-md hover:bg-red-800 transition transform hover:scale-110" title="Xóa sản phẩm"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-blue-50 border-t-2 border-gray-200">
                                <div className="text-lg font-extrabold text-gray-800">
                                    Hiển thị: <span className="text-blue-700">{products.length}</span> / Tổng: <span className="text-blue-700">{total}</span> sản phẩm
                                </div>

                                <div className="flex items-center gap-2 mt-3 md:mt-0">
                                    <button onClick={() => setPage(1)} disabled={currentPage === 1} className={`px-4 py-2 border-2 rounded-xl font-extrabold transition ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-100 border-blue-200'}`} title="Trang đầu">«</button>
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-4 py-2 border-2 rounded-xl font-extrabold transition ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-100 border-blue-200'}`} title="Trang trước">‹</button>

                                    <span className="px-4 py-2 text-lg font-extrabold text-blue-800 bg-blue-200 rounded-xl shadow-inner">{currentPage} / {lastPage}</span>

                                    <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={currentPage === lastPage} className={`px-4 py-2 border-2 rounded-xl font-extrabold transition ${currentPage === lastPage ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-100 border-blue-200'}`} title="Trang sau">›</button>
                                    <button onClick={() => setPage(lastPage)} disabled={currentPage === lastPage} className={`px-4 py-2 border-2 rounded-xl font-extrabold transition ${currentPage === lastPage ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-100 border-blue-200'}`} title="Trang cuối">»</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
