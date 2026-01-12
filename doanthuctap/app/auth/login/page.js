"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, User, Lock, AlertTriangle } from "lucide-react";
import { adminLogin } from "@/services/AuthService"; // ✅ dùng saveAdminAuth
import { saveAdminAuth } from "@/utils/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi API admin login
      const response = await adminLogin({
        email: loginInput,
        password: password,
      });

      // Lưu token + user vào localStorage admin
      saveAdminAuth(response.token, response.user);

      setLoading(false);

      // Redirect admin dashboard
      router.replace("/dashboard/admin");
    } catch (err) {
      setLoading(false);
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Đăng nhập thất bại");
      } else {
        setError("Không thể kết nối server");
      }
    }
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm transform transition duration-500 hover:shadow-3xl mx-auto mt-20">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800 flex items-center justify-center gap-2">
        <LogIn size={26} className="text-blue-600" /> Đăng nhập Quản trị
      </h1>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 mb-6 rounded-xl text-sm font-medium">
          <AlertTriangle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="relative">
          <User
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Email"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900"
            required
            disabled={loading}
          />
        </div>

        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition duration-200 shadow-md 
                    ${
                      loading
                        ? "bg-blue-400 text-white cursor-not-allowed opacity-80"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                    }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            <>
              <LogIn size={20} /> Đăng nhập
            </>
          )}
        </button>
      </form>
    </div>
  );
}
