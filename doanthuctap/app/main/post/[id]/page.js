"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Tag, Loader2, BookOpen } from "lucide-react";
import PostService from "@/services/PostService";

export default function PostDetailPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id;

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper URL ảnh
    const getImageUrl = (path) => {
        if (!path) return "https://placehold.co/800x400/e0e0e0/555555?text=No+Image";
        if (path.startsWith("http")) return path;
        return `http://localhost:8000/${path}`;
    };

    // FETCH POST DETAIL
    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const res = await PostService.show(postId);
                // httpAxios returns response.data directly
                // res = { success: true, data: {...post...} }
                console.log("Post detail response:", res);

                if (res?.success && res?.data) {
                    setPost(res.data);

                    // Fetch related posts (same topic)
                    if (res.data.topic_id) {
                        const relatedRes = await PostService.index({
                            topic_id: res.data.topic_id,
                            status: 1,
                            per_page: 4
                        });
                        // Filter out current post
                        const related = relatedRes?.data?.data || [];
                        setRelatedPosts(related.filter(p => p.id !== res.data.id).slice(0, 4));
                    }
                }
            } catch (error) {
                console.error("Fetch post error:", error);
            }
            setLoading(false);
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    // Not found
    if (!post) {
        return (
            <div className="p-10 text-center min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    Bài viết không tồn tại
                </h1>
                <button
                    onClick={() => router.push("/main/post")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* Nút quay lại */}
            <div className="container mx-auto px-4 pt-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại
                </button>
            </div>

            {/* Nội dung bài viết */}
            <div className="container mx-auto px-4 mt-6 bg-white shadow-xl rounded-3xl p-8">

                <img
                    src={getImageUrl(post.image)}
                    alt={post.title}
                    className="rounded-2xl w-full max-h-[450px] object-cover shadow-md"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/800x400/e0e0e0/555555?text=Image+Error";
                    }}
                />

                <div className="mt-6">
                    {/* Topic Badge */}
                    <span className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
                        <Tag size={14} className="mr-2" /> {post.topic?.name || 'Tin tức'}
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl font-extrabold text-gray-900 mt-4">
                        {post.title}
                    </h1>

                    {/* Date */}
                    <p className="flex items-center text-gray-500 mt-3">
                        <CalendarDays size={18} className="mr-2" />
                        {new Date(post.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>

                    {/* Description */}
                    {post.description && (
                        <p className="mt-6 text-xl text-gray-600 italic border-l-4 border-indigo-500 pl-4">
                            {post.description}
                        </p>
                    )}

                    {/* Content */}
                    <div
                        className="mt-8 text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </div>

            {/* Bài viết khác */}
            {relatedPosts.length > 0 && (
                <div className="container mx-auto px-4 mt-14">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <BookOpen size={28} className="mr-3 text-indigo-600" />
                        Bài viết liên quan
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedPosts.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => router.push(`/main/post/${p.id}`)}
                                className="bg-white shadow-lg rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                            >
                                <img
                                    src={getImageUrl(p.image)}
                                    alt={p.title}
                                    className="w-full h-40 object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://placehold.co/400x200/e0e0e0/555555?text=No+Image";
                                    }}
                                />

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 text-lg line-clamp-2">
                                        {p.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                        {p.description || "Đang cập nhật..."}
                                    </p>
                                    <p className="text-indigo-600 text-xs mt-2 font-medium">
                                        {new Date(p.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
