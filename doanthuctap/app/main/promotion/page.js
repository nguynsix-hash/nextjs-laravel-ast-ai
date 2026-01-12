"use client";

import React, { useState, useEffect } from "react";
import { Tag, Loader2, ShoppingBag, Percent, Clock } from "lucide-react";
import ProductSaleService from "@/services/ProductSaleService";
import ProductService from "@/services/ProductService";
import CategoryService from "@/services/CategoryService";
import Link from "next/link";

/* ================== UTILS ================== */
const formatCurrency = (amount) => {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN");

const calculateDiscountPercent = (priceBuy, priceSale) => {
  if (!priceBuy || !priceSale || priceBuy <= priceSale) return 0;
  return Math.round(((priceBuy - priceSale) / priceBuy) * 100);
};

/* ================== CARD ================== */
const SaleProductCard = ({ item, viewMode }) => {
  const product = item.product;
  const priceBuy = product?.price_buy || 0;
  const priceSale = item.price_sale || 0;
  const percent = calculateDiscountPercent(priceBuy, priceSale);
  const imageUrl = ProductService.getProductThumbnailUrl(product);

  const SaleDate = () => (
    <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {formatDate(item.date_begin)} – {formatDate(item.date_end)}
    </p>
  );

  /* ===== LIST VIEW ===== */
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl p-4 flex gap-4 border">
        <img
          src={imageUrl}
          alt={product?.name}
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">
            {product?.name}
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-red-600 font-black text-lg">
              {formatCurrency(priceSale)}
            </span>
            <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded">
              -{percent}%
            </span>
          </div>

          <p className="text-sm text-gray-400 line-through">
            {formatCurrency(priceBuy)}
          </p>

          <SaleDate />

          <Link
            href={`/main/product/${product?.id}`}
            className="inline-block mt-3 text-xs font-bold text-red-600 underline"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    );
  }

  /* ===== GRID VIEW ===== */
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition border overflow-hidden">
      <div className="relative aspect-square">
        <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2 py-1 rounded flex items-center gap-1">
          <Percent className="w-3 h-3" /> -{percent}%
        </div>
        <img
          src={imageUrl}
          alt={product?.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-2 h-12">
          {product?.name}
        </h3>

        <span className="text-red-600 font-black text-xl">
          {formatCurrency(priceSale)}
        </span>

        <p className="text-sm text-gray-400 line-through">
          {formatCurrency(priceBuy)}
        </p>

        <SaleDate />

        <Link
          href={`/main/product/${product?.id}`}
          className="mt-4 block text-center bg-gray-900 text-white text-xs font-bold py-2 rounded hover:bg-red-600"
        >
          Mua ngay
        </Link>
      </div>
    </div>
  );
};

/* ================== PAGE ================== */
export default function PromotionPage() {
  const [saleItems, setSaleItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* UI STATE */
  const [viewMode, setViewMode] = useState("grid");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  /* ================== FETCH DATA ================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleRes, cateRes] = await Promise.all([
          ProductSaleService.getAll({ status: 1 }),
          CategoryService.getAll({ status: 1 }),
        ]);

        if (saleRes?.success) {
          setSaleItems(saleRes.data.data || saleRes.data);
        }

        if (cateRes?.data) {
          setCategories(cateRes.data.data || cateRes.data);
        }
      } catch (e) {
        console.error("Load data error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* Reset page khi filter */
  useEffect(() => {
    setCurrentPage(1);
  }, [category, priceRange, sortBy]);

  /* ================== FILTER + SORT ================== */
  const filteredItems = saleItems
    .filter((item) => {
      const product = item.product;
      const price = item.price_sale;

      if (category !== "all" && product?.category_id !== Number(category)) {
        return false;
      }

      if (priceRange === "lt500" && price >= 500000) return false;
      if (
        priceRange === "500to2m" &&
        (price < 500000 || price > 2000000)
      )
        return false;
      if (priceRange === "gt2m" && price <= 2000000) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price_sale - b.price_sale;
        case "price_desc":
          return b.price_sale - a.price_sale;
        case "discount":
          return (
            calculateDiscountPercent(
              b.product.price_buy,
              b.price_sale
            ) -
            calculateDiscountPercent(
              a.product.price_buy,
              a.price_sale
            )
          );
        default:
          return b.id - a.id;
      }
    });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================== LOADING ================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  /* ================== RENDER ================== */
  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* HEADER */}
      <div className="bg-red-600 py-14 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full mb-4">
          <Tag className="w-4 h-4" />
          <span className="text-xs font-black uppercase">
            Ưu đãi đang diễn ra
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black">
          SIÊU SALE <span className="text-yellow-300">BÙNG NỔ</span>
        </h1>
        <p className="mt-3 text-white/80">
          Các chương trình khuyến mãi đang áp dụng
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10">
        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow flex flex-wrap gap-4 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded ${
                viewMode === "grid"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Lưới
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded ${
                viewMode === "list"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Danh sách
            </button>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value="all">Tất cả giá</option>
            <option value="lt500">&lt; 500k</option>
            <option value="500to2m">500k - 2 triệu</option>
            <option value="gt2m">&gt; 2 triệu</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="discount">Giảm giá nhiều nhất</option>
          </select>
        </div>

        {/* PRODUCTS */}
        {paginatedItems.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {paginatedItems.map((item) => (
              <SaleProductCard
                key={item.id}
                item={item}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-10 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">
              Hiện không có chương trình khuyến mãi
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded font-bold text-sm ${
                  currentPage === i + 1
                    ? "bg-red-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
