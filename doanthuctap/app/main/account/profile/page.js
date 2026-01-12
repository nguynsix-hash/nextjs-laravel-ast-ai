"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Key, ShoppingCart, LogOut, Loader2, Edit3, Save, ShieldCheck, AtSign, Lock, Camera, XCircle, X, Package, Eye } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
                alert('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error(error);
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
            const res = await changePassword(data);
            if (res.success) {
                alert('Đổi mật khẩu thành công!');
                e.target.reset();
            } else {
                alert('Lỗi: ' + res.message);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể đổi mật khẩu'));
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        try {
            const res = await OrderService.cancel(orderId);
            if (res.success) {
                alert("Hủy đơn hàng thành công!");
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 4 } : o));
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: 4 });
                }
            } else {
                alert("Không thể hủy đơn hàng: " + res.message);
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi hủy đơn hàng: " + (error.response?.data?.message || error.message));
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
            case 1: return <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded">Chờ xử lý</span>;
            case 2: return <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded">Đã xác nhận</span>;
            case 3: return <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded">Đang giao</span>;
            case 4: return <span className="text-red-600 bg-red-100 px-2 py-1 rounded">Đã hủy</span>;
            default: return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">Không rõ</span>;
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
                            <div className="relative w-32 h-32 mb-4 group mx-auto">
                                <Image
                                    src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                    alt="Avatar" fill className="rounded-full border-4 border-white shadow-md object-cover" unoptimized
                                />
                                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition transform hover:scale-110 z-10 border-2 border-white" title="Đổi ảnh đại diện">
                                    <Camera size={18} />
                                    <input type="file" accept="image/*" onChange={(e) => { handleFileChange(e); setIsEditing(true); }} className="hidden" />
                                </label>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                            {isEditing && <p className="text-xs text-indigo-500 font-medium mb-1 animate-pulse">(Đang chỉnh sửa)</p>}
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
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><User size={14} /> Họ và tên</label>
                                            <input type="text" value={tempUser.name || ""} onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })} disabled={!isEditing} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><AtSign size={14} /> Tên đăng nhập</label>
                                            <input type="text" value={user.username || user.name?.toLowerCase().replace(/\s/g, '') || "N/A"} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><Mail size={14} /> Email</label>
                                            <input type="email" value={user.email || ""} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><Phone size={14} /> Số điện thoại</label>
                                            <input type="text" value={tempUser.phone || ""} onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })} disabled={!isEditing} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><ShieldCheck size={14} /> Vai trò</label>
                                            <input type="text" value={user.roles || "Thành viên"} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 capitalize" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2"><MapPin size={14} /> Địa chỉ (Từ đơn hàng)</label>
                                            <textarea value={tempUser.address || ""} onChange={(e) => setTempUser({ ...tempUser, address: e.target.value })} disabled={!isEditing} rows="2" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <div className="flex gap-3 pt-4">
                                            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition"><Save size={18} /> Lưu thay đổi</button>
                                            <button type="button" onClick={() => { setIsEditing(false); setTempUser(user); setAvatarFile(null); setAvatarPreview(null); }} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Hủy</button>
                                        </div>
                                    )}
                                </form>
                            </section>
                        )}

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

                        {activeTab === 'orders' && (
                            <section>
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ShoppingCart size={24} className="text-indigo-600" /> Đơn hàng đã mua</h3>
                                <div className="space-y-4">
                                    {orders.length > 0 ? orders.map((order) => (
                                        <div key={order.id}
                                            className="p-5 border border-gray-100 rounded-2xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-extrabold text-indigo-600 text-lg">#{order.id}</p>
                                                    {getStatusText(order.status)}
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2 font-medium">{order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'Mới đây'}</p>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate max-w-[200px] md:max-w-md">{order.address}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Tổng cộng</p>
                                                    <p className="font-extrabold text-gray-900 text-xl">{Number(order.total || 0).toLocaleString()}đ</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}
                                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {Number(order.status) === 1 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                                                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                                                            title="Hủy đơn"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-medium font-sans">
                                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                                            Bạn chưa thực hiện đơn hàng nào.
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
                            <div>
                                <h3 className="text-2xl font-black">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                                <p className="text-indigo-100 text-sm mt-1">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-8 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Thông tin giao hàng</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><User size={14} className="text-indigo-500" /> {selectedOrder.name}</p>
                                        <p className="text-sm text-gray-600 flex items-center gap-2"><Phone size={14} className="text-indigo-500" /> {selectedOrder.phone}</p>
                                        <p className="text-sm text-gray-600 flex items-center gap-2 items-start"><MapPin size={14} className="text-indigo-500 mt-1 shrink-0" /> {selectedOrder.address}</p>
                                    </div>
                                </div>
                                <div className="md:border-l md:pl-6 border-gray-200">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Trạng thái & Ghi chú</h4>
                                    <div className="space-y-3">
                                        <div>{getStatusText(selectedOrder.status)}</div>
                                        <p className="text-sm text-gray-500 italic bg-white p-2 rounded-lg border border-gray-100">
                                            {selectedOrder.note || "Không có ghi chú"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Package size={20} className="text-indigo-600" /> Sản phẩm đã đặt
                                </h4>
                                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-5 py-4">Sản phẩm</th>
                                                <th className="px-5 py-4 text-center">SL</th>
                                                <th className="px-5 py-4 text-right">Giá</th>
                                                <th className="px-5 py-4 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {selectedOrder.details?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg border bg-gray-100 overflow-hidden relative flex-shrink-0">
                                                                <Image
                                                                    src={item.product ? ProductService.getImageUrl(item.product.thumbnail) : 'https://placehold.co/100x100?text=No+Image'}
                                                                    alt="product" fill className="object-cover" unoptimized
                                                                />
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-800 line-clamp-1">{item.product?.name || "Sản phẩm đã xóa"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center text-sm font-medium text-gray-600">x{item.qty} x {Number(item.price).toLocaleString()}đ</td>
                                                    <td className="px-5 py-4 text-right text-sm text-gray-500">{Number(item.price).toLocaleString()}đ</td>
                                                    <td className="px-5 py-4 text-right text-sm font-bold text-indigo-600">{Number(item.amount).toLocaleString()}đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-indigo-50/50">
                                            <tr>
                                                <td colSpan="3" className="px-5 py-4 text-right font-bold text-gray-700">Tổng phí:</td>
                                                <td className="px-5 py-4 text-right font-black text-xl text-indigo-700">{Number(selectedOrder.total || 0).toLocaleString()}đ</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}