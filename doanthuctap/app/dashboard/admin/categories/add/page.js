"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    X, Check, Upload, Tag, Link as LinkIcon, 
    Layers, Hash, AlignLeft, Info, ChevronLeft, Loader2 
} from "lucide-react";
import CategoryService from "@/services/CategoryService";
import toast, { Toaster } from "react-hot-toast";

export default function CategoriesAdd() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        parent_id: 0,
        sort_order: 1,
        description: "",
        status: 1,
        image: null,
    });

    const createSlug = (str) =>
        str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");

    const handleNameChange = (e) => {
        const name = e.target.value;
        setForm({ ...form, name, slug: createSlug(name) });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm({ ...form, image: file });
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            const submitData = {
                ...form,
                name: form.name.trim(),
                slug: form.slug.trim(),
                parent_id: String(form.parent_id),
                sort_order: String(form.sort_order),
                status: String(form.status),
            };

            await CategoryService.create(submitData);
            toast.success("🎉 Thêm danh mục thành công!");
            setTimeout(() => router.push("/dashboard/admin/categories"), 800);
        } catch (error) {
            const msg = error.response?.data?.errors 
                ? Object.values(error.response.data.errors).flat().join(", ")
                : "❌ Có lỗi xảy ra khi lưu";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">
            <Toaster position="top-right" />

            {/* TOP NAVIGATION BAR */}
            <div className="bg-white border-b sticky top-0 z-20 px-6 py-4 mb-8 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Tạo danh mục mới</h1>
                            <p className="text-sm text-slate-500 font-medium">Dashboard / Danh mục / Thêm mới</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/categories")}
                            className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            form="category-form"
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            {loading ? "ĐANG LƯU..." : "XÁC NHẬN LƯU"}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6">
                <form id="category-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Cấu hình chính */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                <Info size={20} />
                                <h2 className="font-bold uppercase tracking-wider text-sm">Thông tin cơ bản</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên danh mục *</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="VD: Điện thoại, Thời trang..."
                                            value={form.name}
                                            onChange={handleNameChange}
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Đường dẫn (Slug)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={form.slug}
                                            readOnly
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả danh mục</label>
                                    <div className="relative">
                                        <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
                                        <textarea
                                            rows="4"
                                            placeholder="Nhập mô tả ngắn cho danh mục này..."
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Cấu hình phụ & Ảnh */}
                    <div className="space-y-6">
                        {/* Card Image */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 italic">
                                <Upload size={16} className="text-indigo-500" /> HÌNH ĐẠI DIỆN
                            </h3>
                            <label className="group relative w-full h-56 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all overflow-hidden">
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <p className="text-white text-xs font-bold">THAY ĐỔI ẢNH</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="bg-slate-100 p-4 rounded-full inline-block mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">CLICK ĐỂ TẢI LÊN</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                            </label>
                        </div>

                        {/* Card Settings */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                            {/* NEW: Sort Order Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Hash size={16} className="text-indigo-500" /> Thứ tự ưu tiên
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.sort_order}
                                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-indigo-600"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">* Số càng nhỏ ưu tiên hiện trước</p>
                            </div>

                            

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 italic uppercase tracking-widest">Trạng thái</label>
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, status: 1 })}
                                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${form.status === 1 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                                    >
                                        HIỂN THỊ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, status: 0 })}
                                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${form.status === 0 ? "bg-white text-red-500 shadow-sm" : "text-slate-400"}`}
                                    >
                                        TẠM ẨN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}