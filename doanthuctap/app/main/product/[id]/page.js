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
} from "lucide-react";

import ProductService from "@/services/ProductService";
import CartService from "@/services/CartService"; // IMPORT THÊM DÒNG NÀY

export default function ProductDetailPage({ params }) {
  const decodedParams = use(params);
  const productId = decodedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false); // Hiệu ứng loading khi bấm nút

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

          const colorAttr = productData.attributes?.find(a => a.attribute?.code === "color");
          const sizeAttr = productData.attributes?.find(a => a.attribute?.code === "size");
          if (colorAttr) setSelectedColor(colorAttr.value);
          if (sizeAttr) setSelectedSize(sizeAttr.value);
        }
      } catch (err) {
        console.error("FETCH DETAIL ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ================= LOGIC GIỎ HÀNG =================
  const handleAddToCart = () => {
    // 1. Kiểm tra nếu sp có thuộc tính mà khách chưa chọn
    if (colorOptions.length > 0 && !selectedColor) {
      alert("Vui lòng chọn Màu sắc");
      return;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      alert("Vui lòng chọn Kích thước");
      return;
    }

    setAdding(true);

    // 2. Gọi service để lưu
    setTimeout(() => {
      CartService.addToCart(product, 1, selectedColor, selectedSize);
      setAdding(false);
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    }, 500); // Giả lập delay 0.5s cho mượt
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
      <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
      <p className="text-gray-500 font-medium tracking-wide">ĐANG TẢI TRẢI NGHIỆM...</p>
    </div>
  );

  if (!product) return <div className="min-h-screen flex items-center justify-center">Sản phẩm không tồn tại.</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => window.history.back()} className="hover:text-blue-600 transition flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Sản phẩm
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 p-6 md:p-12">
            
            {/* CỘT TRÁI: GALLERY */}
            <div className="space-y-6">
              <div className="aspect-[4/5] md:aspect-square bg-[#f3f4f6] rounded-[24px] overflow-hidden border border-gray-50 group">
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
                {product.thumbnail && (
                  <button 
                    onClick={() => setActiveImage(ProductService.getImageUrl(product.thumbnail))}
                    className={`relative min-w-[80px] h-[80px] rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === ProductService.getImageUrl(product.thumbnail) ? "border-blue-600 ring-4 ring-blue-50" : "border-transparent hover:border-gray-300"
                    }`}
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
                      className={`relative min-w-[80px] h-[80px] rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImage === url ? "border-blue-600 ring-4 ring-blue-50" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={url} className="w-full h-full object-cover" alt="gallery" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
                  {product.category?.name || "Premium Collection"}
                </span>
                <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-current" />)}
                    <span className="text-gray-900 font-bold ml-1">4.8</span>
                  </div>
                  <div className="h-4 w-[1px] bg-gray-200"></div>
                  <span className="text-sm text-gray-500 font-medium">128 Nhận xét</span>
                  <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Đang còn hàng</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-blue-600 tracking-tighter">
                    {Number(product.price_sale || product.price_buy).toLocaleString("vi-VN")}₫
                  </span>
                  {product.price_sale && (
                    <span className="text-xl text-gray-400 line-through font-medium">
                      {Number(product.price_buy).toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>
              </div>

              {/* MÀU SẮC */}
              {colorOptions.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Màu sắc: <span className="text-gray-500 font-medium">{selectedColor}</span></p>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(c.value)}
                        className={`min-w-[60px] h-12 px-4 rounded-xl border-2 font-bold transition-all ${
                          selectedColor === c.value ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-gray-100 bg-white text-gray-600 hover:border-gray-300"
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
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Kích thước: <span className="text-gray-500 font-medium">{selectedSize}</span></p>
                    <button className="text-xs font-bold text-blue-600 underline">Hướng dẫn chọn size</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizeOptions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s.value)}
                        className={`w-14 h-12 rounded-xl border-2 font-bold transition-all ${
                          selectedSize === s.value ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-gray-100 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {s.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* NÚT THAO TÁC */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-auto">
                <button 
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="md:col-span-4 bg-gray-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-gray-200 disabled:opacity-70"
                >
                  {adding ? <Loader2 className="animate-spin" /> : <ShoppingCart size={24} />} 
                  {adding ? "ĐANG THÊM..." : "THÊM VÀO GIỎ HÀNG"}
                </button>
                <button className="md:col-span-1 bg-white border-2 border-gray-100 hover:border-red-100 hover:bg-red-50 text-gray-900 hover:text-red-600 py-5 rounded-2xl flex items-center justify-center transition-all">
                  <Heart size={24} />
                </button>
              </div>

              {/* TRUST BADGES */}
              <div className="mt-10 p-6 bg-gray-50 rounded-[24px] grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600"><Truck size={20} /></div>
                  <span className="text-[11px] font-black text-gray-500 leading-tight uppercase">Miễn phí<br/>vận chuyển</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500"><Zap size={20} /></div>
                  <span className="text-[11px] font-black text-gray-500 leading-tight uppercase">Giao hàng<br/>hỏa tốc</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500"><CheckCircle size={20} /></div>
                  <span className="text-[11px] font-black text-gray-500 leading-tight uppercase">Đổi trả<br/>trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT */}
        <div className="mt-16 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                THÔNG SỐ KỸ THUẬT
              </h3>
              <div className="space-y-5">
                {Object.entries(groupedAttributes).map(([name, values]) => (
                  <div key={name} className="group">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{name}</p>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                      {values.join(", ")}
                    </p>
                    <div className="mt-3 h-[1px] w-full bg-gray-50 group-last:hidden"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-8 md:p-12 rounded-[24px] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8">CÂU CHUYỆN SẢN PHẨM</h3>
              <div 
                className="prose prose-lg prose-blue max-w-none text-gray-600 leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: product.content || product.description }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}