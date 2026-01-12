"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    UserPlus,
    Mail,
    User,
    Shield,
    Phone,
    Hash,
    Lock,
    CheckCircle,
    XCircle,
    ChevronLeft
} from "lucide-react";

import UserService from "@/services/UserService";

export default function AddMember() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [roles, setRoles] = useState("customer");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ✅ PAYLOAD KHỚP POSTMAN
            const payload = {
                name,
                email,
                phone,
                username,
                password,
                roles,
                status
            };

            const res = await UserService.create(payload);

            if (res.data?.success) {
                alert("Tạo User thành công!");
                router.push("/dashboard/admin/members");
            } else {
                alert(res.data?.message || "Tạo User thất bại!");
            }

        } catch (error) {
            console.error("Add member error:", error.response?.data);

            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstKey = Object.keys(errors)[0];
                alert(errors[firstKey][0]);
            } else {
                alert(error.response?.data?.message || "Có lỗi xảy ra");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="text-blue-600" /> Thêm User
                    </h1>
                    <button
                        onClick={() => router.push("/dashboard/admin/members")}
                        className="flex items-center gap-1 text-blue-600"
                    >
                        <ChevronLeft size={18} /> Quay lại
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="font-semibold flex gap-1">
                            <User size={16} /> Họ tên
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="font-semibold flex gap-1">
                            <Mail size={16} /> Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="font-semibold flex gap-1">
                            <Phone size={16} /> Số điện thoại
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="font-semibold flex gap-1">
                            <Hash size={16} /> Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="font-semibold flex gap-1">
                            <Lock size={16} /> Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Role + Status */}
                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="font-semibold flex gap-1">
                                <Shield size={16} /> Vai trò
                            </label>
                            <select
                                value={roles}
                                onChange={(e) => setRoles(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2"
                            >
                                <option value="admin">Admin</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-semibold flex gap-1">
                                <CheckCircle size={16} /> Trạng thái
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(Number(e.target.value))}
                                className="w-full border rounded-lg px-4 py-2"
                            >
                                <option value={1}>Hoạt động</option>
                                <option value={0}>Khóa</option>
                            </select>
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/members")}
                            className="bg-gray-300 px-5 py-2 rounded-lg"
                            disabled={loading}
                        >
                            <XCircle size={16} className="inline mr-1" /> Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                        >
                            <UserPlus size={16} className="inline mr-1" />
                            {loading ? "Đang tạo..." : "Tạo User"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
