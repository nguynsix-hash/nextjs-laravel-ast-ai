"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, ArrowRight, ShoppingCart, Eye, PackageX, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import ProductService from '@/services/ProductService';

// Reusing ProductCard Component (Simplified for Search)
const ProductCard = ({ product }) => {
    const isSale = !!product.product;
    const data = isSale ? product.product : product;
    const priceBuy = data.price_buy || 0;
    const priceSale = isSale ? product.price_sale : null;
    const discount = priceSale ? Math.round(((priceBuy - priceSale) / priceBuy) * 100) : 0;
    const imgUrl = ProductService.getProductThumbnailUrl(data);

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group overflow-hidden">
            <div className="relative h-60 bg-gray-50 overflow-hidden">
                {discount > 0 && (
                    <div className="absolute top-2 right-2 z-20 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md">
                        -{discount}%
                    </div>
                )}
                <img
                    src={imgUrl}
                    alt={data.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image"; }}
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link href={`/main/product/${data.id}`} className="bg-white p-2 rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition">
                        <Eye size={18} />
                    </Link>
                </div>
            </div>
            <div className="p-4">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{data.category?.name || "Sản phẩm"}</div>
                <h3 className="text-gray-900 font-bold line-clamp-2 h-10 mb-2 group-hover:text-indigo-600 transition">{data.name}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-red-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceSale || priceBuy)}
                    </span>
                    {discount > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceBuy)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const keyword = searchParams.get('keyword') || '';
    const page = Number(searchParams.get('page')) || 1;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!keyword.trim()) {
                setLoading(false);
                setProducts([]);
                return;
            }

            setLoading(true);
            try {
                // Call API: client/products?search=...
                const res = await ProductService.productClient({
                    search: keyword,
                    page: page,
                    limit: 12
                });

                if (res?.success || res?.status === 'success') { // Adjust based on actual API response structure
                    const data = res.data?.data || res.data || [];
                    const meta = res.data?.meta || {}; // Pagination info usually in meta or root

                    setProducts(Array.isArray(data) ? data : []);
                    setTotal(res.data?.total || meta?.total || data.length);
                    setLastPage(res.data?.last_page || meta?.last_page || 1);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [keyword, page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            router.push(`/main/search?keyword=${encodeURIComponent(keyword)}&page=${newPage}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-10">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* HEADLINE */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/main" className="hover:text-indigo-600 flex items-center"><Home size={14} className="mr-1" /> Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-800 font-bold">Tìm kiếm</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 border-l-4 border-indigo-600 pl-4 py-1">
                        Kết quả tìm kiếm: <span className="text-indigo-600">"{keyword}"</span>
                    </h1>
                    <p className="mt-2 text-gray-500 pl-5">Tìm thấy <span className="font-bold text-gray-900">{total}</span> sản phẩm phù hợp.</p>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                        <p className="text-gray-500 font-medium">Đang tìm kiếm sản phẩm...</p>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {lastPage > 1 && (
                            <div className="flex justify-center mt-12 gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                                >
                                    Trước
                                </button>
                                {[...Array(lastPage)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-10 h-10 rounded-lg font-bold transition ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === lastPage}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // EMPTY STATE
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Search size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h2>
                        <p className="text-gray-500 mb-8">
                            Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với từ khóa <strong className="text-gray-800">"{keyword}"</strong>.
                            <br />Hãy thử lại với từ khóa khác chung chung hơn.
                        </p>
                        <Link href="/main/product" className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                            <ShoppingBag className="mr-2" size={20} />
                            Xem tất cả sản phẩm
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
