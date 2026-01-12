"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit, User, Mail, Shield, Save, X, Loader2, Phone, Key, Lock, UserCheck } from "lucide-react";
import UserService from "@/services/UserService";

export default function EditMember() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const memberId = searchParams.get("id");

    // ================= STATE =================
    const [form, setForm] = useState({
        name: "",
        email: "",
        username: "",
        phone: "",
        address: "",
        roles: "customer",
        status: 1,
        password: "", // Để trống nếu không đổi mật khẩu
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // ================= LOAD MEMBER =================
    useEffect(() => {
        if (!memberId) {
            setLoading(false);
            return;
        }

        const fetchMember = async () => {
            try {
                const res = await UserService.getById(memberId);
                // httpAxios interceptor trả về response.data
                const data = res.data || res;

                setForm({
                    name: data.name || "",
                    email: data.email || "",
                    username: data.username || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    roles: data.roles || "customer",
                    status: Number(data.status) ?? 1,
                    password: "", // Không load password, để trống
                });
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                alert("❌ Không thể tải dữ liệu thành viên");
                router.push("/dashboard/admin/members");
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [memberId, router]);

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const payload = {
                name: form.name,
                email: form.email,
                username: form.username,
                phone: form.phone || undefined,
                address: form.address || undefined,
                roles: form.roles,
                status: Number(form.status),
            };

            // Chỉ gửi password nếu có nhập mới
            if (form.password && form.password.trim() !== "") {
                payload.password = form.password;
            }

            await UserService.update(memberId, payload);

            alert("✅ Cập nhật thành viên thành công!");
            router.push("/dashboard/admin/members");
        } catch (err) {
            console.error("Submit Error:", err.response?.data || err);

            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                alert("❌ Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường.");
            } else {
                alert("❌ Lỗi khi cập nhật thành viên: " + (err.response?.data?.message || "Lỗi hệ thống"));
            }
        } finally {
            setSaving(false);
        }
    };

    // ================= LOADING UI =================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-yellow-600 font-black text-xl">
                    <Loader2 className="animate-spin" size={28} />
                    Đang tải dữ liệu thành viên...
                </div>
            </div>
        );
    }

    // ================= MAIN UI =================
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <UserCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Chỉnh sửa Thành viên #{memberId}</h1>
                        <p className="text-yellow-100 text-sm font-semibold">
                            Cập nhật thông tin tài khoản
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* NAME */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <User size={18} /> Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.name ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-yellow-400"
                                }`}
                            placeholder="Nhập họ và tên..."
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name[0]}</p>}
                    </div>

                    {/* EMAIL & USERNAME */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* EMAIL */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <Mail size={18} /> Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.email ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-yellow-400"
                                    }`}
                                placeholder="email@example.com"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email[0]}</p>}
                        </div>

                        {/* USERNAME */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <Key size={18} /> Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.username ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-yellow-400"
                                    }`}
                                placeholder="username"
                                required
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1 font-bold">{errors.username[0]}</p>}
                        </div>
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <Phone size={18} /> Số điện thoại
                        </label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-yellow-400 transition-all outline-none"
                            placeholder="Số điện thoại..."
                        />
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <Lock size={18} /> Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.password ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-yellow-400"
                                }`}
                            placeholder="Để trống nếu không đổi mật khẩu..."
                            minLength={6}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password[0]}</p>}
                        <p className="text-xs text-gray-400 mt-1">Để trống nếu không muốn thay đổi mật khẩu. Tối thiểu 6 ký tự.</p>
                    </div>

                    {/* ROLE & STATUS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* ROLE */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <Shield size={16} /> Vai trò
                            </label>
                            <select
                                value={form.roles}
                                onChange={(e) => setForm({ ...form, roles: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-yellow-400 outline-none transition-all bg-white"
                            >
                                <option value="customer">🧑 Khách hàng</option>
                                <option value="admin">👑 Quản trị viên</option>
                            </select>
                        </div>

                        {/* STATUS */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <Edit size={16} /> Trạng thái
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-yellow-400 outline-none transition-all bg-white"
                            >
                                <option value={1}>🟢 Hoạt động</option>
                                <option value={0}>🔴 Khóa</option>
                            </select>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/members")}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <X size={18} /> Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white bg-yellow-600 font-bold shadow-lg shadow-yellow-200 hover:bg-yellow-700 disabled:opacity-60 transition-all"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Cập nhật
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}