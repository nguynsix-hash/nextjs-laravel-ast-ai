"use client";
import {
    LayoutDashboard, Package, ShoppingBag, Percent,
    Folders, BookOpen, MessageSquare, Menu, Image,
    Users, Settings, Truck, Edit, ChevronDown, ChevronRight, LogOut
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const navItems = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
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
    { name: 'Cài Đặt Web', href: '/dashboard/admin/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const LinkItem = ({ item, isSub = false }) => {
        const isActive = pathname === item.href;
        const hasSub = item.subItems && item.subItems.length > 0;
        const isOpen = openMenus[item.name];

        if (hasSub) {
            return (
                <div>
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition-all duration-200 group ${isOpen || pathname.includes(item.href) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className={`${isOpen || pathname.includes(item.href) ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-900 transition'}`} />
                            <span className="text-sm font-semibold">{item.name}</span>
                        </div>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {isOpen && (
                        <div className="ml-4 pl-4 border-l-2 border-indigo-100 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                            {item.subItems.map((sub) => (
                                <Link
                                    key={sub.name}
                                    href={sub.href}
                                    className={`block p-2 text-sm rounded-lg transition ${pathname === sub.href
                                            ? 'text-indigo-700 bg-indigo-50 font-bold'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-200 group ${isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-300'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
            >
                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900 transition'}`} />
                <span className="text-sm font-semibold">{item.name}</span>
            </Link>
        );
    };

    return (
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-xl shadow-gray-200/50 z-20">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                        S
                    </div>
                    <div>
                        <h1 className="text-gray-900 font-bold text-lg tracking-tight">Six <span className="text-indigo-600">Admin</span></h1>
                        <p className="text-xs text-gray-500 font-medium">Pro Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu chính</p>
                {navItems.map((item) => (
                    <LinkItem key={item.name} item={item} />
                ))}
            </div>

            {/* Footer User Profile */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition group cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-white shadow-sm"></div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate max-w-[100px]">Administrator</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                   
                </div>
            </div>
        </aside>
    );
}