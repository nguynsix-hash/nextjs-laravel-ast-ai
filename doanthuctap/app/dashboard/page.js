"use client";
import { DollarSign, ShoppingCart, Users, Layers, TrendingUp, Package, Clock, MoreVertical, Search, Filter, Calendar, Settings, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import DashboardService from '@/services/DashboardService';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, change, trend, icon: Icon, gradient, shadow }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1 rotate-180" />}
                {change}
            </div>
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            <h2 className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{value}</h2>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        success: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        shipping: "bg-blue-100 text-blue-700",
        cancel: "bg-red-100 text-red-700"
    };
    const labels = {
        success: "Hoàn thành",
        pending: "Chờ xử lý",
        shipping: "Đang giao",
        cancel: "Đã hủy"
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export default function DashboardPage() {
    const [stats, setStats] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await DashboardService.getStats();
                if (response.success) {
                    // Cập nhật icon cho stats vì API trả về string tên icon
                    const mappedStats = response.stats.map(item => {
                        let IconComponent = DollarSign;
                        if (item.icon === 'ShoppingCart') IconComponent = ShoppingCart;
                        if (item.icon === 'Users') IconComponent = Users;
                        if (item.icon === 'Package') IconComponent = Package;

                        return { ...item, icon: IconComponent };
                    });

                    setStats(mappedStats);
                    setRecentOrders(response.recent_orders);
                }
            } catch (error) {
                console.error("Dashboard verify error:", error);
                toast.error("Không thể tải dữ liệu Dashboard");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tổng Quan</h1>
                    <p className="text-gray-500 mt-1 font-medium">Số liệu thống kê thời gian thực</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm">
                        <Calendar size={18} /> Hôm nay
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">
                        <Layers size={18} /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.length > 0 ? stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                )) : <p>Không có dữ liệu</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Chart Area (Left) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Revenue Chart Placeholder */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <DollarSign size={20} className="text-indigo-600" /> Biểu đồ doanh thu
                            </h2>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition"><MoreVertical size={20} className="text-gray-400" /></button>
                        </div>

                        {/* CSS Chart Placeholder */}
                        <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4 relative z-10">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                <div key={i} className="w-full bg-indigo-50 rounded-t-lg relative group h-full flex items-end transition-all hover:bg-indigo-100 cursor-pointer">
                                    <div style={{ height: `${h}%` }} className="w-full bg-indigo-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all shadow-lg relative">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                            {h * 1000}k
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Background Decor */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute -left-20 -top-20 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={20} className="text-indigo-600" /> Đơn hàng gần đây
                            </h2>
                            <button className="text-sm font-bold text-indigo-600 hover:underline">Xem tất cả</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 pl-6">Mã đơn</th>
                                        <th className="p-4">Khách hàng</th>
                                        <th className="p-4">Sản phẩm</th>
                                        <th className="p-4">Tổng tiền</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4">Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition cursor-pointer group">
                                            <td className="p-4 pl-6 font-bold text-gray-700">{order.id}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-gray-700">{order.customer}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">{order.product}</td>
                                            <td className="p-4 font-bold text-gray-900">{order.amount}</td>
                                            <td className="p-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="p-4 text-xs font-medium text-gray-400">{order.date}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="p-6 text-center text-gray-500">Chưa có đơn hàng nào</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Right (Activity & Quick Actions) */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl shadow-indigo-200 p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Layers size={20} /> Tác vụ nhanh</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center gap-2 transition border border-white/10 group">
                                    <Package size={24} className="group-hover:scale-110 transition" />
                                    <span className="text-xs font-bold">Thêm SP</span>
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center gap-2 transition border border-white/10 group">
                                    <ShoppingCart size={24} className="group-hover:scale-110 transition" />
                                    <span className="text-xs font-bold">Duyệt đơn</span>
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center gap-2 transition border border-white/10 group">
                                    <Users size={24} className="group-hover:scale-110 transition" />
                                    <span className="text-xs font-bold">Thành viên</span>
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center gap-2 transition border border-white/10 group">
                                    <Settings size={24} className="group-hover:scale-110 transition" />
                                    <span className="text-xs font-bold">Cấu hình</span>
                                </button>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-indigo-600" /> Hoạt động
                        </h2>
                        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                            {[
                                { text: "Đơn hàng #1234 vừa được tạo", time: "2 phút trước", icon: ShoppingCart, color: "bg-green-500" },
                                { text: "Sản phẩm iPhone 15 sắp hết hàng", time: "15 phút trước", icon: Layers, color: "bg-yellow-500" },
                                { text: "Thành viên mới đăng ký tài khoản", time: "1 giờ trước", icon: Users, color: "bg-blue-500" },
                                { text: "Đã cập nhật cấu hình hệ thống", time: "3 giờ trước", icon: Settings, color: "bg-gray-500" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-${item.color.replace('bg-', '')}/30 ring-4 ring-white`}>
                                        <item.icon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{item.text}</p>
                                        <p className="text-xs font-medium text-gray-400 mt-1">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}