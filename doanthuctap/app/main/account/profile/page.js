"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Key, ShoppingCart, LogOut, Loader2, Edit3, Save, ShieldCheck, AtSign, Lock, Camera, XCircle, X, Package, Eye, MessageSquare, ChevronRight, Calendar, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

import { getUser, clearAuth } from "@/utils/auth";
import { logout, changePassword, updateProfile, me } from "@/services/AuthService";
import OrderService from "@/services/OrderService";
import ProductService from "@/services/ProductService";

export default function UserProfile() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [tempUser, setTempUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Modal Details State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Lấy thông tin user mới nhất từ Server
                let currentUser = null;
                try {
                    const userRes = await me();
                    if (userRes.success) {
                        currentUser = userRes.user;
                        const storedUser = JSON.parse(localStorage.getItem('client_user')) || {};
                        localStorage.setItem('client_user', JSON.stringify({ ...storedUser, ...currentUser }));
                        window.dispatchEvent(new Event("userUpdate"));
                    }
                } catch (err) {
                    console.warn("Token hết hạn hoặc lỗi mạng:", err);
                    if (err.response && err.response.status === 401) {
                        clearAuth();
                        router.push("/main/account/login");
                        return;
                    }
                }

                if (!currentUser) {
                    currentUser = getUser();
                }

                if (!currentUser) {
                    router.push("/main/account/login");
                    return;
                }

                // 2. Lấy danh sách đơn hàng
                const orderRes = await OrderService.getAll({ user_id: currentUser.id });
                const ordersData = orderRes.data?.data || orderRes.data || [];
                const sortedOrders = Array.isArray(ordersData) ? ordersData.sort((a, b) => b.id - a.id) : [];
                setOrders(sortedOrders);

                // 3. Lấy địa chỉ
                const latestAddress = sortedOrders.length > 0 ? (sortedOrders[0].shipping_address || sortedOrders[0].address) : "";

                const fullUserData = {
                    ...currentUser,
                    address: currentUser.address || latestAddress
                };

                setUser(fullUserData);
                setTempUser(fullUserData);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                toast.error("Không thể tải dữ liệu cá nhân");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Đang cập nhật...');
        try {
            let payload;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('name', tempUser.name);
                formData.append('phone', tempUser.phone);
                formData.append('address', tempUser.address);
                formData.append('avatar', avatarFile);
                if (tempUser.email) formData.append('email', tempUser.email);
                payload = formData;
            } else {
                payload = {
                    name: tempUser.name,
                    phone: tempUser.phone,
                    address: tempUser.address
                };
            }

            const res = await updateProfile(payload);
            if (res && res.success) {
                const newUser = res.data;
                setUser(newUser);
                setTempUser(newUser);

                const storedUser = JSON.parse(localStorage.getItem('client_user'));
                localStorage.setItem("client_user", JSON.stringify({ ...storedUser, ...newUser }));

                window.dispatchEvent(new Event("userUpdate"));

                setIsEditing(false);
                setAvatarFile(null);
                setAvatarPreview(null);
                toast.success('Cập nhật thông tin thành công!', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Cập nhật thất bại: ' + (error.response?.data?.message || error.message), { id: toastId });
        }
    };

    const handleChangePass = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Đang xử lý...');
        const data = {
            old_password: e.target.oldPassword.value,
            password: e.target.newPassword.value,
            password_confirmation: e.target.confirmPassword.value,
        };
        try {
            const res = await changePassword(data);
            if (res.success) {
                toast.success('Đổi mật khẩu thành công!', { id: toastId });
                e.target.reset();
            } else {
                toast.error('Lỗi: ' + res.message, { id: toastId });
            }
        } catch (error) {
            console.error(error);
            let msg = error.response?.data?.message || 'Không thể đổi mật khẩu';

            // Handle Laravel 422 Errors (Validation)
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstKey = Object.keys(errors)[0];
                if (firstKey && errors[firstKey][0]) {
                    msg = errors[firstKey][0];
                }
            }

            toast.error(msg, { id: toastId });
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        const toastId = toast.loading('Đang hủy đơn...');
        try {
            const res = await OrderService.cancel(orderId);
            if (res.success) {
                toast.success("Hủy đơn hàng thành công!", { id: toastId });
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 4 } : o));
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: 4 });
                }
            } else {
                toast.error("Không thể hủy đơn hàng: " + res.message, { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi hủy đơn hàng: " + (error.response?.data?.message || error.message), { id: toastId });
        }
    }

    const handleLogout = async () => {
        try { await logout(); } finally {
            clearAuth();
            router.push("/main");
        }
    };

    const getStatusText = (status) => {
        const s = Number(status);
        switch (s) {
            case 1: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ xử lý</span>;
            case 2: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Đã xác nhận</span>;
            case 3: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Đang giao</span>;
            case 4: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Đã hủy</span>;
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Không rõ</span>;
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
            <Toaster position="top-right" />

            {/* BACKGROUND DECORATION */}
            <div className="h-64 bg-gradient-to-r from-slate-900 to-slate-800 absolute top-0 left-0 w-full z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10 pt-32">
                <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

                    {/* SIDEBAR */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden sticky top-24 border border-gray-100">
                            {/* USER HEADER */}
                            <div className="bg-white p-8 pb-6 flex flex-col items-center text-center border-b border-gray-50">
                                <div className="relative w-28 h-28 mb-4 group ring-4 ring-indigo-50 rounded-full mx-auto">
                                    <Image
                                        src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                        alt="Avatar" fill className="rounded-full object-cover transition-transform duration-500 group-hover:scale-105" unoptimized
                                    />
                                    <label className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-600 transition-all z-10 border-2 border-white group-hover:scale-110">
                                        <Camera size={14} />
                                        <input type="file" accept="image/*" onChange={(e) => { handleFileChange(e); setIsEditing(true); }} className="hidden" />
                                    </label>
                                </div>
                                <h2 className="text-xl font-black text-gray-900 mb-1">{user.name}</h2>
                                <p className="text-sm text-gray-500 font-medium mb-3">{user.email}</p>
                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
                                    {user.roles === 'admin' ? 'Quản trị viên' : 'Khách hàng thân thiết'}
                                </span>
                            </div>

                            {/* NAVIGATION */}
                            <div className="p-4 space-y-1 bg-gray-50/50">
                                {[
                                    { id: 'profile', icon: User, label: 'Thông tin cá nhân' },
                                    { id: 'password', icon: Lock, label: 'Đổi mật khẩu' },
                                    { id: 'orders', icon: Package, label: 'Lịch sử đơn hàng' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center p-3.5 rounded-xl text-sm font-bold transition-all duration-200 group ${activeTab === item.id
                                            ? 'bg-white text-indigo-600 shadow-lg shadow-gray-100 text-indigo-600 ring-1 ring-gray-100'
                                            : 'text-gray-500 hover:bg-white hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon size={18} className={`mr-3 transition-colors ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        {item.label}
                                        {activeTab === item.id && <ChevronRight size={16} className="ml-auto text-indigo-400" />}
                                    </button>
                                ))}

                                <div className="my-2 border-t border-gray-200/50"></div>

                                <button onClick={() => router.push('/main/account/my-contacts')} className="w-full flex items-center p-3.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:text-gray-900 transition-all group">
                                    <MessageSquare size={18} className="mr-3 text-gray-400 group-hover:text-gray-600" /> Liên hệ của tôi
                                </button>
                                <button onClick={handleLogout} className="w-full flex items-center p-3.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-2">
                                    <LogOut size={18} className="mr-3" /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 min-h-[600px] overflow-hidden relative">

                            {/* TAB: PROFILE */}
                            {activeTab === 'profile' && (
                                <div className="p-8 md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Hồ sơ cá nhân</h3>
                                            <p className="text-gray-500 text-sm mt-1">Quản lý thông tin tài khoản và bảo mật</p>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="group flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all">
                                                <Edit3 size={16} className="group-hover:scale-110 transition" /> Chỉnh sửa
                                            </button>
                                        )}
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="group">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={12} /> Họ và tên</label>
                                                <input type="text" value={tempUser.name || ""} onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })} disabled={!isEditing}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold text-gray-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><AtSign size={12} /> Tên đăng nhập</label>
                                                <div className="w-full p-4 bg-gray-100/50 border border-gray-100 rounded-2xl font-medium text-gray-500 select-none">
                                                    {user.username || user.name?.toLowerCase().replace(/\s/g, '') || "N/A"}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Mail size={12} /> Email</label>
                                                <div className="w-full p-4 bg-gray-100/50 border border-gray-100 rounded-2xl font-medium text-gray-500 select-none cursor-not-allowed">
                                                    {user.email || "Chưa cập nhật"}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Phone size={12} /> Số điện thoại</label>
                                                <input type="text" value={tempUser.phone || ""} onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })} disabled={!isEditing}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-semibold text-gray-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-60"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={12} /> Địa chỉ (Mặc định)</label>
                                                <textarea value={tempUser.address || ""} onChange={(e) => setTempUser({ ...tempUser, address: e.target.value })} disabled={!isEditing} rows="3"
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-60 resize-none"
                                                />
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="flex gap-4 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-2 fade-in">
                                                <button type="submit" className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 hover:-translate-y-1 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                                                    <Save size={18} /> Lưu thay đổi
                                                </button>
                                                <button type="button" onClick={() => { setIsEditing(false); setTempUser(user); setAvatarFile(null); setAvatarPreview(null); }} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-all">
                                                    Hủy bỏ
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}

                            {/* TAB: PASSWORD */}
                            {activeTab === 'password' && (
                                <div className="p-8 md:p-10 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center min-h-[500px]">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                        <Key size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Đổi mật khẩu</h3>
                                    <p className="text-gray-500 text-center max-w-sm mb-8">Vui lòng sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>

                                    <form onSubmit={handleChangePass} className="w-full max-w-md space-y-5">
                                        <div className="relative">
                                            <input type="password" name="oldPassword" required className="peer w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-transparent" placeholder="Old" />
                                            <label className="absolute left-4 -top-2.5 text-xs font-medium text-gray-500 bg-white px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1 pointer-events-none">Mật khẩu hiện tại</label>
                                        </div>
                                        <div className="relative">
                                            <input type="password" name="newPassword" required className="peer w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-transparent" placeholder="New" />
                                            <label className="absolute left-4 -top-2.5 text-xs font-medium text-gray-500 bg-white px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1 pointer-events-none">Mật khẩu mới</label>
                                        </div>
                                        <div className="relative">
                                            <input type="password" name="confirmPassword" required className="peer w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-transparent" placeholder="Confirm" />
                                            <label className="absolute left-4 -top-2.5 text-xs font-medium text-gray-500 bg-white px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1 pointer-events-none">Xác nhận mật khẩu mới</label>
                                        </div>
                                        <button type="submit" className="w-full py-4 mt-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-xl shadow-gray-200 transition-all transform active:scale-[0.98]">
                                            Cập nhật mật khẩu
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* TAB: ORDER HISTORY */}
                            {activeTab === 'orders' && (
                                <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                            <Package size={28} className="text-indigo-600" /> Đơn hàng của tôi
                                        </h3>
                                        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{orders.length} đơn</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                        {orders.length > 0 ? orders.map((order) => (
                                            <div key={order.id}
                                                className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300 cursor-pointer"
                                                onClick={() => handleViewDetails(order)}
                                            >
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">#{order.id}</div>
                                                            {getStatusText(order.status)}
                                                            <span className="text-xs text-gray-400 font-medium ml-auto md:ml-0 flex items-center gap-1"><Calendar size={12} /> {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                        </div>
                                                        <div className="flex gap-2 items-start">
                                                            <MapPin size={16} className="text-gray-300 mt-1 shrink-0" />
                                                            <p className="text-sm text-gray-600 font-medium line-clamp-1">{order.address}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-1 pl-4 md:border-l border-gray-100">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</span>
                                                        <span className="text-lg font-black text-indigo-600">{Number(order.total || 0).toLocaleString()}đ</span>
                                                    </div>
                                                </div>

                                                <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center h-[400px] text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                                    <Package size={32} className="text-gray-400" />
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h4>
                                                <p className="text-gray-500 mb-6 max-w-xs">Hãy khám phá các sản phẩm công nghệ tuyệt vời của chúng tôi ngay!</p>
                                                <button onClick={() => router.push('/main/product')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                                    Mua sắm ngay
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG - PRO MAX */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 transform border border-white/20">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="relative z-10">
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Chi tiết đơn hàng</p>
                                <h3 className="text-3xl font-black">#{selectedOrder.id}</h3>
                                <div className="flex items-center gap-2 mt-2 opacity-80 text-sm">
                                    <Calendar size={14} /> {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-md">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gray-50/50">
                            {/* Order Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                        <User size={18} /> <h4 className="font-bold text-gray-900">Người nhận</h4>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600 pl-1">
                                        <p className="font-bold text-gray-800 text-base">{selectedOrder.name}</p>
                                        <p>{selectedOrder.phone}</p>
                                        <p className="leading-relaxed text-gray-500 text-xs mt-2 bg-gray-50 p-2 rounded-lg">{selectedOrder.address}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                            <CreditCard size={18} /> <h4 className="font-bold text-gray-900">Thông tin đơn</h4>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-500">Trạng thái</span>
                                            {getStatusText(selectedOrder.status)}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Ghi chú</span>
                                            <span className="text-xs text-gray-800 font-medium italic truncate max-w-[150px]">{selectedOrder.note || "Trống"}</span>
                                        </div>
                                    </div>

                                    {Number(selectedOrder.status) === 1 && (
                                        <button
                                            onClick={() => handleCancelOrder(selectedOrder.id)}
                                            className="w-full mt-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> Hủy đơn hàng này
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Product List */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package size={18} className="text-indigo-600" /> Sản phẩm
                                </h4>
                                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="divide-y divide-gray-50">
                                        {selectedOrder.details?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                    <Image
                                                        src={item.product ? ProductService.getImageUrl(item.product.thumbnail) : 'https://placehold.co/100x100?text=No+Image'}
                                                        alt="product" width={64} height={64} className="object-cover w-full h-full" unoptimized
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-gray-900 text-sm truncate">{item.product?.name || "Sản phẩm đã xóa"}</h5>
                                                    <p className="text-xs text-gray-500 mt-0.5">SL: <b className="text-gray-900">{item.qty}</b> x {Number(item.price).toLocaleString()}đ</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-indigo-600 text-sm">{Number(item.amount).toLocaleString()}đ</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-100">
                                        <span className="font-bold text-gray-500 text-sm uppercase">Tổng thành tiền</span>
                                        <span className="text-2xl font-black text-gray-900 tracking-tight">{Number(selectedOrder.total || 0).toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}