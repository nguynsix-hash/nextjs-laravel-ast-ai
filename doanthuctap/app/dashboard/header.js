"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Bell, Settings, User } from "lucide-react";
import { getAdminUser, clearAdminAuth } from "@/utils/auth"; // ✅ admin
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
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center h-16 px-6">
        
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
          Six | ADMIN
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition relative">
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <a
            href="/dashboard/admin/settings"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Settings size={20} className="text-gray-600 dark:text-gray-300" />
          </a>

          <div className="flex items-center space-x-2 border-l pl-4">
            <User size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
              {user ? user.name : "Quản trị viên"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center p-1 rounded hover:bg-red-500/10 text-red-600 dark:text-red-400 transition ml-2"
            >
              <LogOut size={18} />
              <span className="text-sm ml-1 hidden lg:inline">Thoát</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
