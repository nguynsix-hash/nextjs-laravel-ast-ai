"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
// ĐÃ THÊM ShoppingCart, Tag, Send (cho email) vào danh sách import
import { Truck, MapPin, CreditCard, Mail, Phone, User, CheckCircle, Zap, ShoppingCart, Loader2, Home, Tag, Send } from 'lucide-react'; 
// SỬ DỤNG MOCK Image và Link cho môi trường độc lập (Giả định không cần import từ Next/Image/Link)
// Nếu bạn sử dụng trong Next.js thực tế, hãy đảm bảo import Image và Link từ 'next/image' và 'next/link'

// ====================================================================
// MOCK COMPONENTS CHO MÔI TRƯỜNG ĐỘC LẬP
// ====================================================================

// Mock Next.js Image Component
const Image = ({ src, alt, layout, objectFit, className, unoptimized }) => {
    // Thay thế bằng placeholder nếu không có /images/mock...
    const finalSrc = src.startsWith('/images/mock') ? `https://placehold.co/100x100/5E4A78/ffffff?text=${alt.substring(0, 10).replace(/\s/g, '+')}` : src;
    
    return (
        <img 
            src={finalSrc} 
            alt={alt} 
            className={`w-full h-full ${className}`} 
            style={{ objectFit: objectFit || 'cover', position: 'absolute', top: 0, left: 0 }} 
            loading="lazy"
        />
    );
};

// Mock Next.js Link Component
const Link = ({ href, children, className }) => (
    <a href={href} onClick={(e) => { 
        e.preventDefault(); 
        console.log('Simulated navigation to: ' + href); 
        // Thêm logic chuyển trang nếu cần (ví dụ: window.location.href = href)
    }} className={className}>
        {children}
    </a>
);


// ====================================================================
// DỮ LIỆU VÀ HÀM TIỆN ÍCH
// ====================================================================

// Dữ liệu giả định: (Đây là dữ liệu từ giỏ hàng đã được chuyển sang)
const mockCartItems = [
    { id: 1, name: 'iPhone 15 Pro Max (256GB, Blue Titanium)', price: 30000000, quantity: 1, imageUrl: '/images/mock-phone.jpg' },
    { id: 2, name: 'MacBook Air M3 13 inch (8GB RAM, 512GB SSD)', price: 25000000, quantity: 2, imageUrl: '/images/mock-laptop.jpg' },
    { id: 3, name: 'Tai nghe Bluetooth Sony WH-1000XM5', price: 6000000, quantity: 1, imageUrl: '/images/mock-headphone.jpg' },
];

// Dữ liệu người dùng mặc định (giả định đã đăng nhập)
const mockRecipientInfo = {
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    email: 'vana@eshop.com',
    address: 'Số 123, Đường ABC, Phường 1, Quận 1, TP.HCM',
    note: '',
};

// Hàm chuyển số thành định dạng tiền tệ Việt Nam (VNĐ)
const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
};

// ====================================================================
// MAIN COMPONENT: CheckoutPage
// ====================================================================

