"use client";
import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Percent,
    RefreshCw,
    Calendar,
    Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProductSaleService from "../../../../services/ProductSaleService";

// ===========================
// FORMAT UTILS
// ===========================
const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// ===========================
// MAIN COMPONENT
// ===========================
export default function PromotionManagement() {
    const router = useRouter();

    const [promotions, setPromotions] = useState([]);
    const [totalPromotions, setTotalPromotions] = useState(0);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(5);
    const [loading, setLoading] = useState(false);

    // ===========================
    // FETCH DATA
    // ===========================
    const fetchPromotions = async () => {
        setLoading(true);

        // Logic để reset về trang 1 khi tìm kiếm/lọc thay đổi
        if ((search || filterStatus !== "all") && currentPage !== 1) {
            setCurrentPage(1);
            setLoading(false);
            return;
        }

        try {
            const params = {
                search,
                status:
                    filterStatus !== "all"
                        ? filterStatus === "active"
                            ? 1
                            : 0
                        : undefined,
                page: currentPage,
                per_page: limit,
            };

            const res = await ProductSaleService.getAll(params);

            setPromotions(res.data?.data || []);
            setTotalPromotions(res.data?.total || 0);
        } catch (error) {
            console.error("❌ Lỗi lấy danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [search, filterStatus, currentPage]);

    // ===========================
    // HANDLERS
    // ===========================
    const deletePromotion = async (id) => {
        if (!confirm(`Xác nhận xóa chương trình khuyến mãi ID ${id}?`)) return;

        try {
            await ProductSaleService.delete(id);
            alert(`Đã xóa khuyến mãi thành công!`);
            fetchPromotions();
        } catch (e) {
            console.error(e);
            alert("Xóa thất bại!");
        }
    };

    // ===========================
    // STATUS BADGE
    // ===========================
    const StatusBadge = ({ status }) =>
        status === 1 ? (
            // **NÂNG CẤP**: font-bold và màu nền/viền đậm hơn
            <span className="px-3 py-1 bg-green-200 text-green-800 font-extrabold text-xs rounded-full border border-green-300">
                Đang hoạt động
            </span>
        ) : (
            // **NÂNG CẤP**: font-bold và màu nền/viền đậm hơn
            <span className="px-3 py-1 bg-gray-300 text-gray-800 font-extrabold text-xs rounded-full border border-gray-400">
                Ngừng hoạt động
            </span>
        );

    const totalPages = Math.ceil(totalPromotions / limit);

    // ===========================
    // RENDER UI
    // ===========================
    return (
        // **NÂNG CẤP**: Nền xám nhạt hơn
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* **NÂNG CẤP**: Tiêu đề lớn hơn, đậm hơn và màu hồng đậm hơn */}
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
                <Percent className="text-pink-700" size={32} />
                QUẢN LÝ KHUYẾN MÃI
            </h1>

            {/* Search + Filter + Add + Refresh */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border mb-8 flex flex-wrap justify-between items-center gap-6">
                <div className="flex gap-4 flex-wrap items-center">
                    {/* SEARCH */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            placeholder="Tìm kiếm theo tên KM / sản phẩm..."
                            // **NÂNG CẤP**: Tăng padding, border và width
                            className="pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl w-80 focus:border-pink-600 transition duration-150"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            disabled={loading}
                        />
                    </div>

                    {/* FILTER STATUS */}
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        {/* **NÂNG CẤP**: Tăng padding và border */}
                        <select
                            className="pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl appearance-none bg-white transition duration-150"
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            disabled={loading}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Ngừng hoạt động</option>
                        </select>
                    </div>

                    {/* REFRESH */}
                    {/* **NÂNG CẤP**: Nút refresh rõ ràng hơn */}
                    <button
                        onClick={fetchPromotions}
                        className="p-2.5 border-2 border-pink-500 rounded-xl hover:bg-pink-100 transition duration-150"
                        disabled={loading}
                    >
                        <RefreshCw
                            size={20}
                            className={loading ? "animate-spin text-pink-700" : "text-pink-500"}
                        />
                    </button>
                </div>

                {/* ADD BTN */}
                {/* **NÂNG CẤP**: Màu đậm hơn, chữ đậm hơn */}
                <button
                    className="bg-pink-700 text-white px-6 py-3 rounded-xl font-extrabold hover:bg-pink-800 flex items-center gap-2 shadow-md hover:shadow-lg transition duration-150"
                    onClick={() =>
                        router.push("/dashboard/admin/promotions/add")
                    }
                >
                    <Plus size={20} /> Thêm khuyến mãi mới
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow-xl rounded-2xl border-2 border-gray-100 overflow-hidden">
                <table className="min-w-full">
                    {/* **NÂNG CẤP**: Tiêu đề bảng đậm, màu nền và chữ rõ nét hơn */}
                    <thead className="bg-pink-100 text-pink-800 border-b-2 border-pink-200">
                        <tr>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                ID
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                TÊN KM
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                SẢN PHẨM
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                GIÁ GỐC
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                GIÁ KM
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                % GIẢM
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                BẮT ĐẦU
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                KẾT THÚC
                            </th>
                            <th className="px-5 py-4 text-left text-sm font-extrabold tracking-wider">
                                TRẠNG THÁI
                            </th>
                            <th className="px-5 py-4 text-sm font-extrabold tracking-wider text-center">
                                HÀNH ĐỘNG
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="p-8 text-center text-xl text-pink-600 font-extrabold"
                                >
                                    <RefreshCw
                                        size={24}
                                        className="animate-spin inline-block mr-3"
                                    />
                                    Đang tải dữ liệu, vui lòng chờ...
                                </td>
                            </tr>
                        ) : promotions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="p-8 text-center text-lg text-gray-600 italic font-medium"
                                >
                                    Không tìm thấy chương trình khuyến mãi nào.
                                </td>
                            </tr>
                        ) : (
                            promotions.map((item) => {
                                const priceBuy = item.product?.price_buy || 0;
                                const priceSale = item.price_sale || 0;

                                const percent =
                                    priceBuy > 0
                                        ? Math.round(
                                              ((priceBuy - priceSale) /
                                                  priceBuy) *
                                                  100
                                          )
                                        : 0;

                                return (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-b-0 hover:bg-pink-50 transition duration-100"
                                    >
                                        {/* **NÂNG CẤP**: Chữ đậm hơn */}
                                        <td className="px-5 py-4 text-sm font-bold text-gray-800">
                                            {item.id}
                                        </td>
                                        {/* **NÂNG CẤP**: Chữ đậm hơn */}
                                        <td className="px-5 py-4 text-sm font-extrabold text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {item.product?.name ||
                                                `ID: ${item.product_id}`}
                                        </td>

                                        {/* **NÂNG CẤP**: Màu xám đậm hơn */}
                                        <td className="px-5 py-4 text-sm font-bold text-gray-700">
                                            {formatCurrency(priceBuy)}
                                        </td>

                                        {/* **NÂNG CẤP**: Màu đỏ đậm hơn */}
                                        <td className="px-5 py-4 text-sm font-extrabold text-red-700">
                                            {formatCurrency(priceSale)}
                                        </td>

                                        {/* **NÂNG CẤP**: Màu xanh đậm hơn */}
                                        <td className="px-5 py-4 text-sm font-extrabold text-green-700">
                                            {percent > 0
                                                ? `-${percent}%`
                                                : "0%"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            <Calendar
                                                size={14}
                                                className="inline-block mr-1 text-pink-600"
                                            />
                                            {formatDate(item.date_begin)}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            <Calendar
                                                size={14}
                                                className="inline-block mr-1 text-pink-600"
                                            />
                                            {formatDate(item.date_end)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {/* **NÂNG CẤP**: Nút hành động nổi bật hơn */}
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/dashboard/admin/promotions/edit/${item.id}`
                                                        )
                                                    }
                                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deletePromotion(item.id)
                                                    }
                                                    className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition duration-150 shadow-md"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* PAGINATION */}
                {totalPromotions > 0 && (
                    <div className="p-6 flex justify-between items-center bg-gray-50 border-t">
                        {/* **NÂNG CẤP**: Chữ đậm hơn */}
                        <span className="text-md text-gray-700 font-medium">
                            Hiển thị{" "}
                            {(currentPage - 1) * limit + 1}–
                            {Math.min(currentPage * limit, totalPromotions)} /
                            <b className="text-gray-900 ml-1"> {totalPromotions}</b>
                        </span>

                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    // **NÂNG CẤP**: Nút phân trang lớn hơn, đậm hơn
                                    className={`px-4 py-2 border-2 rounded-xl text-md font-bold transition duration-150 ${
                                        currentPage === i + 1
                                            ? "bg-pink-700 text-white border-pink-700 shadow-md"
                                            : "bg-white text-pink-700 border-pink-500 hover:bg-pink-100"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}