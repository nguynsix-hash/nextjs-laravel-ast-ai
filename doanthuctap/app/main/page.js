"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Send, Clock, TrendingUp, Sparkles, 
  LayoutGrid, Tag, ArrowRight, ShoppingBag, Loader2,
  Eye, BadgePercent
} from 'lucide-react';
import Link from 'next/link';

// Import Services
import ProductService from '@/services/ProductService'; 
import CategoryService from '@/services/CategoryService';
import ProductSaleService from '@/services/ProductSaleService';
import PostService from '@/services/PostService';
import BannerService from '@/services/BannerService';

// --- UTILS: Format tiền tệ ---
const formatCurrency = (amount) => {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- UTILS: Tính % giảm giá ---
const calculateDiscountPercent = (priceBuy, priceSale) => {
  if (!priceBuy || !priceSale || priceBuy <= priceSale) return 0;
  return Math.round(((priceBuy - priceSale) / priceBuy) * 100);
};

// --- COMPONENT: ProductCard ---
const ProductCard = ({ product }) => {
  const isSaleData = !!product.product; 
  const productData = isSaleData ? product.product : product;

  const priceBuy = productData?.price_buy || 0;
  const priceSale = isSaleData ? (product.price_sale || 0) : null;
  
  const percent = calculateDiscountPercent(priceBuy, priceSale);
  const saleName = isSaleData ? product.name : null; 
  
  const imageUrl = ProductService.getProductThumbnailUrl(productData);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 group">
      <div className="relative h-48 sm:h-60 overflow-hidden bg-gray-50">
        {percent > 0 && (
          <div className="absolute top-2 right-2 z-20 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md">
            -{percent}%
          </div>
        )}
        {saleName && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-pink-700 to-red-600 text-white text-[10px] font-bold py-1 px-3 flex items-center gap-1">
            <BadgePercent className="h-3 w-3" />
            <span className="uppercase truncate">{saleName}</span>
          </div>
        )}
        <img
          src={imageUrl}
          alt={productData.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = `https://placehold.co/400x300/6B7280/ffffff?text=No+Image`; }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-30">
          <Link href={`/main/product/${productData.id}`} className="p-3 bg-white text-blue-600 rounded-full shadow-xl hover:bg-blue-600 hover:text-white transition transform hover:scale-110">
            <Eye className="h-5 w-5" />
          </Link>
          <button className="p-3 bg-white text-red-600 rounded-full shadow-xl hover:bg-red-600 hover:text-white transition transform hover:scale-110">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium text-gray-400 uppercase mb-1">{productData.category?.name || "Sản phẩm"}</p>
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-pink-700 transition">{productData.name}</h3>
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-red-700">{formatCurrency(priceSale || priceBuy)}</span>
          </div>
          {percent > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 line-through">{formatCurrency(priceBuy)}</span>
              <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1 rounded border border-green-100">
                Tiết kiệm {formatCurrency(priceBuy - priceSale)}
              </span>
            </div>
          )}
        </div>
        <Link href={`/main/product/${productData.id}`} className="mt-4 w-full py-2.5 bg-gray-900 text-white text-[10px] font-black rounded-lg flex items-center justify-center gap-2 hover:bg-pink-700 transition uppercase tracking-widest">
          Chi tiết sản phẩm <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

