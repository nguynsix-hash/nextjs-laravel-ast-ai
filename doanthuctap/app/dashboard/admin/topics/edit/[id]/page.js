"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tag, FileEdit, BookOpenText, Save, X, Loader2, ListChecks, Hash } from "lucide-react";
import TopicService from "@/services/TopicService";

export default function EditTopic() {
    const router = useRouter();
    const params = useParams();
    const topicId = params.id;

    // ================= STATE =================
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        sort_order: 0,
        status: 1
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // ================= LOAD TOPIC =================
    useEffect(() => {
        if (!topicId) {
            setLoading(false);
            return;
        }

        const fetchTopic = async () => {
            try {
                const res = await TopicService.getById(topicId);
                // httpAxios interceptor đã trả về response.data
                // nên res = { success: true, data: {...} }
                const data = res.data || res;

                setForm({
                    name: data.name || "",
                    slug: data.slug || "",
                    description: data.description || "",
                    sort_order: data.sort_order || 0,
                    status: Number(data.status) ?? 1
                });
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                alert("❌ Không thể tải dữ liệu chủ đề");
                router.push("/dashboard/admin/topics");
            } finally {
                setLoading(false);
            }
        };

        fetchTopic();
    }, [topicId, router]);

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const payload = {
                name: form.name,
                slug: form.slug || undefined,
                description: form.description || "",
                sort_order: Number(form.sort_order) || 0,
                status: Number(form.status)
            };

            await TopicService.update(topicId, payload);

            alert("✅ Cập nhật chủ đề thành công!");
            router.push("/dashboard/admin/topics");
        } catch (err) {
            console.error("Submit Error:", err.response?.data || err);

            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                alert("❌ Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường.");
            } else {
                alert("❌ Lỗi khi cập nhật chủ đề: " + (err.response?.data?.message || "Lỗi hệ thống"));
            }
        } finally {
            setSaving(false);
        }
    };

    // ================= LOADING UI =================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-purple-600 font-black text-xl">
                    <Loader2 className="animate-spin" size={28} />
                    Đang tải dữ liệu chủ đề...
                </div>
            </div>
        );
    }

    // ================= MAIN UI =================
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <Tag size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Chỉnh sửa Chủ đề #{topicId}</h1>
                        <p className="text-purple-100 text-sm font-semibold">
                            Cập nhật thông tin chủ đề bài viết
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* NAME */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <Tag size={18} /> Tên chủ đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.name ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-purple-400"
                                }`}
                            placeholder="Nhập tên chủ đề..."
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name[0]}</p>}
                    </div>

                    {/* SLUG */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <Hash size={18} /> Slug (URL)
                        </label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.slug ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-purple-400"
                                }`}
                            placeholder="Để trống sẽ tự tạo từ tên..."
                        />
                        {errors.slug && <p className="text-red-500 text-xs mt-1 font-bold">{errors.slug[0]}</p>}
                        <p className="text-xs text-gray-400 mt-1">Slug dùng cho URL thân thiện. Để trống sẽ tự động tạo từ tên.</p>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <BookOpenText size={18} /> Mô tả
                        </label>
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.description ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-purple-400"
                                }`}
                            placeholder="Giải thích ngắn gọn nội dung chính của chủ đề này..."
                            maxLength={500}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1 font-bold">{errors.description[0]}</p>}
                    </div>

                    {/* SORT ORDER & STATUS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* SORT ORDER */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <FileEdit size={16} /> Thứ tự sắp xếp
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.sort_order}
                                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-purple-400 transition-all outline-none"
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
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-purple-400 outline-none transition-all bg-white"
                            >
                                <option value={1}>🟢 Hoạt động</option>
                                <option value={0}>🔴 Ẩn</option>
                            </select>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/topics")}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <X size={18} /> Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white bg-purple-600 font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 disabled:opacity-60 transition-all"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Cập nhật chủ đề
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}