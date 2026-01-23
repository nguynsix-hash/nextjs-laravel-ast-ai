"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Bell, Settings, User } from "lucide-react";
import { getAdminUser, clearAdminAuth } from "@/utils/auth";
import { logout } from "@/services/AuthService";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Chỉ chạy ở client
  useEffect(() => {
    setUser(getAdminUser());
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // gọi API logout (có thể không bắt buộc)
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      clearAdminAuth(); // ✅ xóa token + user admin
      router.replace("/auth/login"); // chuyển về login admin
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="flex justify-between items-center h-16 px-6">

        {/* Left Side (Title/Breadcrumb if needed) */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium">Pages / </span>
          <span className="text-gray-800 font-bold">Dashboard</span>
        </div>

        {/* Right Side (Actions) */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-50 transition relative border border-transparent hover:border-gray-100">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <a
            href="/dashboard/admin/settings"
            className="p-2 rounded-full hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
          >
            <Settings size={20} className="text-gray-500" />
          </a>

          <div className="flex items-center space-x-3 border-l border-gray-100 pl-4 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">{user ? user.name : "Quản trị viên"}</p>
              <p className="text-xs text-gray-400 font-medium">Admin</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-500">
              <User size={20} />
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition ml-1"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
