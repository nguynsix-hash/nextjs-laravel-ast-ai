// app/layout.js
// Đây là file duy nhất chứa <html> và <body>

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "ESHOP - Trang Mua Sắm Chính Thức",
    description: "Công nghệ & Cuộc sống",
};

export default function RootLayout({ children }) {
    return (
        <html lang="vi">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {/* Children ở đây là toàn bộ nội dung ứng dụng, bao gồm cả MainLayout */}
                {children}
            </body>
        </html>
    );
}