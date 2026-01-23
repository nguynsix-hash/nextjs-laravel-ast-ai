"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Heart,
  Truck,
  Zap,
  CheckCircle,
  Loader2,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  Share2,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import { Toaster, toast } from 'react-hot-toast';

import ProductService from "@/services/ProductService";
import CartService from "@/services/CartService";

export default function ProductDetailPage({ params }) {
  const decodedParams = use(params);
  const productId = decodedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  // Selection States
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await ProductService.getById(productId);
        const productData = res?.data?.data || res?.data;

        if (productData) {
          setProduct(productData);
          const initialImg = productData.thumbnail
            ? ProductService.getImageUrl(productData.thumbnail)
            : productData.images?.[0]
              ? ProductService.getImageUrl(productData.images[0].image || productData.images[0].url)
              : "/placeholder-product.jpg";
          setActiveImage(initialImg);

          // Auto-select first options if available to save user clicks (UX improvement)
          const colorAttr = productData.attributes?.filter(a => a.attribute?.code === "color");
          const sizeAttr = productData.attributes?.filter(a => a.attribute?.code === "size");

          if (colorAttr && colorAttr.length > 0 && !selectedColor) setSelectedColor(colorAttr[0].value);
          if (sizeAttr && sizeAttr.length > 0 && !selectedSize) setSelectedSize(sizeAttr[0].value);

          // Fetch related products
          try {
            const relatedRes = await ProductService.getRelated(productId);
            if (relatedRes?.data) {
              setRelatedProducts(relatedRes.data);
            }
          } catch (error) {
            console.error("Related products error:", error);
          }
        }
      } catch (err) {
        console.error("FETCH DETAIL ERROR:", err);
        toast.error("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ================= LOGIC GIỎ HÀNG =================
  const handleAddToCart = () => {
    // Validation
    if (colorOptions.length > 0 && !selectedColor) {
      toast.error("Vui lòng chọn Màu sắc!");
      return;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn Kích thước!");
      return;
    }

    setAdding(true);

    // Simulate network delay for better interaction feedback
    setTimeout(() => {
      CartService.addToCart(product, quantity, selectedColor, selectedSize);
      setAdding(false);
      toast.success((t) => (
        <div className="flex items-center gap-2">
          <span className="font-bold">Đã thêm vào giỏ!</span>
          <button onClick={() => window.location.href = '/main/cart'} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Xem giỏ</button>
        </div>
      ), { duration: 3000, position: 'top-right' });
    }, 600);
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };


  // ================= LOGIC NHÓM THUỘC TÍNH =================
  const groupedAttributes = useMemo(() => {
    if (!product?.attributes) return {};
    return product.attributes.reduce((acc, item) => {
      const name = item.attribute?.name || "Thông số khác";
      if (!acc[name]) acc[name] = [];
      if (!acc[name].includes(item.value)) acc[name].push(item.value);
      return acc;
    }, {});
  }, [product]);

  const colorOptions = product?.attributes?.filter(a => a.attribute?.code === "color") || [];
  const sizeOptions = product?.attributes?.filter(a => a.attribute?.code === "size") || [];

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
      <p className="text-gray-400 font-bold tracking-widest text-sm animate-pulse">LOADING PRODUCT...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-900">Sản phẩm không tồn tại hoặc đã bị xóa.</h2>
      <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition">Quay lại</button>
    </div>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <a href="/main" className="hover:text-indigo-600 transition flex items-center">Trang chủ</a>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <a href="/main/product" className="hover:text-indigo-600 transition">Sản phẩm</a>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <a href={`/main/product?category_id=${product.category_id}`} className="hover:text-indigo-600 transition">{product.category.name}</a>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden ring-1 ring-gray-100 relative">
          {/* BADGE SALE */}
          {product.price_sale && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-black px-6 py-2 rounded-bl-3xl z-10 shadow-lg">
              SALE
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-0 lg:gap-12">

            {/* CỘT TRÁI: GALLERY - Sticky on Desktop */}
            <div className="bg-gray-50/50 p-6 md:p-10 lg:pr-0 flex flex-col gap-6">
              <div className="aspect-[4/5] md:aspect-square bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-inner group relative cursor-zoom-in">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar px-1">
                {product.thumbnail && (
                  <button
                    onClick={() => setActiveImage(ProductService.getImageUrl(product.thumbnail))}
                    className={`relative min-w-[70px] h-[70px] rounded-xl overflow-hidden border-2 transition-all ${activeImage === ProductService.getImageUrl(product.thumbnail) ? "border-indigo-600 ring-2 ring-indigo-100 scale-105" : "border-white shadow-sm hover:border-gray-200"}`}
                  >
                    <img src={ProductService.getImageUrl(product.thumbnail)} className="w-full h-full object-cover" alt="thumb" />
                  </button>
                )}
                {product.images?.map((img, i) => {
                  const url = ProductService.getImageUrl(img.image || img.url);
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveImage(url)}
                      className={`relative min-w-[70px] h-[70px] rounded-xl overflow-hidden border-2 transition-all ${activeImage === url ? "border-indigo-600 ring-2 ring-indigo-100 scale-105" : "border-white shadow-sm hover:border-gray-200"}`}
                    >
                      <img src={url} className="w-full h-full object-cover" alt="gallery" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT */}
            <div className="flex flex-col p-6 md:p-10 pl-6 md:pl-10 lg:pl-0">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {product.category?.name || "Premium Quality"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Heart size={20} /></button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"><Share2 size={20} /></button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                    <span className="text-gray-900 font-bold ml-1 text-sm">5.0</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">Đã bán <strong className="text-gray-900">1.2k</strong></span>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold uppercase">
                    <CheckCircle size={12} /> Còn hàng
                  </div>
                </div>
              </div>

              {/* PRICE */}
              <div className="mb-8">
                <div className="flex items-end gap-3">
                  <span className="text-4xl md:text-5xl font-black text-indigo-600 tracking-tighter">
                    {Number(product.price_sale || product.price_buy).toLocaleString("vi-VN")}₫
                  </span>
                  {product.price_sale && (
                    <div className="flex flex-col mb-1.5">
                      <span className="text-lg text-gray-400 line-through font-medium decoration-2">
                        {Number(product.price_buy).toLocaleString("vi-VN")}₫
                      </span>
                    </div>

                  )}
                </div>
                {product.price_sale && (
                  <p className="text-sm text-red-500 font-bold mt-1 animate-pulse">🔥 Tiết kiệm {Math.round(((product.price_buy - product.price_sale) / product.price_buy) * 100)}% hôm nay!</p>
                )}
              </div>

              {/* SHORT DESCRIPTION */}
              {product.description && (
                <div className="mb-6 text-gray-600 leading-relaxed text-sm font-medium border-l-4 border-indigo-100 pl-4">
                  {product.description}
                </div>
              )}

              {/* OPTIONS */}
              <div className="space-y-6 flex-1">
                {/* MÀU SẮC */}
                {colorOptions.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Màu sắc: <span className="text-indigo-600">{selectedColor}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedColor(c.value)}
                          className={`min-w-[50px] px-3 py-2 rounded-lg border font-bold text-sm transition-all duration-200 transform active:scale-95 ${selectedColor === c.value ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                        >
                          {c.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* KÍCH THƯỚC */}
                {sizeOptions.length > 0 && (
                  <div>
                    <div className="flex justify-between mb-3">
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Kích thước: <span className="text-indigo-600">{selectedSize}</span></p>
                      <button className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1">
                        <ShieldCheck size={12} /> Hướng dẫn chọn size
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSize(s.value)}
                          className={`min-w-[50px] px-3 py-2 rounded-lg border font-bold text-sm transition-all duration-200 transform active:scale-95 ${selectedSize === s.value ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                        >
                          {s.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUANTITY */}
                <div>
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Số lượng</p>
                  <div className="inline-flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-indigo-600 transition active:scale-90"
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <span className="w-12 text-center font-black text-lg text-gray-900">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-indigo-600 transition active:scale-90"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full bg-gray-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-xl shadow-gray-200 hover:shadow-indigo-200 disabled:opacity-70 disabled:transform-none"
                  >
                    {adding ? <Loader2 className="animate-spin" /> : <ShoppingCart size={24} strokeWidth={2.5} />}
                    {adding ? "ĐANG THÊM..." : "THÊM VÀO GIỎ NGAY"}
                  </button>
                </div>

                {/* TRUST POINTS */}
                <div className="grid grid-cols-3 gap-2 mt-6">
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50 flex flex-col items-center text-center gap-2">
                    <Truck size={20} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-gray-600 leading-tight">FreeShip<br />Toàn quốc</span>
                  </div>
                  <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-50 flex flex-col items-center text-center gap-2">
                    <ShieldCheck size={20} className="text-purple-600" />
                    <span className="text-[10px] font-bold text-gray-600 leading-tight">Bảo hành<br />Chính hãng</span>
                  </div>
                  <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-50 flex flex-col items-center text-center gap-2">
                    <MessageCircle size={20} className="text-orange-600" />
                    <span className="text-[10px] font-bold text-gray-600 leading-tight">Hỗ trợ<br />24/7</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* DETAILS TABS */}
        <div className="mt-12 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-1 p-2 bg-gray-50/50 border-b border-gray-100 overflow-x-auto">
            {['description', 'specs', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-sm font-bold uppercase tracking-wide transition-all ${activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-lg shadow-gray-100 ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {tab === 'description' && 'Mô tả chi tiết'}
                {tab === 'specs' && 'Thông số kỹ thuật'}
                {tab === 'reviews' && 'Đánh giá (128)'}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12 min-h-[400px]">
            {activeTab === 'description' && (
              <div className="prose prose-lg prose-indigo max-w-none animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Đặc điểm nổi bật</h3>
                <div dangerouslySetInnerHTML={{ __html: product.content || product.description || "<p class='text-gray-500 italic'>Đang cập nhật nội dung...</p>" }} />
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-black text-gray-900 mb-8">Thông số kỹ thuật</h3>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                  {Object.entries(groupedAttributes).map(([name, values]) => (
                    <div key={name} className="flex justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition">
                      <span className="font-medium text-gray-500">{name}</span>
                      <span className="font-bold text-gray-900 text-right">{values.join(", ")}</span>
                    </div>
                  ))}
                  {Object.keys(groupedAttributes).length === 0 && (
                    <p className="text-gray-500 italic col-span-2 text-center py-10">Chưa có thông số chi tiết cho sản phẩm này.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                  <Star size={40} className="text-yellow-400 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá khách hàng</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Tính năng đánh giá đang được bảo trì để nâng cấp trải nghiệm tốt hơn.</p>
                <button className="px-6 py-2 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition">Viết đánh giá đầu tiên</button>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
                SẢN PHẨM TƯƠNG TỰ
              </h3>
              <a href="/main/product" className="text-sm font-bold text-indigo-600 hover:underline">Xem tất cả</a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <a
                  key={p.id}
                  href={`/main/product/${p.id}`}
                  className="group block bg-white rounded-2xl p-4 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 relative">
                    <img
                      src={p.thumbnail ? ProductService.getImageUrl(p.thumbnail) : "/placeholder-product.jpg"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                    />
                    {p.price_sale && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-md">
                        -{Math.round(((p.price_buy - p.price_sale) / p.price_buy) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ">{p.category?.name || "Sản phẩm"}</span>
                    <h4 className="font-bold text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-lg font-black text-indigo-600">
                        {Number(p.price_sale || p.price_buy).toLocaleString("vi-VN")}₫
                      </span>
                      {p.price_sale && (
                        <span className="text-xs text-gray-400 line-through font-bold">
                          {Number(p.price_buy).toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}