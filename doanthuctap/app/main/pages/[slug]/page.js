"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, FileText, AlertCircle } from 'lucide-react';
import PostService from '@/services/PostService';

// Map slug to display title
const PAGE_TITLES = {
    'about': 'Giới thiệu',
    'privacy-policy': 'Chính sách bảo mật',
    'terms': 'Điều khoản sử dụng',
    'return-policy': 'Chính sách đổi trả',
    'buying-guide': 'Hướng dẫn mua hàng',
    'payment': 'Phương thức thanh toán',
    'shipping': 'Chính sách vận chuyển',
    'faq': 'Câu hỏi thường gặp',
    'warranty': 'Hướng dẫn bảo hành'
};

export default function StaticPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) return;

        const fetchPage = async () => {
            setLoading(true);
            setError(null);

            try {
                // Try to fetch by slug first
                const res = await PostService.index({
                    slug: slug,
                    status: 1,
                    limit: 1
                });

                const posts = res?.data?.data || res?.data || [];

                if (posts.length > 0) {
                    setPage(posts[0]);
                } else {
                    // If not found by slug, create a default page content
                    setPage({
                        title: PAGE_TITLES[slug] || 'Trang thông tin',
                        content: `<div class="text-center py-12">
                            <p class="text-gray-500 mb-4">Nội dung trang "${PAGE_TITLES[slug] || slug}" đang được cập nhật.</p>
                            <p class="text-sm text-gray-400">Vui lòng quay lại sau hoặc liên hệ với chúng tôi để biết thêm chi tiết.</p>
                        </div>`,
                        isPlaceholder: true
                    });
                }
            } catch (err) {
                console.error("Fetch page error:", err);
                setError("Không thể tải nội dung trang. Vui lòng thử lại.");
            }

            setLoading(false);
        };

        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
                    <p className="text-gray-500">Đang tải nội dung...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <p className="text-gray-700 font-medium mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
                    >
                        <ArrowLeft size={18} />
                        <span>Quay lại</span>
                    </button>
                </div>
            </div>

            {/* Page Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    {/* Show image if available */}
                    {page?.image && (
                        <div className="max-w-3xl mx-auto mb-6">
                            <img
                                src={page.image.startsWith('http') ? page.image : `http://localhost:8000/${page.image}`}
                                alt={page.title}
                                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
                    {!page?.image && <FileText className="mx-auto mb-4 opacity-80" size={48} />}
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        {page?.title || PAGE_TITLES[slug] || 'Trang thông tin'}
                    </h1>
                    {page?.description && (
                        <p className="mt-3 text-indigo-100 max-w-2xl mx-auto">
                            {page.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Page Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8 md:p-12">
                    {page?.content ? (
                        <div
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-indigo-600 prose-strong:text-gray-800"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>Nội dung đang được cập nhật...</p>
                        </div>
                    )}
                </div>

                {/* Related Links */}
                <div className="max-w-4xl mx-auto mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Xem thêm</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(PAGE_TITLES).filter(([s]) => s !== slug).slice(0, 4).map(([s, title]) => (
                            <a
                                key={s}
                                href={`/main/pages/${s}`}
                                className="p-4 bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition text-center"
                            >
                                <p className="text-sm font-medium text-gray-700">{title}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
