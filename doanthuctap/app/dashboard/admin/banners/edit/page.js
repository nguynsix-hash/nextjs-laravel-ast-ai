"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, X, ChevronLeft, Image as ImageIcon, Edit, Upload, Loader2, Trash2, Link as LinkIcon, ListChecks, Hash } from "lucide-react";
import BannerService from "@/services/BannerService";

export default function EditBanner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bannerId = searchParams.get("id");

    const imageInputRef = useRef(null);

    // ================= STATE =================
    const [form, setForm] = useState({
        name: "",
        link: "",
        position: "slideshow",
        sort_order: 0,
        description: "",
        status: 1,
        imageFile: null,
        imagePreview: null,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // ================= LOAD BANNER =================
    useEffect(() => {
        if (!bannerId) {
            setLoading(false);
            return;
        }

        const fetchBanner = async () => {
            try {
                const res = await BannerService.show(bannerId);
                // httpAxios interceptor trả về response.data
                const data = res.data || res;

                setForm({
                    name: data.name || "",
                    link: data.link || "",
                    position: data.position || "slideshow",
                    sort_order: data.sort_order || 0,
                    description: data.description || "",
                    status: Number(data.status) ?? 1,
                    imageFile: null,
                    imagePreview: data.image ? BannerService.getImageUrl(data.image) : null,
                });
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                alert("❌ Không thể tải dữ liệu banner");
                router.push("/dashboard/admin/banners");
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, [bannerId, router]);

    // ================= IMAGE HANDLERS =================
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB");
            return;
        }

        setForm(prev => ({
            ...prev,
            imageFile: file,
            imagePreview: URL.createObjectURL(file),
        }));
    };

    const removeImage = () => {
        setForm(prev => ({
            ...prev,
            imageFile: null,
            imagePreview: null,
        }));
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const payload = {
                name: form.name,
                link: form.link || "",
                position: form.position,
                sort_order: Number(form.sort_order) || 0,
                description: form.description || "",
                status: Number(form.status),
            };

            // Chỉ gửi ảnh nếu có file mới
            if (form.imageFile) {
                payload.image = form.imageFile;
            }

            await BannerService.update(bannerId, payload);

            alert("✅ Cập nhật banner thành công!");
            router.push("/dashboard/admin/banners");
        } catch (err) {
            console.error("Submit Error:", err.response?.data || err);

            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                alert("❌ Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường.");
            } else {
                alert("❌ Lỗi khi cập nhật banner: " + (err.response?.data?.message || "Lỗi hệ thống"));
            }
        } finally {
            setSaving(false);
        }
    };

    // ================= LOADING UI =================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-blue-600 font-black text-xl">
                    <Loader2 className="animate-spin" size={28} />
                    Đang tải dữ liệu banner...
                </div>
            </div>
        );
    }

    // ================= MAIN UI =================
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <ImageIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Chỉnh sửa Banner #{bannerId}</h1>
                        <p className="text-blue-100 text-sm font-semibold">
                            Cập nhật thông tin và hình ảnh banner
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* NAME */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <Edit size={18} /> Tên Banner <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.name ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-blue-400"
                                }`}
                            placeholder="Nhập tên banner..."
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name[0]}</p>}
                    </div>

                    {/* IMAGE UPLOAD SECTION */}
                    <div className="p-6 rounded-xl bg-blue-50 border border-blue-200">
                        <label className="flex items-center gap-2 mb-3 font-black text-slate-700">
                            <ImageIcon size={18} /> Ảnh Banner
                        </label>

                        {form.imagePreview ? (
                            <div className="relative inline-block group">
                                <img
                                    src={form.imagePreview}
                                    alt="Banner Preview"
                                    className="w-full max-w-md h-40 object-cover rounded-2xl border-4 border-white shadow-xl group-hover:opacity-90 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                    title="Xóa ảnh"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Thay đổi ảnh khác
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => imageInputRef.current?.click()}
                                className="w-full max-w-md h-40 border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-100/30 transition-all text-slate-400"
                            >
                                <Upload size={40} strokeWidth={1.5} />
                                <span className="mt-2 font-bold text-sm text-slate-500">
                                    Click để tải ảnh lên
                                </span>
                            </div>
                        )}

                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {errors.image && <p className="text-red-500 text-xs mt-1 font-bold">{errors.image[0]}</p>}
                        <p className="mt-2 text-xs text-gray-500">
                            Định dạng: jpg, jpeg, png, webp. Tối đa 2MB.
                        </p>
                    </div>

                    {/* LINK */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <LinkIcon size={18} /> Link liên kết
                        </label>
                        <input
                            type="text"
                            value={form.link}
                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 transition-all outline-none"
                            placeholder="Ví dụ: /san-pham-moi hoặc https://..."
                        />
                    </div>

                    {/* POSITION, SORT ORDER, STATUS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* POSITION */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <ImageIcon size={16} /> Vị trí
                            </label>
                            <select
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 outline-none transition-all bg-white"
                            >
                                <option value="slideshow">🖼️ Slideshow</option>
                                <option value="ads">📢 Quảng cáo</option>
                            </select>
                        </div>

                        {/* SORT ORDER */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <Hash size={16} /> Thứ tự
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.sort_order}
                                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 transition-all outline-none"
                                placeholder="0"
                            />
                        </div>

                        {/* STATUS */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <ListChecks size={16} /> Trạng thái
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 outline-none transition-all bg-white"
                            >
                                <option value={1}>🟢 Hiển thị</option>
                                <option value={0}>🔴 Ẩn</option>
                            </select>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            Mô tả (tùy chọn)
                        </label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 transition-all outline-none"
                            placeholder="Mô tả ngắn về banner..."
                            maxLength={500}
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/banners")}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <X size={18} /> Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white bg-blue-600 font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-60 transition-all"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Cập nhật Banner
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}