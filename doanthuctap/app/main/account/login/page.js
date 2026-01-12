"use client";

import React, { useState } from "react";
import { Mail, Lock, LogIn, UserX, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { login } from "@/services/AuthService";
import { saveAuth } from "@/utils/auth";

export default function LoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // email
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await login({
        email: identifier,
        password: password,
      });

      // ✅ LƯU TOKEN + USER
      saveAuth(res.token, res.user);

      setStatus({
        type: "success",
        message: "Đăng nhập thành công! Đang chuyển hướng...",
      });

      setTimeout(() => {
        router.push("/main/account/profile"); // hoặc /main /profile
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Email hoặc mật khẩu không đúng";

      setStatus({
        type: "error",
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusClasses =
    status.type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";

  const StatusIcon = status.type === "success" ? CheckCircle : UserX;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Đăng nhập ESHOP
        </h2>

        {status.message && (
          <div
            className={`p-3 border rounded-lg flex items-center space-x-2 ${statusClasses}`}
          >
            <StatusIcon size={20} />
            <span className="font-medium text-sm">{status.message}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-3 text-indigo-400" />
            <input
              type="email"
              required
              className="w-full px-10 py-3 border rounded-md"
              placeholder="Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-3 text-indigo-400" />
            <input
              type="password"
              required
              className="w-full px-10 py-3 border rounded-md"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? (
              "Đang xử lý..."
            ) : (
              <>
                <LogIn size={20} className="mr-2" /> Đăng nhập
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <a
            href="/main/account/register"
            className="text-indigo-600 font-medium"
          >
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
}
