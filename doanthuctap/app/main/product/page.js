"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Filter,
    LayoutGrid,
    List,
    Search,
    ShoppingCart,
    Tag,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductService from "../../../services/ProductService";
import CategoryService from "../../../services/CategoryService";
import CartService from "../../../services/CartService";
import AttributeService from "../../../services/AttributeService";

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ product, viewMode }) => {
    const router = useRouter();
    const isGrid = viewMode === "grid";
    const [isAdded, setIsAdded] = useState(false);

    const priceBuy = parseFloat(product.price_buy || 0);
    const priceSale =
        product.price_sale && parseFloat(product.price_sale) > 0
            ? parseFloat(product.price_sale)
            : null;

    const hasDiscount = priceSale !== null && priceSale < priceBuy;

    const goToDetail = () => {
        router.push(`/main/product/${product.id}`);
    };

    /* Xử lý thêm vào giỏ hàng */
    const handleAddToCart = (e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm chuyển trang

        // Gọi service của bạn (mặc định color/size là null cho add nhanh)
        CartService.addToCart(product, 1, null, null);

        // Hiệu ứng phản hồi người dùng
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div
            className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group ${isGrid
                ? "flex flex-col p-4"
                : "flex flex-col sm:flex-row items-center p-4 gap-4"
                }`}
        >
            {/* IMAGE */}
            <div
                onClick={goToDetail}
                className={`relative cursor-pointer overflow-hidden rounded-lg ${isGrid ? "w-full h-48 mb-4" : "w-32 h-32 flex-shrink-0"
                    }`}
            >
                <img
                    src={ProductService.getProductThumbnailUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) =>
                        (e.target.src = "https://placehold.co/400x300?text=No+Image")
                    }
                />
                {hasDiscount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        -{Math.round(((priceBuy - priceSale) / priceBuy) * 100)}%
                    </div>
                )}
            </div>

            {/* INFO */}
            <div className="flex-1 w-full">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {product.category?.name || "Sản phẩm"}
                </span>

                <h3
                    onClick={goToDetail}
                    className={`mt-1 font-bold cursor-pointer hover:text-blue-600 transition-colors line-clamp-2 ${isGrid ? "text-sm h-10" : "text-lg"
                        }`}
                >
                    {product.name}
                </h3>

                <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-red-600 font-extrabold text-lg">
                        {(priceSale || priceBuy).toLocaleString("vi-VN")}₫
                    </p>
                    {hasDiscount && (
                        <p className="text-gray-400 line-through text-xs">
                            {priceBuy.toLocaleString("vi-VN")}₫
                        </p>
                    )}
                </div>

                <p className="text-[11px] text-gray-500 mt-1 italic">
                    Còn lại: {product.product_qty || 0} sản phẩm
                </p>
            </div>

            {/* ACTION */}
            <div className={`flex items-center gap-2 ${isGrid ? "mt-4 w-full" : "w-48"}`}>
                <button
                    onClick={goToDetail}
                    className="flex-[2] py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-xs font-bold uppercase tracking-tighter"
                >
                    Chi tiết
                </button>

                <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center shadow-lg active:scale-90 ${isAdded
                        ? "bg-green-500 text-white shadow-green-100"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                        }`}
                >
                    {isAdded ? <CheckCircle2 className="h-5 w-5 animate-in zoom-in" /> : <ShoppingCart className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
};

/* ================= MAIN PAGE ================= */
export default function ProductPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [attributesList, setAttributesList] = useState([]); // List bộ lọc động (Màu, Size,...)
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    // State bộ lọc tổng hợp
    const [filters, setFilters] = useState({
        category_id: searchParams.get("category_id") || "",
        priceRange: "",
        attributes: {} // Object: { 1: "Đỏ", 2: "XL" }
    });

    const [sortOption, setSortOption] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    /* ===== LOAD INITIAL DATA (Category + Attributes) ===== */
    useEffect(() => {
        // Load Categories
        CategoryService.getAll()
            .then((res) => setCategories(res.data?.data || res.data || []))
            .catch(console.error);

        // Load Attributes for Filter
        AttributeService.getClientFilterList()
            .then((res) => {
                if (res.success) setAttributesList(res.data);
            })
            .catch(console.error);
    }, []);

    // Update state when URL params change
    useEffect(() => {
        const querySearch = searchParams.get("search") || "";
        const queryCategory = searchParams.get("category_id") || "";

        // Parse attributes from URL URL (e.g. attributes[1]=Red)
        const queryAttributes = {};
        searchParams.forEach((value, key) => {
            const match = key.match(/attributes\[(\d+)\]/);
            if (match) {
                queryAttributes[match[1]] = value;
            }
        });

        if (querySearch !== searchTerm) setSearchTerm(querySearch);

        // Sync Filters
        setFilters(prev => {
            const newFilters = { ...prev };
            let changed = false;

            if (queryCategory !== prev.category_id) {
                newFilters.category_id = queryCategory;
                changed = true;
            }

            // Shallow compare attributes
            const isAttrSame = JSON.stringify(prev.attributes) === JSON.stringify(queryAttributes);
            if (!isAttrSame) {
                newFilters.attributes = queryAttributes;
                changed = true;
            }

            return changed ? newFilters : prev;
        });

    }, [searchParams]);

    /* ===== LOAD PRODUCT ===== */
    const currentPage = parseInt(searchParams.get("page")) || 1;

    const fetchProducts = useCallback(
        async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    per_page: 6,
                    sortBy: sortOption
                };

                if (searchTerm) params.search = searchTerm;
                if (filters.category_id) params.category_id = filters.category_id;

                // Handle Price Range
                if (filters.priceRange === "<500k") params.price_max = 500000;
                if (filters.priceRange === "500k-2tr") {
                    params.price_min = 500000;
                    params.price_max = 2000000;
                }
                if (filters.priceRange === ">2tr") params.price_min = 2000000;

                // Handle Dynamic Attributes
                if (filters.attributes) {
                    params.attributes = filters.attributes;
                }

                const res = await ProductService.productClient(params);

                if (res?.success) {
                    setProducts(res.data.data || []);
                    setPagination({
                        current_page: res.data.current_page,
                        last_page: res.data.last_page,
                        total: res.data.total
                    });
                }
            } catch (err) {
                console.error(err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, filters, sortOption, currentPage]
    );

    useEffect(() => {
        const t = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(t);
    }, [fetchProducts]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        // Reset page to 1 in URL when filter changes
        const newParams = new URLSearchParams(searchParams);
        if (newParams.get('page') !== '1') {
            newParams.set('page', '1');
            router.push(`/main/product?${newParams.toString()}`);
        }
    };

    // Handle clicking a dynamic attribute filter
    const handleAttributeFilterChange = (attrId, value) => {
        const currentVal = filters.attributes[attrId];
        const newVal = currentVal === value ? "" : value; // Toggle

        // Update URL
        const newParams = new URLSearchParams(searchParams);
        if (newVal) {
            newParams.set(`attributes[${attrId}]`, newVal);
        } else {
            newParams.delete(`attributes[${attrId}]`);
        }
        newParams.set('page', '1');
        router.push(`/main/product?${newParams.toString()}`);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                        <Tag className="text-red-600" /> Danh mục sản phẩm
                    </h1>
                    <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border shadow-sm">
                        Tìm thấy <b>{pagination.total}</b> sản phẩm
                    </div>
                </div>

                {/* SEARCH + SORT BAR */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                        <input
                            value={searchTerm} // Controlled by URL state now
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchTerm(val);
                                // Optional: debounce url update here if desired
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const newParams = new URLSearchParams(searchParams);
                                    if (searchTerm) newParams.set('search', searchTerm);
                                    else newParams.delete('search');
                                    newParams.set('page', 1);
                                    router.push(`/main/product?${newParams.toString()}`);
                                }
                            }}
                            placeholder="Bạn đang tìm sản phẩm gì?..."
                            className="w-full pl-11 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="border-none bg-gray-50 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price_asc">Giá: Thấp đến Cao</option>
                            <option value="price_desc">Giá: Cao đến Thấp</option>
                        </select>

                        <div className="flex bg-gray-50 rounded-xl p-1 border">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"
                                    }`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"
                                    }`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ===== ASIDE FILTER ===== */}
                    <aside className="w-full lg:w-64 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="font-bold text-lg mb-5 flex items-center gap-2 text-gray-800">
                                <Filter size={18} className="text-blue-600" /> Bộ lọc tìm kiếm
                            </h2>

                            {/* Category Filter */}
                            <div className="mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                                    Danh mục
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    <button
                                        onClick={() => handleFilterChange("category_id", "")}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category_id === "" ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50 text-gray-600"
                                            }`}
                                    >
                                        Tất cả danh mục
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleFilterChange("category_id", cat.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${String(filters.category_id) === String(cat.id) ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50 text-gray-600"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                                    Khoảng giá
                                </h3>
                                <div className="space-y-2">
                                    {["Tất cả", "<500k", "500k-2tr", ">2tr"].map((range) => (
                                        <label
                                            key={range}
                                            className="flex items-center gap-3 group cursor-pointer"
                                        >
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-blue-600 transition-all"
                                                    checked={filters.priceRange === (range === "Tất cả" ? "" : range)}
                                                    onChange={() => handleFilterChange("priceRange", range === "Tất cả" ? "" : range)}
                                                />
                                                <div className="absolute h-2 w-2 rounded-full bg-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                            </div>
                                            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                                                {range}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Attributes Filter */}
                            {attributesList.map(attr => (
                                <div key={attr.id} className="mb-8">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                                        {attr.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {attr.values.map(val => (
                                            <button
                                                key={val}
                                                onClick={() => handleAttributeFilterChange(attr.id, val)}
                                                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${String(filters.attributes?.[attr.id]) === String(val)
                                                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-md"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                                                    }`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    setFilters({ category_id: "", priceRange: "", attributes: {} });
                                    setSearchTerm("");
                                    router.push("/main/product");
                                }}
                                className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        </div>
                    </aside>

                    {/* ===== PRODUCT GRID/LIST ===== */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed">
                                <Loader2 className="animate-spin text-blue-600 mb-4 size-10" />
                                <p className="text-gray-500 font-medium">Đang cập nhật danh sách sản phẩm...</p>
                            </div>
                        ) : (
                            <div
                                className={
                                    viewMode === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                                        : "flex flex-col gap-4"
                                }
                            >
                                {products.length > 0 ? (
                                    products.map((p) => (
                                        <ProductCard
                                            key={p.id}
                                            product={p}
                                            viewMode={viewMode}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full bg-white py-24 text-center rounded-3xl border border-dashed border-gray-200">
                                        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                            <Search className="size-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Không tìm thấy sản phẩm</h3>
                                        <p className="text-gray-500 text-sm mt-1">Vui lòng thử lại với bộ lọc hoặc từ khóa khác</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination (Optional - should be implemented based on your UI) */}
                        {!loading && pagination.last_page > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {[...Array(pagination.last_page)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.set('page', i + 1);
                                            router.push(`/main/product?${newParams.toString()}`);
                                            // Scroll to top
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`size-10 rounded-lg font-bold text-sm transition-all ${pagination.current_page === i + 1
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                            : "bg-white text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}