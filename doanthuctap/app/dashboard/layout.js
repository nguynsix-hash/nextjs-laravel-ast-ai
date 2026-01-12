"use client";
// Dùng đường dẫn tương đối './' vì các file header, footer, sidebar nằm cùng cấp
import Header from './header';
import Footer from './footer';
import Sidebar from './sidebar';
// 👉 Bước 1: Import Toaster
import { Toaster } from 'react-hot-toast';

// Layout này áp dụng cho tất cả các trang nằm trong thư mục dashboard
export default function DashboardLayout({ children }) {
    return (
        // Đảm bảo toàn bộ ứng dụng chiếm ít nhất 100% chiều cao màn hình
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-zinc-900">

            {/* 👉 Bước 2: Thêm component Toaster để "lắng nghe" các lệnh toast.success/error */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />

            {/* 1. Header component (Sticky Top) */}
            <Header />

            {/* 2. Main Container: Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">

                {/* 2.1. Sidebar (Fixed width, Scrollable) */}
                <Sidebar />

                {/* 2.2. Content Area */}
                <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto">

                    {/* Nội dung chính của các trang (page.js) */}
                    <div className="flex-grow p-6">
                        {children}
                    </div>

                    {/* 3. Footer component (Bottom of content) */}
                    <Footer />
                </main>
            </div>

        </div>
    );
}