// app/main/layout.js
// SỬ DỤNG CODE TỪ LAYOUT CŨ CỦA BẠN (Đã bỏ <html>/<body>)
import Header from './header.js';
import Footer from './footer.js';
import ChatBot from '@/components/ChatBot';

// Layout này áp dụng cho tất cả các trang nằm trong thư mục main
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header component đã thiết kế */}
      <Header />

      {/* Vùng nội dung chính của các trang */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer component đã thiết kế */}
      <Footer />

      {/* ChatBot Widget */}
      <ChatBot />
    </div>
  );
}