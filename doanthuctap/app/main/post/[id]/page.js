"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";

// ======================================
// DỮ LIỆU MOCK – COPY Y HỆT BÊN LISTING
// ======================================
const mockArticles = [
    {
        id: 1,
        title: 'Bí quyết tối ưu hóa hiệu năng React Hooks',
        content: `Đây là nội dung chi tiết của bài viết về React Hooks.  
Bạn có thể viết dài tùy ý, hỗ trợ xuống dòng, hình ảnh, bullet,...`,
        excerpt: 'Tối ưu tốc độ bằng useMemo & useCallback.',
        category: 'Công nghệ',
        imageUrl: 'https://placehold.co/800x400/4F46E5/FFFFFF?text=React+Hooks',
        date: '2024-10-20',
    },
    {
        id: 2,
        title: '10 xu hướng AI định hình tương lai bán lẻ',
        content: `Nội dung dài của bài viết AI bán lẻ...`,
        excerpt: 'AI thay đổi tương lai ngành bán lẻ.',
        category: 'Kinh doanh',
        imageUrl: 'https://placehold.co/800x400/10B981/FFFFFF?text=AI+Retail',
        date: '2024-10-18',
    },
    {
        id: 3,
        title: 'Cách duy trì sự tập trung khi làm việc từ xa',
        content: `Nội dung chi tiết bài làm việc từ xa...`,
        excerpt: 'Mẹo giữ năng suất khi remote work.',
        category: 'Đời sống',
        imageUrl: 'https://placehold.co/800x400/F59E0B/FFFFFF?text=Remote+Work',
        date: '2024-10-15',
    }
];

export default function PostDetailPage() {
    const router = useRouter();
    const params = useParams();

    // params.id = "id1" => lấy số 1
    const articleId = Number(params.id.replace("id", ""));

    const article = mockArticles.find(a => a.id === articleId);

    // Bài viết khác (trừ bài hiện tại)
    const otherArticles = useMemo(() => {
        return mockArticles.filter(a => a.id !== articleId).slice(0, 4);
    }, [articleId]);

    // Nếu không tìm thấy bài viết
    if (!article) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    Bài viết không tồn tại
                </h1>
                <button
                    onClick={() => router.push("/main/post")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
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
                    className="flex items-center text-indigo-600 font-semibold hover:text-indigo-800"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại
                </button>
            </div>

            {/* Nội dung bài viết */}
            <div className="container mx-auto px-4 mt-6 bg-white shadow-xl rounded-3xl p-8">

                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="rounded-2xl w-full max-h-[450px] object-cover shadow-md"
                />

                <div className="mt-6">
                    <span className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
                        <Tag size={14} className="mr-2" /> {article.category}
                    </span>

                    <h1 className="text-4xl font-extrabold text-gray-900 mt-4">
                        {article.title}
                    </h1>

                    <p className="flex items-center text-gray-500 mt-3">
                        <CalendarDays size={18} className="mr-2" />
                        {article.date}
                    </p>

                    <div className="mt-8 text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                        {article.content}
                    </div>
                </div>
            </div>

            {/* Bài viết khác */}
            <div className="container mx-auto px-4 mt-14">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Các bài viết khác
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {otherArticles.map((a) => (
                        <div
                            key={a.id}
                            onClick={() => router.push(`/main/post/id${a.id}`)}
                            className="bg-white shadow-lg rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition"
                        >
                            <img src={a.imageUrl} className="w-full h-40 object-cover" />

                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 text-lg line-clamp-2">
                                    {a.title}
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {a.date}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
