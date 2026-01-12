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


  // --- GIAO DIỆN CHÍNH (Chi tiết sản phẩm) ---
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* Nút Quay Lại */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 mb-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
      >
        <ArrowLeft size={18} /> Quay lại danh sách
      </button>

      {/* Khung Chi tiết Sản phẩm */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 border-b pb-3 border-blue-100 dark:border-blue-900/50">
          {product.name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CỘT 1: HÌNH ẢNH */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl shadow-inner">

              {/* Ảnh đại diện */}
              {primaryImageUrl ? (
                <img
                  src={primaryImageUrl} // SỬ DỤNG primaryImageUrl ĐÃ XỬ LÝ
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-xl shadow-lg mb-4 border-4 border-blue-500/20"
                />
              ) : (
                <div className="w-full h-80 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-xl mb-4 text-gray-500">
                  Không có ảnh đại diện
                </div>
              )}

              {/* Danh sách ảnh phụ */}
              <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-2">Ảnh Gallery:</h3>
              <div className="flex flex-wrap gap-3">
                {(product.images || []).map((img, idx) => (
                  <img
                    key={idx}
                    // SỬ DỤNG getImageUrl CHO MỖI ẢNH PHỤ
                    src={getImageUrl(img.url || img.image)}
                    alt={`Ảnh phụ ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 transition duration-150 cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CỘT 2: THÔNG TIN CHI TIẾT (Giữ nguyên) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Box Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <InfoBox icon={<Tag className="text-blue-600 dark:text-blue-400" size={20} />} title="Danh mục">
                {product.category?.name ?? "Chưa phân loại"}
              </InfoBox>
              <InfoBox icon={<DollarSign className="text-green-600 dark:text-green-400" size={20} />} title="Giá bán">
                <span className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(product.price_buy)}</span>
              </InfoBox>
              <InfoBox icon={<Package className="text-orange-600 dark:text-orange-400" size={20} />} title="Tồn kho">
                <span className="text-xl font-bold text-orange-700 dark:text-orange-400">{product.store?.qty ?? 0}</span>
              </InfoBox>
            </div>

            {/* Mô tả */}
            <Section title="Mô tả ngắn">
              <p className="text-gray-600 dark:text-gray-300 italic">{product.description ?? "Không có mô tả ngắn."}</p>
            </Section>

            {/* Nội dung chi tiết */}
            <Section title="Nội dung chi tiết">
              <div className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: product.content || "Chưa có nội dung chi tiết." }} />
            </Section>

            {/* Thuộc tính sản phẩm (ATTRIBUTES) */}
                        {(product.attributes || []).length > 0 && (
                            <Section title="Các Thuộc tính của Sản phẩm">
                                <div className="flex flex-wrap gap-4">
                                    {(product.attributes || []).map((attr, idx) => {
                                        
                                        // LOGIC CUỐI CÙNG: Dựa trên cấu trúc DB, tên thuộc tính phải nằm trong obj "attribute"
                                        const attributeName = attr.attribute?.name || 'Chưa load tên (Thiếu eager loading)';
                                        
                                        // Dòng này giúp bạn debug chính xác đối tượng attribute bị thiếu
                                        if (!attr.attribute) {
                                            console.error(`LỖI BACKEND/EAGER LOAD: Đối tượng thuộc tính (attribute) có ID ${attr.attribute_id} bị thiếu trong JSON. Cần kiểm tra quan hệ.`);
                                            console.log("Đối tượng Product Attribute Value:", attr);
                                        }

                                        return (
                                            <div 
                                                key={idx} 
                                                className="AttributePill"
                                            >
                                                <span className="font-semibold text-blue-800 dark:text-blue-300">
                                                    {attributeName}:
                                                </span>
                                                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                                                    {attr.value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Section>
                        )}

            {/* Khuyến mãi (SALES) */}
            {(product.sales || []).length > 0 && (
              <Section title="Khuyến mãi đang áp dụng">
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                  {product.sales.map((sale, idx) => (
                    <li key={idx} className="font-medium text-purple-700 dark:text-purple-400">
                      {sale.name} - Giảm: {sale.discount}%
                    </li>
                  ))}
                </ul>
              </Section>
            )}

          </div>
        </div>

        {/* KHU VỰC HÀNH ĐỘNG */}
        <div className="flex justify-end mt-8 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push(`/dashboard/admin/product/${id}/edit`)}
            className="Action-Button bg-yellow-500 hover:bg-yellow-600"
          >
            ✏️ Sửa sản phẩm
          </button>

          <button
            onClick={() => alert(`Xác nhận xóa sản phẩm: ${product.name}?`)}
            className="Action-Button bg-red-600 hover:bg-red-700"
          >
            🗑️ Xóa sản phẩm
          </button>
        </div>
      </div>

      {/* TÁCH STYLE CHO CÁC PHẦN TỬ CHUYÊN BIỆT */}
      <style jsx>{`
                .InfoBox-content {
                    background-color: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    padding: 1rem;
                }
                .dark .InfoBox-content {
                    background-color: #1f2937;
                    border-color: #374151;
                }
                
                .AttributePill {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px; /* rounded-full */
                    background-color: #eff6ff; /* Blue 50 */
                    border: 1px solid #bfdbfe; /* Blue 200 */
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                }
                .dark .AttributePill {
                    background-color: #1e3a8a; /* Blue 900 */
                    border-color: #2563eb; /* Blue 600 */
                }

                .Section-Container {
                    padding: 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                }
                .dark .Section-Container {
                    border-color: #374151;
                }

                .Action-Button {
                    color: white;
                    padding: 0.6rem 1.5rem;
                    font-weight: 700;
                    border-radius: 0.75rem;
                    transition: background-color 0.2s, transform 0.1s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
                }
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