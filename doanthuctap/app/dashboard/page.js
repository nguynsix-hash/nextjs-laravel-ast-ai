import { DollarSign, ShoppingCart, Users, Layers } from 'lucide-react';

const stats = [
    { title: "Tổng Doanh Thu", value: "350.000.000 VNĐ", icon: DollarSign, color: "bg-green-500/10 text-green-600" },
    { title: "Đơn Hàng Mới", value: "48 Đơn", icon: ShoppingCart, color: "bg-blue-500/10 text-blue-600" },
    { title: "Thành Viên Đăng Ký", value: "2,450", icon: Users, color: "bg-purple-500/10 text-purple-600" },
    { title: "Sản Phẩm Tồn Kho", value: "1,200", icon: Layers, color: "bg-orange-500/10 text-orange-600" },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center justify-between transition duration-300 hover:shadow-xl">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h2>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

export default function DashboardPage() {
    return (
        <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Tổng Quan Dashboard</h1>
            
            {/* Thẻ thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Phần biểu đồ/tin tức */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Biểu đồ Doanh thu (Placeholder) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-96">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Biểu đồ Doanh thu tuần qua</h2>
                    <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded">
                        [Placeholder cho Biểu đồ]
                    </div>
                </div>

                {/* Hoạt động gần đây */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Hoạt động gần đây</h2>
                    <ul className="space-y-4">
                        <li className="text-sm text-gray-700 dark:text-gray-300">
                            📦 Đơn hàng **#1203** đã được giao thành công.
                        </li>
                        <li className="text-sm text-gray-700 dark:text-gray-300">
                            📝 Bài viết mới: **"Top 5 Laptop Gaming..."** đã được đăng.
                        </li>
                        <li className="text-sm text-gray-700 dark:text-gray-300">
                            💰 Phiếu nhập kho **IPH-2025** đã được tạo.
                        </li>
                        <li className="text-sm text-gray-700 dark:text-gray-300">
                            👤 Thành viên **Jane Doe** đã đăng ký.
                        </li>
                    </ul>
                </div>

            </div>
        </>
    );
}