"use client";

import React, { useState } from "react";
import { Mail, Lock, User, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { register } from "@/services/AuthService";

const RegisterForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Mật khẩu xác nhận không khớp",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name || formData.username,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // ❌ KHÔNG LƯU TOKEN KHI REGISTER

      setMessage({
        type: "success",
        text: "Đăng ký thành công! Vui lòng đăng nhập.",
      });

      setTimeout(() => {
        router.push("/main/account/login");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.username?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        "Đăng ký thất bại";

      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const MessageDisplay = ({ type, text }) => {
    if (!text) return null;

    const isSuccess = type === "success";
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
      <div
        className={`p-3 mb-4 border rounded-lg flex items-start ${
          isSuccess
            ? "bg-green-100 border-green-400 text-green-700"
            : "bg-red-100 border-red-400 text-red-700"
        }`}
      >
        <Icon size={20} className="mt-0.5 mr-3" />
        <p className="text-sm font-medium">{text}</p>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Đăng Ký Tài Khoản
        </h2>

        {message && <MessageDisplay {...message} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              name="username"
              placeholder="Tên đăng nhập"
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border rounded"
            />
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border rounded"
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border rounded"
            />
          </div>

          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu"
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
