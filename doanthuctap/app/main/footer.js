import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, Zap } from 'lucide-react';

// Danh mục liên kết
const aboutLinks = [
  { name: 'Giới thiệu (About Us)', href: '/main/pages/about' },
  { name: 'Liên hệ', href: '/main/contact' },
  { name: 'Chính sách bảo mật', href: '/main/pages/privacy-policy' },
  { name: 'Điều khoản sử dụng', href: '/main/pages/terms' },
];

// Hỗ trợ khách hàng
const supportLinks = [
  { name: 'Chính sách đổi trả', href: '/main/pages/return-policy' },
  { name: 'Hướng dẫn mua hàng', href: '/main/pages/buying-guide' },
  { name: 'Phương thức thanh toán', href: '/main/pages/payment' },
  { name: 'Chính sách vận chuyển', href: '/main/pages/shipping' },
  { name: 'Câu hỏi thường gặp (FAQ)', href: '/main/pages/faq' },
  { name: 'Trung tâm hỗ trợ / khiếu nại', href: '/main/contact' },
  { name: 'Hướng dẫn bảo hành', href: '/main/pages/warranty' },
];

export default function Footer() {
  // Thay đổi màu nhấn từ indigo sang teal
  const accentColor = 'text-teal-400';
  const accentColorHover = 'hover:text-teal-300';
  const buttonBg = 'bg-teal-600 hover:bg-teal-700';

  return (
    // Tăng độ sâu cho nền (từ gray-800 lên gray-900)
    <footer className="bg-gray-900 text-white mt-0 shadow-lg">
      <div className="container mx-auto px-6 py-12">
        {/* Bố cục lưới 4 cột trên màn hình lớn */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-8 gap-y-12 border-b border-gray-800 pb-10">
          
          {/* Cột 1: Thông tin liên hệ và Logo */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-4xl font-extrabold flex items-center">
              <Zap size={32} className={`mr-2 ${accentColor}`} /> 
              <span className={accentColor}>ESHOP</span>
            </h3>
            <p className="text-sm text-gray-300">Công ty TNHH Thương mại Điện tử ESHOP</p>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-start">
                <MapPin size={18} className={`mr-2 min-w-4 ${accentColor}`} />
                <span>Địa chỉ: 123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh</span>
              </p>
              <p className="flex items-center">
                <Phone size={18} className={`mr-2 ${accentColor}`} />
                Hotline: **(028) 1234 5678** (8h - 22h)
              </p>
              <p className="flex items-center">
                <Mail size={18} className={`mr-2 ${accentColor}`} />
                Email: <a href="mailto:support@eshop.vn" className={`ml-1 ${accentColorHover} transition`}>support@eshop.vn</a>
              </p>
            </div>
          </div>

          {/* Cột 2: Danh mục liên kết */}
          <div>
            <h4 className={`text-lg font-bold mb-5 ${accentColor}`}>Danh mục liên kết</h4>
            <ul className="space-y-3 text-sm">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={`text-gray-400 ${accentColorHover} transition duration-300`}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h4 className={`text-lg font-bold mb-5 ${accentColor}`}>Hỗ trợ khách hàng</h4>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={`text-gray-400 ${accentColorHover} transition duration-300`}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Mạng xã hội & Chat */}
          <div>
            <h4 className={`text-lg font-bold mb-5 ${accentColor}`}>Kết nối với chúng tôi</h4>
            {/* Icons mạng xã hội */}
            <div className="flex space-x-5 mb-8">
              <a href="#" className={`text-gray-400 hover:text-blue-600 transition duration-300`} aria-label="Facebook">
                <Facebook size={26} />
              </a>
              <a href="#" className={`text-gray-400 hover:text-pink-600 transition duration-300`} aria-label="Instagram">
                <Instagram size={26} />
              </a>
              <a href="#" className={`text-gray-400 hover:text-blue-400 transition duration-300`} aria-label="Twitter">
                <Twitter size={26} />
              </a>
            </div>

            {/* Nút Chat trực tuyến nổi bật */}
            <div className={`p-4 ${buttonBg} rounded-xl text-center text-sm font-bold shadow-lg transition duration-300 cursor-pointer`}>
              <p>CHAT TRỰC TUYẾN</p>
              <p className="text-xs font-normal opacity-90">(Hỗ trợ 24/7)</p>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="text-center pt-8 text-sm text-gray-600">
          © {new Date().getFullYear()} **ESHOP**. All rights reserved. Đã đăng ký bản quyền.
        </div>
      </div>
    </footer>
  );
}