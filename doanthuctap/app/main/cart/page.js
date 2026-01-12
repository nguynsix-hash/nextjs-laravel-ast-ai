"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ShoppingCart, Trash2, Minus, Plus, Zap, Heart, Tag, ShieldCheck, CreditCard, LogIn, X, ShoppingBag, Loader2 } from 'lucide-react';
import CartService from "@/services/CartService";
import ProductService from "@/services/ProductService";

// --- Giữ nguyên các Mock Components (Image, Link, useRouter) như bạn đã viết ---
const Image = ({ src, alt, className }) => (
    <img src={src} alt={alt} className={`w-full h-full object-cover ${className}`} loading="lazy" />
);

const Link = ({ href, children, className }) => (
    <a href={href} className={className}>{children}</a>
);

// Giả lập router thực tế từ Next.js
import { useRouter } from 'next/navigation';

const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
};

// ====================================================================
// CART ITEM COMPONENT (Đã chỉnh sửa để nhận thumbnail từ ProductService)
// ====================================================================
const CartItemRow = ({ item, updateQuantity, initiateRemoveItem }) => (
    <div className="flex flex-wrap items-center py-5 border-b border-gray-100 last:border-b-0 group">
        <div className="flex items-center w-full lg:w-5/12 mb-3 lg:mb-0">
            <div className="relative w-20 h-20 mr-4 flex-shrink-0 border border-gray-200 rounded-xl overflow-hidden shadow-md">
                <Image
                    src={ProductService.getImageUrl(item.thumbnail)}
                    alt={item.name}
                />
            </div>
            <div className="flex-grow">
                <div className="text-base font-semibold text-gray-800 hover:text-indigo-600 transition duration-150 line-clamp-2 uppercase">
                    {item.name}
                </div>
                <div className="text-[11px] mt-1 space-x-2">
                    {item.color && <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">Màu: {item.color}</span>}
                    {item.size && <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">Size: {item.size}</span>}
                </div>
                <div className="lg:hidden font-bold text-indigo-600 mt-2">
                    {formatCurrency(item.price)}
                </div>
            </div>
        </div>
        
        <div className="hidden lg:block lg:w-2/12 text-center text-base font-medium text-gray-600">
            {formatCurrency(item.price)}
        </div>

        <div className="w-1/2 lg:w-3/12 flex items-center justify-start lg:justify-center mt-3 lg:mt-0">
            <div className="flex items-center border border-indigo-200 rounded-full overflow-hidden bg-white">
                <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 disabled:opacity-30"
                    disabled={item.quantity <= 1}
                >
                    <Minus size={16} />
                </button>
                <span className="px-4 py-1 w-10 text-center font-bold text-gray-800">
                    {item.quantity}
                </span>
                <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>

        <div className="w-1/2 lg:w-2/12 flex flex-col items-end lg:items-center mt-3 lg:mt-0">
            <div className="text-xl font-extrabold text-indigo-600 mb-2">
                {formatCurrency(item.price * item.quantity)}
            </div>
            <button
                onClick={() => initiateRemoveItem(item.cartItemId, item.name)}
                className="text-red-400 hover:text-red-600 text-xs flex items-center transition duration-150"
            >
                <Trash2 size={14} className="mr-1" /> Xóa bỏ
            </button>
        </div>
    </div>
);

// --- Giữ nguyên Toast Component của bạn ---
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;
    const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
    return (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl z-50 text-white flex items-center ${colors[type]}`}>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
    );
};

// ====================================================================
// MAIN COMPONENT: ShoppingCartPage
// ====================================================================
export default function ShoppingCartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]); // Khởi tạo rỗng
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info' });
    const [itemToRemove, setItemToRemove] = useState(null);

    // 1. LẤY DỮ LIỆU THẬT TỪ LOCALSTORAGE KHI LOAD TRANG
    useEffect(() => {
        const loadCart = () => {
            const data = CartService.getCart();
            setCartItems(data);
            setLoading(false);
        };
        loadCart();
        
        // Lắng nghe sự kiện update từ các tab khác hoặc từ Header
        window.addEventListener("cartUpdate", loadCart);
        return () => window.removeEventListener("cartUpdate", loadCart);
    }, []);

    // 2. CẬP NHẬT SỐ LƯỢNG VÀO LOCALSTORAGE
    const updateQuantity = useCallback((cartItemId, delta) => {
        const currentCart = CartService.getCart();
        const updatedCart = currentCart.map(item => {
            if (item.cartItemId === cartItemId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        });

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event("cartUpdate"));
    }, []);

    // 3. XÓA SẢN PHẨM KHỎI LOCALSTORAGE
    const confirmRemoveItem = useCallback(() => {
        if (!itemToRemove) return;
        const currentCart = CartService.getCart();
        const updatedCart = currentCart.filter(item => item.cartItemId !== itemToRemove.id);

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        setItemToRemove(null);
        window.dispatchEvent(new Event("cartUpdate"));
        setToast({ message: `Đã xóa sản phẩm khỏi giỏ hàng.`, type: 'success' });
    }, [itemToRemove]);

    const initiateRemoveItem = (id, name) => setItemToRemove({ id, name });

    const cartTotals = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const shippingFee = subtotal > 2000000 ? 0 : (subtotal > 0 ? 30000 : 0); 
        return { subtotal, shippingFee, total: subtotal + shippingFee };
    }, [cartItems]);

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        // Logic điều hướng thanh toán thật
        router.push('/main/cart/checkout');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    const isCartEmpty = cartItems.length === 0;

    return (
        <div className="min-h-screen bg-[#fcfcfd] py-12 md:py-20">
            <Toast {...toast} onClose={() => setToast({ message: '', type: 'info' })} />
            
            {/* Modal Confirm Delete */}
            {itemToRemove && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Xác nhận xóa?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Bạn muốn bỏ sản phẩm này khỏi giỏ hàng?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setItemToRemove(null)} className="py-3 rounded-xl border font-bold">Hủy</button>
                            <button onClick={confirmRemoveItem} className="py-3 rounded-xl bg-red-500 text-white font-bold">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-3xl font-black text-gray-900 mb-10 flex items-center uppercase tracking-tighter">
                    <ShoppingBag size={32} className="text-indigo-600 mr-3" /> 
                    Giỏ hàng của bạn 
                    <span className="ml-3 text-indigo-400 font-medium">[{cartItems.length}]</span>
                </h1>

                {isCartEmpty ? (
                    <div className="bg-white p-20 rounded-[40px] shadow-sm border text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Chưa có sản phẩm nào</h2>
                        <p className="text-gray-400 mt-2 mb-8">Giỏ hàng của bạn đang trống, hãy chọn thêm sản phẩm nhé!</p>
                        <Link href="/main/product" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 inline-block">
                            TIẾP TỤC MUA SẮM
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* DANH SÁCH BÊN TRÁI */}
                        <div className="lg:w-8/12">
                            <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm border border-gray-100">
                                <div className="divide-y divide-gray-50">
                                    {cartItems.map((item) => (
                                        <CartItemRow
                                            key={item.cartItemId}
                                            item={item}
                                            updateQuantity={updateQuantity}
                                            initiateRemoveItem={initiateRemoveItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* TỔNG KẾT BÊN PHẢI */}
                        <div className="lg:w-4/12">
                            <div className="bg-white p-8 rounded-[32px] shadow-lg border border-indigo-50 sticky top-10">
                                <h2 className="text-xl font-black mb-6 uppercase">Hóa đơn chi tiết</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Tạm tính</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(cartTotals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Phí giao hàng</span>
                                        <span className="font-bold text-green-600">
                                            {cartTotals.shippingFee === 0 ? "MIỄN PHÍ" : formatCurrency(cartTotals.shippingFee)}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t-2 border-dashed flex justify-between items-end">
                                        <span className="font-bold text-gray-900 uppercase">Tổng cộng</span>
                                        <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                                            {formatCurrency(cartTotals.total)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Zap size={20} fill="currentColor" /> THANH TOÁN NGAY
                                </button>
                                
                                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">
                                    An toàn • Bảo mật • Nhanh chóng
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}