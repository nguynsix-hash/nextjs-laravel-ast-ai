"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileEdit, Text, AlignLeft, Tag, ListChecks, Image, Save, X, Loader2, ImagePlus, Trash2, BookOpen } from "lucide-react";
import PostService from "@/services/PostService";
import TopicService from "@/services/TopicService";

export default function EditPost() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get("id");

    const imageInputRef = useRef(null);

    // ================= STATE =================
    const [form, setForm] = useState({
        topic_id: "",
        title: "",
        slug: "",
        description: "",
        content: "",
        post_type: 0,
        status: 1,
        imageFile: null,
        imagePreview: null,
        remove_image: 0
    });

    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // ================= LOAD POST & TOPICS =================
    useEffect(() => {
        if (!postId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch post detail và danh sách topics song song
                const [postRes, topicsRes] = await Promise.all([
                    PostService.show(postId),
                    TopicService.getAll()
                ]);

                // Lấy dữ liệu post
                const postData = postRes.data?.data || postRes.data;

                // Lấy danh sách topics
                const topicsData = topicsRes.data?.data || topicsRes.data || [];
                setTopics(Array.isArray(topicsData) ? topicsData : (topicsData.data || []));

                // Set form data
                setForm({
                    topic_id: postData.topic_id || "",
                    title: postData.title || "",
                    slug: postData.slug || "",
                    description: postData.description || "",
                    content: postData.content || "",
                    post_type: Number(postData.post_type) || 0,
                    status: Number(postData.status) || 1,
                    imageFile: null,
                    imagePreview: postData.image ? PostService.getImageUrl(postData.image) : null,
                    remove_image: 0
                });

            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                alert("❌ Không thể tải dữ liệu bài viết");
                router.push("/dashboard/admin/posts");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId, router]);

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
            remove_image: 0
        }));
    };

    const removeImage = () => {
        setForm(prev => ({
            ...prev,
            imageFile: null,
            imagePreview: null,
            remove_image: 1
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
                topic_id: Number(form.topic_id),
                title: form.title,
                slug: form.slug || undefined,
                description: form.description || "",
                content: form.content || "",
                post_type: Number(form.post_type),
                status: Number(form.status),
            };

            // Chỉ gửi ảnh nếu có file mới
            if (form.imageFile) {
                payload.image = form.imageFile;
            }

            await PostService.update(postId, payload);

            alert("✅ Cập nhật bài viết thành công!");
            router.push("/dashboard/admin/posts");
        } catch (err) {
            console.error("Submit Error:", err.response?.data || err);

            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                alert("❌ Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường.");
            } else {
                alert("❌ Lỗi khi cập nhật bài viết: " + (err.response?.data?.message || "Lỗi hệ thống"));
            }
        } finally {
            setSaving(false);
        }
    };

    // ================= LOADING UI =================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-green-600 font-black text-xl">
                    <Loader2 className="animate-spin" size={28} />
                    Đang tải dữ liệu bài viết...
                </div>
            </div>
        );
    }

    // ================= MAIN UI =================
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-green-600 to-green-500 text-white">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <FileEdit size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Chỉnh sửa Bài viết #{postId}</h1>
                        <p className="text-green-100 text-sm font-semibold">
                            Cập nhật thông tin bài viết
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* TITLE */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <Text size={18} /> Tiêu đề bài viết <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${errors.title ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-green-400"
                                }`}
                            placeholder="Nhập tiêu đề bài viết..."
                            required
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title[0]}</p>}
                    </div>

                    {/* SLUG */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            🔗 Slug (URL thân thiện)
                        </label>
                        <div className="flex items-center">
                            <span className="px-3 py-3 bg-slate-100 text-slate-500 text-sm rounded-l-xl border-2 border-r-0 border-slate-100">
                                /main/pages/
                            </span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className={`flex-1 px-4 py-3 rounded-r-xl border-2 transition-all outline-none ${errors.slug ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-green-400"
                                    }`}
                                placeholder="vd: about, privacy-policy, terms..."
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Dùng cho Static Pages. VD: "about" → /main/pages/about
                        </p>
                        {errors.slug && <p className="text-red-500 text-xs mt-1 font-bold">{errors.slug[0]}</p>}
                    </div>

                    {/* TOPIC & POST_TYPE & STATUS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* TOPIC */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <Tag size={16} /> Chủ đề <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.topic_id}
                                onChange={(e) => setForm({ ...form, topic_id: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none bg-white ${errors.topic_id ? "border-red-500" : "border-slate-100 focus:border-green-400"
                                    }`}
                                required
                            >
                                <option value="">-- Chọn chủ đề --</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                                ))}
                            </select>
                            {errors.topic_id && <p className="text-red-500 text-xs mt-1 font-bold">{errors.topic_id[0]}</p>}
                        </div>

                        {/* POST TYPE */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <BookOpen size={16} /> Loại bài viết
                            </label>
                            <select
                                value={form.post_type}
                                onChange={(e) => setForm({ ...form, post_type: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-green-400 outline-none transition-all bg-white"
                            >
                                <option value={0}>📰 Tin tức</option>
                                <option value={1}>📖 Trang nội dung</option>
                            </select>
                        </div>

                        {/* STATUS */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                                <ListChecks size={16} /> Trạng thái
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-green-400 outline-none transition-all bg-white"
                            >
                                <option value={1}>🟢 Xuất bản</option>
                                <option value={0}>🔴 Bản nháp</option>
                            </select>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <AlignLeft size={18} /> Mô tả ngắn
                        </label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-green-400 transition-all outline-none"
                            placeholder="Mô tả ngắn gọn về bài viết (tối đa 500 ký tự)..."
                            maxLength={500}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1 font-bold">{errors.description[0]}</p>}
                    </div>

                    {/* CONTENT */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <FileEdit size={18} /> Nội dung bài viết
                        </label>
                        <textarea
                            rows={8}
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-green-400 transition-all outline-none"
                            placeholder="Nhập nội dung chi tiết bài viết..."
                        />
                    </div>

                    {/* IMAGE UPLOAD SECTION */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 font-black text-slate-700">
                            <Image size={18} /> Ảnh đại diện
                        </label>

                        {form.imagePreview ? (
                            <div className="relative inline-block group">
                                <img
                                    src={form.imagePreview}
                                    alt="Post Preview"
                                    className="w-64 h-40 object-cover rounded-2xl border-4 border-white shadow-xl group-hover:opacity-90 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                    title="Xóa ảnh"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="mt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="text-xs font-bold text-green-600 hover:underline"
                                    >
                                        Thay đổi ảnh khác
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => imageInputRef.current?.click()}
                                className="w-64 h-40 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all text-slate-400"
                            >
                                <ImagePlus size={40} strokeWidth={1.5} />
                                <span className="mt-2 font-bold text-sm text-slate-500">
                                    Tải ảnh lên
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
                        <p className="mt-2 text-xs text-gray-400 italic">
                            *Chỉ chọn file mới nếu bạn muốn thay thế ảnh hiện tại. Định dạng: jpg, jpeg, png, webp. Tối đa 2MB.
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/posts")}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <X size={18} /> Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white bg-green-600 font-bold shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-60 transition-all"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Cập nhật bài viết
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}