"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Tag, Filter, ArrowLeft, ArrowRight, Search, LayoutList, X, Loader2 } from 'lucide-react';
import PostService from '@/services/PostService';
import TopicService from '@/services/TopicService';

// ====================================================================
// COMPONENT CON: ArticleCard
// ====================================================================

const ArticleCard = ({ article, router }) => {

    // Hàm xử lý chuyển hướng
    const handleNavigation = () => {
        router.push(`/main/post/${article.id}`);
    };

    // Helper URL ảnh
    const getImageUrl = (path) => {
        if (!path) return "https://placehold.co/400x250/e0e0e0/555555?text=No+Image";
        if (path.startsWith("http")) return path;
        return `http://localhost:8000/${path}`;
    };

    return (
        <div
            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col transform hover:scale-[1.01] cursor-pointer"
            onClick={handleNavigation}
        >
            {/* Hình đại diện */}
            <div className="relative w-full h-52 overflow-hidden">
                <img
                    src={getImageUrl(article.image)}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x250/e0e0e0/555555?text=Error+Loading";
                    }}
                />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                {/* Chủ đề và ngày đăng */}
                <div className="flex items-center text-sm font-medium mb-3">
                    <span className="flex items-center text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Tag size={12} className="mr-1" /> {article.topic?.name || 'Tin tức'}
                    </span>
                    <span className="ml-auto text-gray-500 text-xs">
                        📅 {new Date(article.created_at).toLocaleDateString('vi-VN')}
                    </span>
                </div>

                {/* Tiêu đề */}
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-800 transition duration-150">
                    {article.title}
                </h3>

                {/* Mô tả ngắn */}
                <p className="text-gray-600 mb-5 text-base flex-grow line-clamp-3 leading-relaxed">
                    {article.description || article.excerpt || "Đang cập nhật..."}
                </p>

                {/* Nút Chi tiết */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNavigation();
                    }}
                    className="mt-auto w-full text-center py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition duration-150 shadow-lg shadow-indigo-500/50"
                >
                    <BookOpen size={18} className="inline mr-2" /> Đọc Ngay
                </button>
            </div>
        </div>
    );
};

// ====================================================================
// COMPONENT CHÍNH: ArticleListingPage
// ====================================================================

export default function ArticleListingPage() {
    const router = useRouter();

    // STATE
    const [posts, setPosts] = useState([]);
    const [topics, setTopics] = useState([]);

    const [selectedTopic, setSelectedTopic] = useState('all'); // 'all' or topic_id
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // FETCH TOPICS
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await TopicService.getAll({ status: 1 });
                // httpAxios unwraps response.data automatically
                // res = { success: true, data: { data: [...], ... } OR data: [...] }
                console.log("Topics API response:", res); // Debug log

                // Handle both paginated and non-paginated response
                const topicsData = res?.data?.data || res?.data || [];
                setTopics(Array.isArray(topicsData) ? topicsData : []);
            } catch (error) {
                console.error("Fetch topics error:", error);
            }
        };
        fetchTopics();
    }, []);

    // FETCH POSTS
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: 8,  // Use per_page for pagination (not limit)
                status: 1,
                search: searchTerm || undefined,
                topic_id: selectedTopic !== 'all' ? selectedTopic : undefined,
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            const res = await PostService.index(params);
            // httpAxios interceptor returns response.data directly
            // So res = { success: true, message: '...', data: {...paginator...} }

            console.log("Posts API response:", res);

            // res.data is the paginator: { current_page, data: [...], last_page, total }
            const paginator = res?.data;
            if (paginator && paginator.data) {
                setPosts(paginator.data);
                setTotalPages(paginator.last_page || 1);
            } else {
                // If data is array directly (non-paginated)
                setPosts(Array.isArray(res?.data) ? res.data : []);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Fetch posts error:", error);
        }
        setLoading(false);
    }, [currentPage, selectedTopic, searchTerm]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // HANDLERS
    const handleCategorySelect = (topicId) => {
        setSelectedTopic(topicId);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white border-b border-indigo-100 shadow-sm">
                <div className="container mx-auto px-4 lg:px-8 py-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 flex items-center">
                        <BookOpen size={40} className="text-indigo-600 mr-4" />
                        Góc Tri Thức & Tin Tức
                    </h1>
                    <p className="text-gray-600 max-w-4xl text-lg">
                        Cập nhật tin tức mới nhất, bài viết chuyên sâu và kiến thức bổ ích.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 lg:px-8 py-12">

                {/* FILTER SECTION */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-12 border-l-4 border-indigo-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                        <Filter size={24} className="mr-2 text-indigo-600" /> Bộ Lọc
                    </h2>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                        {/* Search */}
                        <div className="lg:col-span-1">
                            <label className="text-gray-700 font-bold text-lg mb-2 block">Tìm kiếm:</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tiêu đề bài viết..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full p-4 pl-12 border-2 border-indigo-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-base transition duration-150 shadow-inner"
                                />
                                <Search size={22} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Topics */}
                        <div className='lg:col-span-2'>
                            <label className="text-gray-700 font-bold text-lg mb-2 flex items-center">
                                <LayoutList size={20} className="mr-2 text-indigo-600" /> Chủ đề:
                            </label>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handleCategorySelect('all')}
                                    className={`px-5 py-3 text-base font-bold rounded-full transition duration-200 shadow-md ${selectedTopic === 'all'
                                        ? 'bg-indigo-600 text-white shadow-indigo-400/50'
                                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    Tất cả
                                </button>
                                {topics.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => handleCategorySelect(topic.id)}
                                        className={`px-5 py-3 text-base font-bold rounded-full transition duration-200 shadow-md ${selectedTopic === topic.id
                                            ? 'bg-indigo-600 text-white shadow-indigo-400/50'
                                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        {topic.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RESULTS HEADER */}
                <div className='flex justify-between items-center mb-6 border-b pb-3'>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Danh Sách Bài Viết
                    </h2>
                </div>

                {/* POST LIST */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-indigo-600" size={48} />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {posts.map((post) => (
                            <ArticleCard key={post.id} article={post} router={router} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-lg border-4 border-dashed border-gray-200">
                        <Search size={64} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-2xl font-bold text-gray-600">Không tìm thấy bài viết nào.</p>
                        <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa hoặc chủ đề khác.</p>
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-3">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-3 rounded-xl transition duration-200 flex items-center font-semibold text-sm ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md border border-indigo-300'
                                }`}
                        >
                            <ArrowLeft size={20} className="mr-1" /> Trang Trước
                        </button>

                        <span className="px-5 py-3 font-bold bg-indigo-600 text-white rounded-xl shadow-lg">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-3 rounded-xl transition duration-200 flex items-center font-semibold text-sm ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md border border-indigo-300'
                                }`}
                        >
                            Trang Sau <ArrowRight size={20} className="ml-1" />
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}