"use client";

import {
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  Phone,
  LogOut,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { getUser, clearAuth } from "@/utils/auth";
import { logout } from "@/services/AuthService";
import CategoryService from "@/services/CategoryService";
import CartService from "@/services/CartService";
import ConfigService from "@/services/ConfigService";
import MenuService from "@/services/MenuService";

export default function Header() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menus, setMenus] = useState([]);

  // Config state for dynamic site name and hotline
  // Use empty string initially to match server render, then load from cache/API in useEffect
  const [config, setConfig] = useState({ site_name: '', hotline: '' });

  const userMenuRef = useRef(null);

  // ====== CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG ======
  const updateCartBadge = () => {
    const cart = CartService.getCart() || [];
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(total);
  };

  useEffect(() => {
    // Load user từ localStorage
    setUser(getUser());

    // Load config from localStorage cache first (instant, no flash on subsequent visits)
    const cachedConfig = localStorage.getItem('site_config');
    if (cachedConfig) {
      try {
        setConfig(JSON.parse(cachedConfig));
      } catch (e) {
        // ignore parse error
      }
    }

    // Load categories
    const fetchCategories = async () => {
      try {
        const res = await CategoryService.getAll();
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCategories(list);
      } catch (err) {
        console.error("Lỗi load categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();

    // Load Main Menu
    const fetchMenus = async () => {
      try {
        const res = await MenuService.getAll({
          position: 'mainmenu',
          status: 1,
          sort_by: 'sort_order',
          order: 'asc',
          parent_id: 0 // Optional: only get top level
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        if (data.length > 0) {
          setMenus(data);
        } else {
          // Fallback nến không có menu nào
          setMenus([
            { name: "Giới thiệu", link: "/main/pages/about" },
            { name: "Sản phẩm", link: "/main/product" },
            { name: "Khuyến mãi", link: "/main/promotion" },
            { name: "Liên hệ", link: "/main/contact" },
            { name: "Bài viết", link: "/main/post" },
          ]);
        }
      } catch (error) {
        console.error("Fetch menu error:", error);
        // Fallback error
        setMenus([
          { name: "Giới thiệu", link: "/main/pages/about" },
          { name: "Sản phẩm", link: "/main/product" },
          { name: "Khuyến mãi", link: "/main/promotion" },
          { name: "Liên hệ", link: "/main/contact" },
          { name: "Bài viết", link: "/main/post" },
        ]);
      }
    };
    fetchMenus();

    // Load config from API and update cache
    const fetchConfig = async () => {
      try {
        const res = await ConfigService.getAll();
        const configData = res?.data?.data?.[0] || res?.data?.[0] || null;
        if (configData) {
          const newConfig = {
            site_name: configData.site_name || 'ESHOP',
            hotline: configData.hotline || configData.phone || '1900 6868'
          };
          setConfig(newConfig);
          // Cache to localStorage for next page load
          localStorage.setItem('site_config', JSON.stringify(newConfig));
        }
      } catch (error) {
        console.error("Fetch config error:", error);
      }
    };
    fetchConfig();

    // Load cart lần đầu
    updateCartBadge();

    // Lắng nghe sự kiện update cart từ CartService
    window.addEventListener("cartUpdate", updateCartBadge);

    // Lắng nghe sự kiện update user info (avatar, name)
    const handleUserUpdate = () => setUser(getUser());
    window.addEventListener("userUpdate", handleUserUpdate);

    // Click ngoài menu user để đóng
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("cartUpdate", updateCartBadge);
      window.removeEventListener("userUpdate", handleUserUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ====== TÌM KIẾM ======
  const handleSearch = () => {
    if (!searchText.trim()) return;
    router.push(
      `/main/search?keyword=${encodeURIComponent(searchText)}&page=1`
    );
  };

  // ====== LOGOUT ======
  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore
    } finally {
      clearAuth();
      setUser(null);
      setShowUserMenu(false);
      router.push("/main");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Dynamic from Config */}
        <div className="flex flex-col min-w-[200px]">
          <a href="/main" className="text-2xl font-bold text-indigo-600 tracking-tight">
            {config.site_name}
          </a>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            Công nghệ & Cuộc sống
          </p>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-8 hidden lg:flex">
          <div className="w-full relative">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Bạn muốn tìm gì hôm nay?... "
              className="w-full p-2.5 pl-5 pr-12 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-3 md:space-x-6">
          {/* Hotline - Dynamic from Config */}
          <div className="hidden sm:flex flex-col items-end text-xs font-semibold text-gray-500">
            <span className="text-gray-400 font-normal">Hotline:</span>
            <div className="flex items-center text-indigo-600">
              <Phone size={14} className="mr-1" />
              {config.hotline}
            </div>
          </div>

          {/* GIỎ HÀNG */}
          <a
            href="/main/cart"
            className="relative p-2.5 text-gray-700 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </a>

          {/* ACCOUNT */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1 p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              {user && (user.avatar || user.name) ? (
                <div className="w-8 h-8 relative rounded-full overflow-hidden border border-indigo-100">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-indigo-100 p-1 rounded-full text-indigo-600">
                  <User size={20} />
                </div>
              )}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""
                  }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                {!user ? (
                  <div className="px-2 space-y-1">
                    <a
                      href="/main/account/login"
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                      Đăng nhập
                    </a>
                    <a
                      href="/main/account/register"
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                      Đăng ký thành viên
                    </a>
                  </div>
                ) : (
                  <div className="px-2 space-y-1">
                    <div className="px-4 py-2 mb-2 border-b">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        Tài khoản
                      </p>
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {user.name || user.email}
                      </p>
                    </div>
                    <a
                      href="/main/account/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Thông tin cá nhân
                    </a>
                    <a
                      href="/main/account/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Đơn hàng của tôi
                    </a>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="bg-indigo-600 hidden md:block border-t border-indigo-500/30">
        <div className="container mx-auto px-4 flex items-center">
          {/* Categories Dropdown */}
          <div className="group relative">
            <button className="flex items-center space-x-2 bg-indigo-700 px-6 py-3 text-white font-bold hover:bg-indigo-800 transition-colors">
              <Menu size={20} />
              <span>DANH MỤC SẢN PHẨM</span>
              <ChevronDown size={16} />
            </button>

            <div className="absolute top-full left-0 w-64 bg-white shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[60] border-t-2 border-indigo-600">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <a
                    key={c.id}
                    href={`/main/product?category_id=${c.id}&page=1`}
                    className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors"
                  >
                    {c.name}
                  </a>
                ))
              ) : (
                <p className="px-6 py-4 text-xs text-gray-400 italic">
                  Đang tải danh mục...
                </p>
              )}
            </div>
          </div>

          {/* Main Links - DYNAMIC */}
          <div className="flex space-x-1 ml-4">
            {menus.map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="text-white px-5 py-3 text-sm font-bold uppercase tracking-wide hover:bg-indigo-500 transition-colors rounded-t-sm"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
