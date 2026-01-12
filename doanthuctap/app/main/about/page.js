"use client";

import React from 'react';
// Import các icon cần thiết
import { Zap, Target, Eye, Truck, Star, Clock, Heart, Users, ArrowRight, TrendingUp } from 'lucide-react';

// --- Dữ liệu tĩnh cho trang About ---
const CORE_VALUES = [
  { 
    title: 'Tin Cậy & Minh Bạch', 
    description: 'Cam kết 100% sản phẩm chính hãng và thông tin giá cả rõ ràng, đặt sự chân thật lên hàng đầu.', 
    icon: Star,
    color: 'text-yellow-500' 
  },
  { 
    title: 'Khách Hàng Là Trọng Tâm', 
    description: 'Luôn lắng nghe, thấu hiểu và nỗ lực vượt mong đợi để mang lại sự hài lòng tối đa cho mọi giao dịch.', 
    icon: Heart,
    color: 'text-red-500' 
  },
  { 
    title: 'Đổi Mới Không Ngừng', 
    description: 'Liên tục cải tiến công nghệ, quy trình và dịch vụ để tối ưu hóa trải nghiệm mua sắm trực tuyến.', 
    icon: TrendingUp,
    color: 'text-green-500' 
  },
  { 
    title: 'Tinh Thần Đồng Đội', 
    description: 'Xây dựng môi trường làm việc chuyên nghiệp, hợp tác, tôn trọng và hỗ trợ lẫn nhau.', 
    icon: Users,
    color: 'text-indigo-500' 
  },
];

const HISTORY_MILESTONES = [
  { year: 2021, title: 'Thành lập và Định hình', description: 'ESHOP chính thức được thành lập, tập trung ban đầu vào ngành hàng Thời trang và Phụ kiện.' },
  { year: 2022, title: 'Mở rộng quy mô', description: 'Mở rộng danh mục sang ngành Điện tử và Gia dụng. Đạt mốc 100.000 khách hàng đầu tiên.' },
  { year: 2023, title: 'Tối ưu Dịch vụ', description: 'Triển khai Trung tâm Hỗ trợ Khách hàng 24/7. Áp dụng hệ thống logistics thông minh, giảm 30% thời gian giao hàng.' },
  { year: 'Hiện tại', title: 'Vị thế hàng đầu', description: 'Phục vụ hàng trăm ngàn khách hàng trên toàn quốc, hợp tác với hơn 500 thương hiệu chính hãng.' },
];

// --- Component Card cho Giá Trị Cốt Lõi ---
const ValueCard = ({ value }) => {
    const Icon = value.icon;
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gray-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <Icon className={`h-10 w-10 ${value.color} mb-3`} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
            <p className="text-sm text-gray-500">{value.description}</p>
        </div>
    );
};

// --- Component Chính: AboutUs ---
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-20">

        {/* 1. Header & Slogan */}
        <section className="text-center bg-blue-600/10 p-10 rounded-3xl shadow-xl">
          <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
            Giới Thiệu Về <span className="text-blue-600">ESHOP</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
            Kiến tạo trải nghiệm mua sắm trực tuyến **tin cậy, tiện lợi và đầy cảm hứng**.
          </p>
        </section>

        ---

        {/* 2. Tầm Nhìn & Sứ Mệnh */}
        <section className="grid md:grid-cols-2 gap-8">
            {/* Sứ Mệnh */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-teal-500">
                <Target className="h-8 w-8 text-teal-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">🎯 Sứ Mệnh Của Chúng Tôi</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                    ESHOP cam kết cung cấp một nền tảng thương mại điện tử nơi khách hàng được đảm bảo về **chất lượng** và **tính minh bạch**. Chúng tôi là cầu nối công bằng, giúp các thương hiệu phát triển và người tiêu dùng tiếp cận sản phẩm tốt nhất một cách **an toàn và nhanh chóng**.
                </p>
            </div>
            {/* Tầm Nhìn */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-indigo-500">
                <Eye className="h-8 w-8 text-indigo-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">💡 Tầm Nhìn Chiến Lược</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Trở thành **Nền tảng Thương mại Điện tử hàng đầu tại Việt Nam** và khu vực, được khách hàng và đối tác tin tưởng tuyệt đối nhờ vào sự **đổi mới liên tục** và **chất lượng dịch vụ vượt trội**.
                </p>
            </div>
        </section>

        ---

        {/* 3. Giá Trị Cốt Lõi */}
        <section>
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
            ✨ Giá Trị Cốt Lõi Định Hình ESHOP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {CORE_VALUES.map((value, index) => (
              <ValueCard key={index} value={value} />
            ))}
          </div>
        </section>

        ---

        {/* 4. Lịch Sử Phát Triển (Timeline) */}
        <section>
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
            🚀 Hành Trình Của ESHOP
          </h2>
          <div className="relative border-l-4 border-blue-200 ml-5 md:ml-10">
            {HISTORY_MILESTONES.map((milestone, index) => (
              <div key={index} className="mb-10 ml-6">
                <div className="absolute w-4 h-4 bg-blue-600 rounded-full mt-1.5 -left-2 md:-left-2.5 border border-white shadow-md"></div>
                <time className="mb-1 text-sm font-bold leading-none text-blue-600">{milestone.year}</time>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{milestone.title}</h3>
                <p className="text-base text-gray-600">{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        ---

        {/* 5. Cam Kết Hành Động & Kêu gọi hành động (CTA) */}
        <section className="bg-blue-600 text-white p-10 md:p-12 rounded-2xl shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-4">🤝 Cam Kết Vững Chắc</h2>
            <p className="text-xl font-light mb-8 opacity-90">
                Mọi hành động của ESHOP đều hướng tới lợi ích và trải nghiệm tốt nhất của khách hàng.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-start">
                    <Star className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1 mr-3" />
                    <div>
                        <p className="font-bold text-lg">100% Chính Hãng</p>
                        <p className="text-sm opacity-80">Kiểm duyệt nghiêm ngặt nguồn gốc sản phẩm.</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <Truck className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1 mr-3" />
                    <div>
                        <p className="font-bold text-lg">Giao Hàng Siêu Tốc</p>
                        <p className="text-sm opacity-80">Hệ thống vận chuyển tối ưu, nhanh chóng và an toàn.</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <Clock className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1 mr-3" />
                    <div>
                        <p className="font-bold text-lg">Hỗ Trợ 24/7</p>
                        <p className="text-sm opacity-80">Đội ngũ sẵn sàng tư vấn và giải quyết mọi lúc.</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-12">
                <a
                    href="/main/product"
                    className="inline-flex items-center px-10 py-4 bg-yellow-400 text-blue-900 text-xl font-extrabold rounded-full shadow-2xl hover:bg-yellow-300 transition duration-300 transform hover:scale-105"
                >
                    Khám Phá Sản Phẩm Của Chúng Tôi
                    <ArrowRight className="h-6 w-6 ml-3" />
                </a>
            </div>
        </section>

      </div>
    </div>
  );
}