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
import CartService from "@/services/CartService"; // Service giỏ hàng

export default function Header() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const userMenuRef = useRef(null);

  const navLinks = [
    { name: "Giới thiệu", href: "/main/about" },
    { name: "Sản phẩm", href: "/main/product" },
    { name: "Khuyến mãi", href: "/main/promotion" },
    { name: "Liên hệ", href: "/main/contact" },
  ];

  // ====== CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG ======
  const updateCartBadge = () => {
    const cart = CartService.getCart() || [];
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(total);
  };

  useEffect(() => {
    // Load user từ localStorage
    setUser(getUser());

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

    // Load cart lần đầu
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
      `/main/product?search=${encodeURIComponent(searchText)}&page=1`
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
        {/* Logo */}
        <div className="flex flex-col min-w-[200px]">
          <a href="/main" className="text-2xl font-bold text-indigo-600 tracking-tight">
            LORAMEN
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
          <div className="hidden sm:flex flex-col items-end text-xs font-semibold text-gray-500">
            <span className="text-gray-400 font-normal">Hotline:</span>
            <div className="flex items-center text-indigo-600">
              <Phone size={14} className="mr-1" />
              1900 6868
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

          {/* Main Links */}
          <div className="flex space-x-1 ml-4">
            {navLinks.map((l) => (
              <a
                key={l.name}
                href={l.href}
                className="text-white px-5 py-3 text-sm font-bold uppercase tracking-wide hover:bg-indigo-500 transition-colors rounded-t-sm"
              >
                {l.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
