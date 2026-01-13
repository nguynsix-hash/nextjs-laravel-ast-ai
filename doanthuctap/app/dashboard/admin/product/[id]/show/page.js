"use client";

import React, { useEffect, useState } from "react";
// Sử dụng useParams để lấy ID nếu bạn đang dùng Next.js App Router
import { useParams, useRouter } from "next/navigation";
// Nhập ProductService (đã chứa getImageUrl)
import ProductService from "../../../../../../services/ProductService";
// Icon từ lucide-react (hoặc thư viện icon bạn đang dùng)
import { Loader2, ArrowLeft, Tag, DollarSign, Package } from "lucide-react";

// Hàm định dạng tiền tệ (Giữ nguyên)
const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("vi-VN") + " ₫";
};

// Lấy hàm getImageUrl từ ProductService để sử dụng trực tiếp trong component
// Đặt bên ngoài component để tránh khởi tạo lại không cần thiết
const getImageUrl = ProductService.getImageUrl;


export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await ProductService.getById(id);
        // Giả định data sản phẩm nằm trong res.data.data
        setProduct(res.data?.data || res.data);
      } catch (err) {
        console.error("Fetch product detail error:", err);
        setError(err?.message || "Không thể tải sản phẩm. Vui lòng kiểm tra ID và kết nối API.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // --- HIỂN THỊ TRẠNG THÁI LOADING/ERROR ---
  if (loading) return (
    <div className="flex items-center justify-center p-10 bg-gray-50 min-h-screen">
      <div className="text-xl text-blue-600 font-extrabold flex items-center p-6 bg-white rounded-xl shadow-lg">
        <Loader2 className="animate-spin h-6 w-6 mr-3" /> Đang tải chi tiết sản phẩm...
      </div>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center text-xl text-red-700 font-extrabold bg-red-50 rounded-xl m-8 border border-red-300">
      ❌ LỖI: {error}
    </div>
  );

  if (!product) return (
    <div className="p-10 text-center text-xl text-gray-700 font-bold">
      Không tìm thấy sản phẩm với ID: {id}
    </div>
  );

  // Xử lý logic để lấy URL hình ảnh đại diện: 
  // Ưu tiên thumbnail nếu có, nếu không thì lấy ảnh đầu tiên trong mảng images.
  const primaryImageUrl = product.thumbnail
    ? getImageUrl(product.thumbnail)
    : product.images?.[0]?.url
      ? getImageUrl(product.images[0].url)
      : null;


  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header: Title & Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => router.push("/dashboard/admin/product")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold"
        >
          <ArrowLeft size={20} /> Quay lại danh sách
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/dashboard/admin/product/${id}/edit`)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-5 py-2 rounded-lg font-bold shadow-sm transition"
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Xác nhận xóa sản phẩm: ${product.name}?`)) {
                // Gọi API xóa ở đây hoặc chuyển hướng xử lý sau
                alert("Chức năng xóa cần tích hợp API delete!");
              }
            }}
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2 rounded-lg font-bold shadow-sm transition"
          >
            🗑️ Xóa
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        <div className="grid grid-cols-1 lg:grid-cols-3">

          {/* LEFT COLUMN: IMAGES */}
          <div className="lg:col-span-1 p-6 bg-gray-50 border-r border-gray-100">
            {/* Main Image */}
            <div className="aspect-square w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 relative group">
              {primaryImageUrl ? (
                <img
                  src={primaryImageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={48} opacity={0.5} />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {(product.images || []).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Thư viện ảnh</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-500 transition">
                      <img
                        src={getImageUrl(img.url || img.image)}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: INFO */}
          <div className="lg:col-span-2 p-8">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
                {product.category?.name || "Uncategorized"}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              {/* SLUG DISPLAY */}
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                <span className="font-semibold">Slug:</span>
                <code className="text-blue-600">{product.slug || "---"}</code>
              </div>

              {/* Price & Stock Row */}
              <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-100">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">Giá bán</p>
                  <div className="text-3xl font-extrabold text-green-600 flex items-baseline gap-1">
                    {formatCurrency(product.price_buy)}
                    {/* Hiển thị giá gốc/sale nếu có logic đó sau này */}
                  </div>
                </div>
                <div className="hidden md:block w-px bg-gray-200"></div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">Tồn kho</p>
                  <div className="text-3xl font-extrabold text-gray-800">
                    {product.store?.qty ?? 0} <span className="text-base font-normal text-gray-400">sp</span>
                  </div>
                </div>
              </div>

              {/* Attributes Section */}
              {(product.attributes || []).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    🧩 Thuộc tính
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.attributes.map((attr, idx) => {
                      // Backend đã fix, lấy trực tiếp attribute.name
                      const name = attr.attribute?.name || "Thuộc tính";
                      return (
                        <div key={idx} className="flex flex-col bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 min-w-[100px]">
                          <span className="text-xs font-bold text-gray-500 uppercase">{name}</span>
                          <span className="text-gray-900 font-bold">{attr.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sales/Promotion Section */}
              {(product.sales || []).length > 0 && (
                <div className="mb-8 bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                    🎁 Khuyến mãi
                  </h3>
                  <ul className="space-y-1">
                    {product.sales.map((sale, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-purple-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        {sale.name} <span className="bg-purple-200 text-purple-800 text-xs px-2 py-0.5 rounded-full font-bold">-{sale.discount}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Descriptions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Mô tả ngắn</h3>
                  <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                    {product.description || "Chưa có mô tả ngắn."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Chi tiết sản phẩm</h3>
                  <div
                    className="prose max-w-none text-gray-700 bg-white"
                    dangerouslySetInnerHTML={{ __html: product.content || "<p class='text-gray-400'>Chưa có nội dung chi tiết.</p>" }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
                /* Custom scrollbar if needed, or other specific styles */
            `}</style>
    </div>
  );
}

// --- CÁC COMPONENTS CON ĐỂ TÁI SỬ DỤNG GIAO DIỆN ---

const InfoBox = ({ icon, title, children }) => (
  <div className="flex items-center space-x-3 bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md">
    <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">{children}</p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="Section-Container bg-white dark:bg-gray-800">
    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 border-b pb-2 border-gray-100 dark:border-gray-700/50">
      {title}
    </h2>
    {children}
  </div>
);