"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Truck, MapPin, CreditCard, Mail, Phone, User, CheckCircle, Zap, ShoppingCart, Loader2, Home, Tag, Send, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CartService from '@/services/CartService';
import OrderService from '@/services/OrderService';
import ProductService from '@/services/ProductService';
import AuthService from '@/services/AuthService';

// Components cơ bản (để tránh lỗi import nếu chưa có)
const Image = ({ src, alt, className }) => <img src={src} alt={alt} className={className} loading="lazy" />;
const Link = ({ href, children, className }) => <a href={href} className={className}>{children}</a>;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function CheckoutPage() {
    const router = useRouter();

    // STATE
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);

    // Form State
    const [recipient, setRecipient] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');

    // 1. Load Cart & User Info
    useEffect(() => {
        // Load Cart
        const items = CartService.getCart();
        setCartItems(items);
        setLoading(false);

        // Load User Info nếu đã login
        const loadUserInfo = async () => {
            try {
                // Giả sử có hàm lấy user từ localStorage hoặc API
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    setRecipient(prev => ({
                        ...prev,
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '', // Nếu user có trường phone
                        address: user.address || '' // Nếu user có trường address
                    }));
                }
            } catch (e) {
                console.error("Error loading user info", e);
            }
        };
        loadUserInfo();

    }, []);

    // Tính toán tổng tiền (Khớp logic với trang Giỏ hàng)
    const cartTotals = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const shippingFee = subtotal > 2000000 ? 0 : (subtotal > 0 ? 30000 : 0);
        const discount = 0; // Tạm thời chưa có mã giảm giá thực tế
        const total = subtotal + shippingFee - discount;
        return { subtotal, shippingFee, discount, total };
    }, [cartItems]);

    // Handle Input Change
    const handleRecipientChange = (e) => {
        const { name, value } = e.target;
        setRecipient(prev => ({ ...prev, [name]: value }));
    };

    // SUBMIT ORDER
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert("Giỏ hàng đang trống!");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Chuẩn bị payload gửi lên OrderService.create()
            // Backend yêu cầu: user_id (opt), name, email, phone, address, note, status, details[]

            // Lấy user_id nếu có
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user ? user.id : null;

            const payload = {
                user_id: userId,
                name: recipient.name,
                email: recipient.email,
                phone: recipient.phone,
                address: recipient.address,
                note: recipient.note,
                status: 1, // 1 = Chờ xử lý
                details: cartItems.map(item => ({
                    product_id: item.id,
                    price: item.price,
                    qty: item.quantity,
                    discount: 0 // Tạm thời 0
                }))
            };

            // 2. Gọi API
            const res = await OrderService.create(payload);

            if (res && res.success) {
                // 3. Xử lý thành công
                console.log("Order created:", res.data);

                // Xóa giỏ hàng
                CartService.clearCart();

                // Set state thành công
                setCreatedOrderId(res.data.id); // Lấy ID thật từ backend
                setOrderSuccess(true);
            } else {
                alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
            }

        } catch (error) {
            console.error("Place order error:", error);
            const msg = error.response?.data?.message || "Lỗi kết nối máy chủ";
            const errors = error.response?.data?.errors;
            if (errors) {
                // Hiển thị lỗi chi tiết từ backend (ví dụ: validation)
                const errorText = Object.values(errors).flat().join('\n');
                alert(`Lỗi: ${msg}\n${errorText}`);
            } else {
                alert(`Lỗi: ${msg}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Render Loading
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    // Render Success Page
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center font-sans">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="bg-white p-8 md:p-16 rounded-3xl shadow-3xl border-t-8 border-green-500">
                        <CheckCircle size={96} className="text-green-500 mx-auto mb-8" />
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">🎉 ĐẶT HÀNG THÀNH CÔNG!</h2>
                        <p className="text-xl text-indigo-600 font-semibold mb-6">
                            Mã đơn hàng của bạn là: <span className="text-red-500 bg-red-50 px-3 py-1 rounded-lg">#{createdOrderId}</span>
                        </p>
                        <p className="text-gray-700 mb-8 max-w-xl mx-auto">
                            Cảm ơn bạn đã tin tưởng ESHOP. Đơn hàng của bạn đang được xử lý.
                            Chúng tôi sẽ liên hệ sớm nhất để xác nhận.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => router.push('/main')}
                                className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition duration-300 shadow-xl"
                            >
                                <Home size={20} className="mr-2" /> Quay về Trang chủ
                            </button>
                            {/* Nếu có trang lịch sử đơn hàng */}
                            <button
                                onClick={() => router.push('/main/account/profile')} // Điều hướng về profile để xem đơn hàng
                                className="inline-flex items-center justify-center px-8 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition duration-300"
                            >
                                <ShoppingBag size={20} className="mr-2" /> Xem Đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        // Nếu reload trang mà giỏ hàng rỗng (đã xóa xong hoặc chưa mua gì)
        return (
            <div className="min-h-screen bg-gray-50 py-20 flex flex-col items-center justify-center">
                <ShoppingCart size={64} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào để thanh toán.</p>
                <button
                    onClick={() => router.push('/main/product')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                    Mua sắm ngay
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10 flex items-center pb-2 border-b-2 border-indigo-100">
                    <Zap size={36} className="text-indigo-600 mr-3" /> Xác Nhận Thanh Toán
                </h1>

                <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">

                    {/* --- LEFT COLUMN: INFO & PAYMENT --- */}
                    <div className="lg:w-7/12 space-y-8">

                        {/* 1. Recipient Info */}
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
                                    <textarea name="note" value={recipient.note} onChange={handleRecipientChange} rows="2" placeholder="Ví dụ: Giao ngoài giờ hành chính..." className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm" />
                                </label>
                            </div>
                        </div>

                        {/* 2. Payment Method */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3 text-indigo-600">
                                <CreditCard size={24} className="mr-2" /> 2. Hình thức Thanh toán
                            </h2>
                            <div className="space-y-4">
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition duration-150 ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio h-5 w-5 text-green-600 border-green-500 focus:ring-green-500" />
                                    <div className="ml-4">
                                        <p className="font-semibold text-lg text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-sm text-gray-500">Thanh toán tiền mặt khi giao hàng.</p>
                                    </div>
                                </label>
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition duration-150 ${paymentMethod === 'transfer' ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="paymentMethod" value="transfer" checked={paymentMethod === 'transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio h-5 w-5 text-green-600 border-green-500 focus:ring-green-500" />
                                    <div className="ml-4">
                                        <p className="font-semibold text-lg text-gray-800">Chuyển khoản ngân hàng</p>
                                        <p className="text-sm text-gray-500">Chuyển khoản trước để được ưu tiên xử lý.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
                    <div className="lg:w-5/12 space-y-6">

                        {/* 3. Cart Summary */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3 text-indigo-600">
                                <ShoppingCart size={24} className="mr-2" /> Đơn hàng ({cartItems.length} sản phẩm)
                            </h2>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center">
                                            <div className="relative w-12 h-12 mr-4 flex-shrink-0 border rounded-md overflow-hidden bg-gray-100">
                                                <Image
                                                    src={ProductService.getImageUrl(item.thumbnail)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className='flex-grow max-w-[150px]'>
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1" title={item.name}>{item.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">SL: <span className='font-semibold'>{item.quantity}</span></p>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <span className="block text-sm font-bold text-red-600">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-right pt-4 border-t mt-4">
                                <a href="/main/cart" className="text-indigo-500 text-sm font-medium hover:text-indigo-700 transition duration-150 flex items-center justify-end">
                                    <span className="mr-1">←</span> Chỉnh sửa Giỏ hàng
                                </a>
                            </div>
                        </div>

                        {/* 4. Totals */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3 text-indigo-600">
                                Tổng kết Chi phí
                            </h2>
                            <div className="space-y-3 text-gray-700">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span className='font-medium'>{formatCurrency(cartTotals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center"><Truck size={16} className="mr-1 text-indigo-500" /> Phí vận chuyển:</span>
                                    <span className="font-medium text-green-600">
                                        {cartTotals.shippingFee === 0 ? "MIỄN PHÍ" : formatCurrency(cartTotals.shippingFee)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-3xl font-extrabold pt-4 border-t-2 border-red-500 text-red-600">
                                    <span>TỔNG CỘNG:</span>
                                    <span>{formatCurrency(cartTotals.total)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`mt-6 w-full flex items-center justify-center px-6 py-4 border border-transparent text-xl font-bold rounded-2xl shadow-lg transition duration-300 transform hover:scale-[1.01] ${isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span className="flex items-center">
                                        <Loader2 size={24} className="animate-spin -ml-1 mr-3 text-white" />
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    <span className='flex items-center'>
                                        <Send size={24} className="mr-2" /> XÁC NHẬN ĐẶT HÀNG
                                    </span>
                                )}
                            </button>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Bằng cách đặt hàng, bạn đồng ý với Điều khoản của chúng tôi.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}