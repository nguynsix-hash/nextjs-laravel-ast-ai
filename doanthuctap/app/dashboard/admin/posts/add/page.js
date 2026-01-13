"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FilePlus2,
    Text,
    AlignLeft,
    Image as ImageIcon,
    Save,
    X,
    Loader2,
    ChevronLeft,
    UploadCloud,
    Link as LinkIcon,
} from "lucide-react";
import PostService from "@/services/PostService";
import TopicService from "@/services/TopicService";
import toast from "react-hot-toast";

export default function AddPost() {
    const router = useRouter();

    // ===== STATE =====
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [description, setDescription] = useState("");
    const [topicId, setTopicId] = useState("");
    const [status, setStatus] = useState(1);
    const [postType, setPostType] = useState(0);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Topics from API
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);

    // Fetch topics on mount
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await TopicService.getAll({ status: 1 });
                const topicsData = res?.data?.data || res?.data || [];
                setTopics(Array.isArray(topicsData) ? topicsData : []);
                // Set default topic if available
                if (topicsData.length > 0) {
                    setTopicId(topicsData[0].id);
                }
            } catch (error) {
                console.error("Fetch topics error:", error);
                toast.error("Không thể tải danh sách chủ đề");
            }
            setLoadingTopics(false);
        };
        fetchTopics();
    }, []);

    // Auto-generate slug from title
    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Auto-generate slug if slug is empty or was auto-generated
        if (!slug || slug === generateSlug(title)) {
            setSlug(generateSlug(newTitle));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const postData = {
                title,
                slug: slug || generateSlug(title),
                content,
                description,
                topic_id: Number(topicId),
                status: Number(status),
                post_type: Number(postType),
                image,
            };
            await PostService.store(postData);
            toast.success("🎉 Thêm bài viết thành công!");
            setTimeout(() => router.push("/dashboard/admin/posts"), 700);
        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                toast.error(Object.values(errors)[0][0]);
            } else {
                toast.error("❌ Có lỗi xảy ra khi thêm bài viết");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* TOP BAR */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium">Quay lại</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/posts")}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            form="post-form"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSubmitting ? "Đang lưu..." : "Lưu bài viết"}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tiêu đề bài viết</label>
                                <input
                                    placeholder="Nhập tiêu đề hấp dẫn..."
                                    value={title}
                                    onChange={handleTitleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
                                />
                            </div>

                            {/* SLUG FIELD */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <LinkIcon size={16} className="text-indigo-500" />
                                    Slug (URL thân thiện)
                                </label>
                                <div className="flex items-center">
                                    <span className="px-3 py-3 bg-slate-100 text-slate-500 text-sm rounded-l-xl border border-r-0 border-slate-200">
                                        /main/pages/
                                    </span>
                                    <input
                                        placeholder="vd: about, privacy-policy, terms..."
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        className="flex-1 px-4 py-3 rounded-r-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Dùng cho Static Pages. VD: "about" → /main/pages/about
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả ngắn</label>
                                <textarea
                                    placeholder="Tóm tắt nội dung bài viết..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung chi tiết (HTML)</label>
                                <textarea
                                    placeholder="Viết nội dung HTML ở đây..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={12}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Settings & Image */}
                    <div className="space-y-6">
                        {/* Image Upload Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <ImageIcon size={18} className="text-indigo-500" />
                                Hình ảnh đại diện
                            </label>

                            {preview ? (
                                <div className="relative group rounded-xl overflow-hidden border-2 border-indigo-100">
                                    <img src={preview} className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-500" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => { setPreview(null); setImage(null); }}
                                            className="bg-white text-red-500 p-2 rounded-full shadow-xl hover:scale-110 transition-transform"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                                        <p className="text-sm text-slate-500 font-medium">Click để tải ảnh lên</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        {/* Taxonomy Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phân loại</label>
                                <select
                                    value={postType}
                                    onChange={(e) => setPostType(Number(e.target.value))}
                                    className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 font-medium"
                                >
                                    <option value={0}>Bài viết (Post)</option>
                                    <option value={1}>Trang đơn (Page)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chủ đề</label>
                                {loadingTopics ? (
                                    <div className="flex items-center gap-2 text-slate-400 p-3">
                                        <Loader2 className="animate-spin" size={16} />
                                        Đang tải...
                                    </div>
                                ) : (
                                    <select
                                        value={topicId}
                                        onChange={(e) => setTopicId(Number(e.target.value))}
                                        className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 font-medium"
                                    >
                                        {topics.length === 0 ? (
                                            <option value="">Không có chủ đề</option>
                                        ) : (
                                            topics.map((topic) => (
                                                <option key={topic.id} value={topic.id}>
                                                    {topic.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng thái</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setStatus(1)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${status === 1 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                                    >
                                        Xuất bản
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus(0)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${status === 0 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                                    >
                                        Bản nháp
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