export default function CheckoutPage() {
    const [recipient, setRecipient] = useState(mockRecipientInfo);
    const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' hoặc 'transfer'
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Tính toán tổng tiền
    const cartTotals = useMemo(() => {
        const subtotal = mockCartItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        // Phí cố định
        const shippingFee = 30000; 
        // Giảm giá (Ví dụ: 50.000 VNĐ)
        const discount = 50000;
        const total = subtotal + shippingFee - discount;
        
        return { subtotal, shippingFee, discount, total };
    }, []);

    // Xử lý Thay đổi thông tin người nhận
    const handleRecipientChange = useCallback((e) => {
        setRecipient(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    // Xử lý Thanh toán (Lưu đơn hàng và Gửi email)
    const handlePlaceOrder = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!recipient.name || !recipient.phone || !recipient.email || !recipient.address) {
            alert("Vui lòng điền đầy đủ thông tin người nhận bắt buộc.");
            return;
        }

        setIsProcessing(true);

        // --- Gửi dữ liệu đơn hàng giả định lên API ---
        const orderData = {
            items: mockCartItems,
            recipient: recipient,
            paymentMethod: paymentMethod,
            totals: cartTotals,
            timestamp: new Date().toISOString(),
            orderId: `#ESHOP${Math.floor(Math.random() * 10000) + 1000}`, // Mã đơn hàng giả định
        };

        console.log('--- DỮ LIỆU ĐƠN HÀNG ĐÃ LƯU ---', orderData);

        // Giả lập độ trễ xử lý 2 giây
        setTimeout(() => {
            setIsProcessing(false);
            
            // 1. Lưu thông tin vào hệ thống (đã mô phỏng bằng console.log)
            
            // 2. Gửi email cho khách hàng (mô phỏng)
            console.log(`[EMAIL SENT] Đã gửi email xác nhận đơn hàng ${orderData.orderId} tới ${recipient.email}`);
            
            setOrderSuccess(true);
            
        }, 2000);
    };

    // -----------------------------------------------------------
    // --- RENDER COMPONENT: SUCCESS PAGE ---
    // -----------------------------------------------------------
    
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center font-sans">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="bg-white p-8 md:p-16 rounded-3xl shadow-3xl border-t-8 border-green-500 animate-fadeIn">
                        <CheckCircle size={96} className="text-green-500 mx-auto mb-8 animate-bounceIn" />
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">🎉 ĐẶT HÀNG THÀNH CÔNG!</h2>
                        <p className="text-xl text-indigo-600 font-semibold mb-6">
                            Mã đơn hàng của bạn là: <span className="text-red-500 bg-red-50 px-3 py-1 rounded-lg">**#DH1004**</span>
                        </p>
                        <p className="text-gray-700 mb-8 max-w-xl mx-auto">
                            Cảm ơn bạn đã tin tưởng ESHOP. Đơn hàng của bạn đang được xử lý.
                            Một email xác nhận chi tiết đã được gửi tới địa chỉ **{recipient.email}**.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link 
                                href="/main" 
                                className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition duration-300 shadow-xl transform hover:scale-[1.02]"
                            >
                                <Home size={20} className="mr-2" /> Quay về Trang chủ
                            </Link>
                            <Link 
                                href="/main/order-history/DH1004" 
                                className="inline-flex items-center justify-center px-8 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition duration-300"
                            >
                                <ShoppingBag size={20} className="mr-2" /> Xem Chi tiết Đơn hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------
    // --- RENDER COMPONENT: CHECKOUT FORM ---
    // -----------------------------------------------------------
    
    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10 flex items-center pb-2 border-b-2 border-indigo-100">
                    <Zap size={36} className="text-indigo-600 mr-3" /> Xác Nhận Thanh Toán
                </h1>

                <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
                    
                    {/* --- Phần 1: Thông tin Người nhận & Thanh toán (Trái) --- */}
                    <div className="lg:w-7/12 space-y-8">
                        
                        {/* 1. Thông tin Người nhận/Giao hàng */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3 text-indigo-600">
                                <MapPin size={24} className="mr-2" /> 1. Thông tin Giao hàng
                            </h2>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700 flex items-center mb-1"><User size={16} className="mr-1 text-red-500" /> Họ và Tên <span className="text-red-500 ml-1">*</span></span>
                                        <input type="text" name="name" value={recipient.name} onChange={handleRecipientChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700 flex items-center mb-1"><Phone size={16} className="mr-1 text-red-500" /> Số điện thoại <span className="text-red-500 ml-1">*</span></span>
                                        <input type="tel" name="phone" value={recipient.phone} onChange={handleRecipientChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm" />
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700 flex items-center mb-1"><Mail size={16} className="mr-1 text-red-500" /> Email <span className="text-red-500 ml-1">*</span></span>
                                    <input type="email" name="email" value={recipient.email} onChange={handleRecipientChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm" />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700 flex items-center mb-1"><MapPin size={16} className="mr-1 text-red-500" /> Địa chỉ chi tiết <span className="text-red-500 ml-1">*</span></span>
                                    <textarea name="address" value={recipient.address} onChange={handleRecipientChange} rows="3" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm" />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700 flex items-center mb-1">Ghi chú (Tùy chọn)</span>
                                    <textarea name="note" value={recipient.note} onChange={handleRecipientChange} rows="2" placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi trước khi giao..." className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm" />
                                </label>
                            </div>
                        </div>

                        {/* 2. Hình thức Thanh toán */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3 text-indigo-600">
                                <CreditCard size={24} className="mr-2" /> 2. Hình thức Thanh toán
                            </h2>
                            
                            <div className="space-y-4">
                                {/* Thanh toán khi nhận hàng (COD) */}
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition duration-150 ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio h-5 w-5 text-green-600 border-green-500 focus:ring-green-500" />
                                    <div className="ml-4">
                                        <p className="font-semibold text-lg text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-sm text-gray-500">An toàn và tiện lợi, chỉ cần thanh toán khi hàng đến tay.</p>
                                    </div>
                                </label>

                                {/* Chuyển khoản ngân hàng */}
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition duration-150 ${paymentMethod === 'transfer' ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="paymentMethod" value="transfer" checked={paymentMethod === 'transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio h-5 w-5 text-green-600 border-green-500 focus:ring-green-500" />
                                    <div className="ml-4">
                                        <p className="font-semibold text-lg text-gray-800">Chuyển khoản ngân hàng</p>
                                        <p className="text-sm text-gray-500">Thanh toán online trước để tiết kiệm thời gian giao nhận.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* --- Phần 2: Thông tin Giỏ hàng & Tổng tiền (Phải) --- */}
                    <div className="lg:w-5/12 space-y-6">
                        
                        {/* 3. Chi tiết Giỏ hàng */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3 text-indigo-600">
                                <ShoppingCart size={24} className="mr-2" /> Đơn hàng ({mockCartItems.length} sản phẩm)
                            </h2>
                            
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                {mockCartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center">
                                            <div className="relative w-12 h-12 mr-4 flex-shrink-0 border rounded-md overflow-hidden">
                                                <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" className="rounded-md" unoptimized />
                                            </div>
                                            <div className='flex-grow'>
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">SL: <span className='font-semibold'>{item.quantity}</span> x {formatCurrency(item.price)}</p>
                                            </div>
                                        </div>
                                        <span className="text-base font-bold text-red-600 flex-shrink-0 ml-3">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Nút chỉnh sửa Giỏ hàng */}
                            <div className="text-right pt-4 border-t mt-4">
                                <Link href="/main/cart" className="text-indigo-500 text-sm font-medium hover:text-indigo-700 transition duration-150 flex items-center justify-end">
                                    <span className="mr-1">←</span> Chỉnh sửa Giỏ hàng
                                </Link>
                            </div>
                        </div>

                        {/* 4. Tổng kết Chi phí */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3 text-indigo-600">
                                Tổng kết Chi phí
                            </h2>
                            
                            <div className="space-y-3 text-gray-700">
                                <div className="flex justify-between">
                                    <span>Tạm tính ({mockCartItems.length} SP):</span>
                                    <span className='font-medium'>{formatCurrency(cartTotals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center"><Truck size={16} className="mr-1 text-indigo-500" /> Phí vận chuyển:</span>
                                    <span className="font-medium">{formatCurrency(cartTotals.shippingFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center"><Tag size={16} className="mr-1 text-green-500" /> Mã giảm giá:</span>
                                    <span className="font-medium text-green-600">- {formatCurrency(cartTotals.discount)}</span>
                                </div>
                                
                                <div className="flex justify-between text-3xl font-extrabold pt-4 border-t-2 border-red-500 text-red-600">
                                    <span>TỔNG CỘNG:</span>
                                    <span>{formatCurrency(cartTotals.total)}</span>
                                </div>
                            </div>
                            
                            {/* Nút Thanh toán */}
                            <button
                                type="submit"
                                className={`mt-6 w-full flex items-center justify-center px-6 py-4 border border-transparent text-xl font-bold rounded-2xl shadow-lg transition duration-300 transform hover:scale-[1.01] ${isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span className="flex items-center">
                                        <Loader2 size={24} className="animate-spin -ml-1 mr-3 text-white" />
                                        Đang xử lý đơn hàng...
                                    </span>
                                ) : (
                                    <span className='flex items-center'>
                                        <Send size={24} className="mr-2" /> XÁC NHẬN THANH TOÁN
                                    </span>
                                )}
                            </button>

                             {/* Lưu ý nhỏ */}
                             <p className="text-xs text-gray-400 mt-3 text-center">
                                Bằng cách nhấp vào "Xác nhận Thanh toán", bạn đồng ý với Điều khoản Dịch vụ của chúng tôi.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}