// --- COMPONENT: ArticleCard ---
const ArticleCard = ({ article }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
    <div className="h-48 overflow-hidden">
      <img src={PostService.getImageUrl(article.image)} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" onError={(e) => { e.target.src = "https://placehold.co/600x400?text=News"; }} />
    </div>
    <div className="p-5">
      <h3 className="text-lg font-extrabold text-gray-900 line-clamp-2 hover:text-blue-600 transition min-h-[3rem]">{article.title}</h3>
      <div className="flex items-center text-[10px] text-gray-500 mt-3 space-x-4">
        <span className="flex items-center"><Clock className="h-3 w-3 mr-1 text-blue-500" />{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
        <span className="flex items-center"><Send className="h-3 w-3 mr-1 text-green-500" />Admin</span>
      </div>
      <Link href={`/post/${article.slug}`} className="flex items-center text-blue-600 text-sm font-bold mt-4 hover:gap-2 transition-all">
        Đọc chi tiết <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  </div>
);

// --- MAIN PAGE ---
export default function MainHome() {
  const [allProducts, setAllProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, saleRes, postRes, bannerRes] = await Promise.all([
          ProductService.productClient({ limit: 12 }),
          CategoryService.getAll(),
          ProductSaleService.getAll({ limit: 4, status: 1 }), 
          PostService.index({ limit: 3 }),
          BannerService.index({ position: 'slideshow', status: 1 })
        ]);

        setAllProducts(prodRes?.success ? (prodRes.data.data || prodRes.data) : []);
        const cData = catRes?.success ? (catRes.data.data || catRes.data) : [];
        setCategories(cData);
        if (cData.length > 0) setActiveCategory(cData[0].name);

        setSaleProducts(saleRes?.success ? (saleRes.data.data || saleRes.data) : []);
        setPosts(postRes?.success ? (postRes.data.data || postRes.data) : []);
        setBanners(bannerRes?.success ? (bannerRes.data.data || bannerRes.data) : []);
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryProducts = useMemo(() => {
    return allProducts.filter(p => p.category?.name === activeCategory);
  }, [allProducts, activeCategory]);

  const newProducts = useMemo(() => allProducts.slice(0, 4), [allProducts]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-pink-700" />
        <p className="font-black tracking-widest text-[10px] uppercase text-gray-400 animate-pulse">Đang tải dữ liệu từ hệ thống...</p>
      </div>
    </div>
  );

  const heroBanner = banners.length > 0 ? banners[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="max-w-7xl mx-auto py-10 px-4 space-y-20">

        {/* Hero Section */}
        <section className="relative h-64 sm:h-[450px] bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex items-center p-8 sm:p-16">
          {heroBanner && (
             <div className="absolute inset-0 z-0">
                <img 
                    src={BannerService.getBannerImageUrl(heroBanner)} 
                    alt={heroBanner.name} 
                    className="w-full h-full object-cover opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent"></div>
             </div>
          )}
          <div className="relative z-10 max-w-lg text-white">
            <span className="bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg shadow-pink-500/20">
              {heroBanner ? heroBanner.name : "New Collection 2025"}
            </span>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6 uppercase tracking-tighter">
                {heroBanner?.description ? heroBanner.description : <>{'Mua sắm'} <br/><span className="text-pink-500">Thông minh</span></>}
            </h1>
            <Link href={heroBanner?.link || "/main/product"} className="inline-flex items-center px-10 py-4 bg-white text-gray-900 font-extrabold rounded-2xl hover:bg-pink-600 hover:text-white transition-all shadow-xl text-xs uppercase tracking-widest">
              Khám phá ngay <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
          <ShoppingBag className="hidden lg:block absolute right-20 h-72 w-72 text-white/5 rotate-12" />
        </section>

        {/* Flash Sale Section */}
        {saleProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-pink-100 rounded-lg"><Tag className="text-pink-700 h-6 w-6" /></div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Khuyến mãi cực hot</h2>
              <div className="ml-auto bg-red-600 text-white px-3 py-1 rounded text-[10px] font-black tracking-widest animate-pulse">ĐANG DIỄN RA</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Sản Phẩm Mới */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg"><Sparkles className="text-blue-700 h-6 w-6" /></div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Sản phẩm mới về</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Danh Mục Tabs */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-green-100 rounded-lg"><LayoutGrid className="text-green-700 h-6 w-6" /></div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Bộ sưu tập</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`flex items-center px-6 py-3 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${activeCategory === cat.name ? 'bg-pink-700 text-white border-pink-700 shadow-lg scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300'}`}>
                {cat.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.length > 0 ? (
              categoryProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-20 text-center text-gray-400 italic text-sm bg-white rounded-2xl border-2 border-dashed">Sản phẩm đang được cập nhật...</div>
            )}
          </div>
        </section>

        {/* Blog Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="text-purple-700 h-6 w-6" /></div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Blog & Lifestyle</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map(article => <ArticleCard key={article.id} article={article} />)}
          </div>
        </section>

      </div>
    </div>
  );
}