"use client";
import {
    LayoutDashboard, Package, ShoppingBag, Percent,
    Folders, BookOpen, MessageSquare, Menu, Image,
    Users, Settings, Truck, Edit
} from 'lucide-react';

const navItems = [
    {
        name: 'Quản Lý Sản Phẩm',
        href: '/dashboard/admin/product',
        icon: Package,
        subItems: [
            { name: 'Danh sách Sản phẩm', href: '/dashboard/admin/product' },
            { name: 'Danh mục', href: '/dashboard/admin/categories' },
            { name: 'Nhập kho', href: '/dashboard/admin/inventory' },
            { name: 'Khuyến mãi', href: '/dashboard/admin/promotions' },
        ]
    },
    { name: 'Quản Lý Đơn Hàng', href: '/dashboard/admin/orders', icon: ShoppingBag },
    {
        name: 'Quản Lý Bài Viết',
        href: '/dashboard/admin/posts',
        icon: BookOpen,
        subItems: [
            { name: 'Danh sách Bài viết', href: '/dashboard/admin/posts' },
            { name: 'Chủ đề Bài viết', href: '/dashboard/admin/topics' },
        ]
    },
    { name: 'Quản Lý Menu', href: '/dashboard/admin/menus', icon: Menu },
    { name: 'Quản Lý Banner', href: '/dashboard/admin/banners', icon: Image },
    { name: 'Quản Lý Thành Viên', href: '/dashboard/admin/members', icon: Users },
    { name: 'Quản Lý Liên Hệ', href: '/dashboard/admin/contacts', icon: MessageSquare },
    { name: 'Cài Đặt Web (Settings)', href: '/dashboard/admin/settings', icon: Settings },
];

export default function Sidebar() {
    // Sử dụng state để quản lý menu mở/đóng (dropdown) nếu cần thiết, nhưng ở đây ta dùng CSS
    // const [activeSubMenu, setActiveSubMenu] = useState(null); 

    // Giả định path hiện tại để làm nổi bật menu
    const currentPath = '/dashboard/admin/products'; // Thay bằng usePathname() nếu dùng Next.js hooks

    const LinkItem = ({ item, isSub = false }) => {
        const isActive = item.href === currentPath;
        const baseClasses = isSub
            ? "flex items-center text-sm p-2 ml-4 rounded transition duration-150"
            : "flex items-center text-base p-3 rounded-lg font-medium transition duration-200";

        const activeClasses = isActive
            ? "bg-blue-700 text-white shadow-md"
            : "text-gray-300 hover:bg-gray-700";

        const IconComponent = item.icon;

        return (
            <a href={item.href} className={`${baseClasses} ${activeClasses} w-full`}>
                {IconComponent && <IconComponent size={isSub ? 16 : 20} className={isSub ? "mr-1" : "mr-3"} />}
                {item.name}
            </a>
        );
    };

    return (
        <aside className="w-64 bg-gray-800 dark:bg-gray-900 flex-shrink-0">
            <div className="h-full overflow-y-auto p-4 space-y-2">

                {navItems.map((item) => (
                    <div key={item.name} className="space-y-1">
                        {/* Mục chính */}
                        <LinkItem item={item} />

                        {/* Mục con (Dropdown) */}
                        {item.subItems && (
                            <div className="pl-2 border-l border-gray-700">
                                {item.subItems.map((subItem) => (
                                    <LinkItem key={subItem.name} item={subItem} isSub={true} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </aside>
    );
}