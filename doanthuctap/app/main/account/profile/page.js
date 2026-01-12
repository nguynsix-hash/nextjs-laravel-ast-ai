"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Key, ShoppingCart, LogOut, Loader2, Edit3, Save, ShieldCheck, AtSign, Lock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { getUser, clearAuth } from "@/utils/auth";
import { logout, changePassword, updateProfile } from "@/services/AuthService";
import OrderService from "@/services/OrderService";

export default function UserProfile() {
    const router = useRouter();
    
    const [user, setUser] = useState(null);
    const [tempUser, setTempUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const currentUser = getUser();
                if (!currentUser) {
                    router.push("/main/account/login");
                    return;
                }

                // Lấy danh sách đơn hàng để trích xuất địa chỉ
                const orderRes = await OrderService.getAll();
                const ordersData = orderRes.data?.data || orderRes.data || [];
                setOrders(Array.isArray(ordersData) ? ordersData : []);

                // Lấy địa chỉ từ đơn hàng mới nhất
                const latestAddress = ordersData.length > 0 ? (ordersData[0].shipping_address || ordersData[0].address) : "";

                const fullUserData = {
                    ...currentUser,
                    address: currentUser.address || latestAddress || "Chưa có địa chỉ"
                };

                setUser(fullUserData);
                setTempUser(fullUserData);
                
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await updateProfile(tempUser);
            if (res) {
                setUser(tempUser);
                localStorage.setItem("user", JSON.stringify(tempUser));
                setIsEditing(false);
                alert('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            alert('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleChangePass = async (e) => {
        e.preventDefault();
        const data = {
            old_password: e.target.oldPassword.value,
            password: e.target.newPassword.value,
            password_confirmation: e.target.confirmPassword.value,
        };
        try {
            await changePassword(data);
            alert('Đổi mật khẩu thành công!');
            e.target.reset();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể đổi mật khẩu'));
        }
    };

    const handleLogout = async () => {
        try { await logout(); } finally {
            clearAuth();
            router.push("/main");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* SIDEBAR */}
                    <div className="lg:w-1/3 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 mb-4">
                                <Image
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                    alt="Avatar" fill className="rounded-full border-4 border-white shadow-md object-cover" unoptimized
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                            <span className="mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                {user.roles || 'Khách hàng'}
                            </span>
                        </div>

                        <div className="mt-8 space-y-2">
                            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center p-4 rounded-2xl transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <User size={20} className="mr-3" /> Hồ sơ cá nhân
                            </button>
                            <button onClick={() => setActiveTab('password')} className={`w-full flex items-center p-4 rounded-2xl transition ${activeTab === 'password' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Lock size={20} className="mr-3" /> Đổi mật khẩu
                            </button>
                            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center p-4 rounded-2xl transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <ShoppingCart size={20} className="mr-3" /> Lịch sử mua hàng
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center p-4 rounded-2xl text-red-500 hover:bg-red-50 mt-4 font-semibold">
                                <LogOut size={20} className="mr-3" /> Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="lg:w-2/3 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        {/* TAB PROFILE */}
                        {activeTab === 'profile' && (
                            <section>
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-800">Thông tin chi tiết</h3>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="text-indigo-600 flex items-center gap-1 hover:underline">
                                            <Edit3 size={16} /> Chỉnh sửa
                                        </button>
                                    )}
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><User size={14}/> Họ và tên</label>
                                            <input type="text" value={tempUser.name || ""} onChange={(e) => setTempUser({...tempUser, name: e.target.value})} disabled={!isEditing} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><AtSign size={14}/> Tên đăng nhập</label>
                                            <input type="text" value={user.username || user.name?.toLowerCase().replace(/\s/g, '') || "N/A"} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><Mail size={14}/> Email</label>
                                            <input type="email" value={user.email || ""} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><Phone size={14}/> Số điện thoại</label>
                                            <input type="text" value={tempUser.phone || ""} onChange={(e) => setTempUser({...tempUser, phone: e.target.value})} disabled={!isEditing} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><ShieldCheck size={14}/> Vai trò</label>
                                            <input type="text" value={user.roles || "Thành viên"} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 capitalize" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><MapPin size={14}/> Địa chỉ (Từ đơn hàng)</label>
                                            <textarea value={tempUser.address || ""} onChange={(e) => setTempUser({...tempUser, address: e.target.value})} disabled={!isEditing} rows="2" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <div className="flex gap-3 pt-4">
                                            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition"><Save size={18} /> Lưu thay đổi</button>
                                            <button type="button" onClick={() => {setIsEditing(false); setTempUser(user);}} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Hủy</button>
                                        </div>
                                    )}
                                </form>
                            </section>
                        )}

                        {/* TAB PASSWORD */}
                        {activeTab === 'password' && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2"><Key size={24} className="text-indigo-600" /> Đổi mật khẩu bảo mật</h3>
                                <form onSubmit={handleChangePass} className="space-y-5 max-w-md">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-2 block">Mật khẩu hiện tại</label>
                                        <input type="password" name="oldPassword" required className="w-full p-3 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-2 block">Mật khẩu mới</label>
                                        <input type="password" name="newPassword" required className="w-full p-3 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition" placeholder="Tối thiểu 6 ký tự" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-2 block">Xác nhận mật khẩu mới</label>
                                        <input type="password" name="confirmPassword" required className="w-full p-3 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition" placeholder="••••••••" />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">Cập nhật mật khẩu mới</button>
                                </form>
                            </section>
                        )}

                        {/* TAB ORDERS */}
                        {activeTab === 'orders' && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ShoppingCart size={24} className="text-indigo-600" /> Đơn hàng đã mua</h3>
                                <div className="space-y-4">
                                    {orders.length > 0 ? orders.map((order) => (
                                        <div key={order.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-200 transition">
                                            <div>
                                                <p className="font-bold text-indigo-600 text-lg">#{order.id}</p>
                                                <p className="text-xs text-gray-500 mb-2">{order.created_at || 'Mới đây'}</p>
                                                <p className="text-sm text-gray-600 line-clamp-1"><MapPin size={12} className="inline mr-1 text-gray-400"/>{order.shipping_address || order.address || 'Địa chỉ mặc định'}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <p className="font-bold text-gray-900 text-lg">{Number(order.total).toLocaleString()}đ</p>
                                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-medium">Bạn chưa thực hiện đơn hàng nào.</div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}