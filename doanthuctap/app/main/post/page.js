"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // 💡 IMPORT useRouter
import { BookOpen, Tag, Filter, ArrowLeft, ArrowRight, Search, LayoutList, X } from 'lucide-react'; 

// ====================================================================
// DỮ LIỆU GIẢ ĐỊNH (GIỮ NGUYÊN)
// ====================================================================

const mockCategories = ['Tất cả', 'Công nghệ', 'Kinh doanh', 'Đời sống', 'Sức khỏe', 'Khoa học', 'Tài chính'];

const mockArticles = [
    {
        id: 1,
        title: 'Bí quyết tối ưu hóa hiệu năng React Hooks',
        excerpt: 'Tìm hiểu sâu về cách sử dụng useMemo, useCallback và React.memo để cải thiện tốc độ ứng dụng React.',
        category: 'Công nghệ',
        imageUrl: 'https://placehold.co/400x250/4F46E5/FFFFFF?text=React+Hooks',
        date: '2024-10-20',
    },
    {
        id: 2,
        title: '10 xu hướng AI định hình tương lai ngành bán lẻ',
        excerpt: 'Từ cá nhân hóa đến tự động hóa chuỗi cung ứng, AI đang thay đổi cách thức vận hành của các doanh nghiệp bán lẻ.',
        category: 'Kinh doanh',
        imageUrl: 'https://placehold.co/400x250/10B981/FFFFFF?text=AI+Retail+Tech',
        date: '2024-10-18',
    },
    {
        id: 3,
        title: 'Cách duy trì sự tập trung trong môi trường làm việc từ xa',
        excerpt: 'Các mẹo đơn giản nhưng hiệu quả để giữ vững năng suất và tránh xao nhãng khi làm việc tại nhà.',
        category: 'Đời sống',
        imageUrl: 'https://placehold.co/400x250/F59E0B/FFFFFF?text=Work+Remote',
        date: '2024-10-15',
    },
    {
        id: 4,
        title: 'Những thực phẩm siêu cấp giúp tăng cường hệ miễn dịch',
        excerpt: 'Danh sách các loại rau củ và trái cây không thể thiếu trong chế độ ăn uống hàng ngày của bạn.',
        category: 'Sức khỏe',
        imageUrl: 'https://placehold.co/400x250/EF4444/FFFFFF?text=Healthy+Food',
        date: '2024-10-10',
    },
    {
        id: 5,
        title: 'Khám phá hố đen: Bí ẩn lớn nhất của vũ trụ',
        excerpt: 'Một cái nhìn toàn diện về sự hình thành, cấu trúc và những khám phá gần đây về hố đen.',
        category: 'Khoa học',
        imageUrl: 'https://placehold.co/400x250/374151/FFFFFF?text=Black+Hole',
        date: '2024-10-05',
    },
    {
        id: 6,
        title: 'So sánh hiệu năng giữa Fiber và Async/Await trong Node.js',
        excerpt: 'Phân tích ưu và nhược điểm của hai phương pháp xử lý bất đồng bộ phổ biến nhất trong Node.js.',
        category: 'Công nghệ',
        imageUrl: 'https://placehold.co/400x250/6366F1/FFFFFF?text=Node+Async',
        date: '2024-09-28',
    },
    { id: 7, title: 'Hướng dẫn đầu tư cơ bản cho người mới', excerpt: 'Những nguyên tắc vàng bạn cần nắm vững trước khi tham gia thị trường chứng khoán.', category: 'Tài chính', imageUrl: 'https://placehold.co/400x250/06B6D4/FFFFFF?text=Investment+101', date: '2024-09-25' },
    { id: 8, title: 'Yoga: Phương pháp thư giãn tuyệt vời cho tâm trí', excerpt: 'Tác dụng của các bài tập yoga đơn giản trong việc giảm căng thẳng và cải thiện giấc ngủ.', category: 'Đời sống', imageUrl: 'https://placehold.co/400x250/A855F7/FFFFFF?text=Yoga+Relax', date: '2024-09-20' },
    { id: 9, title: 'Lịch sử phát triển của Internet', excerpt: 'Từ ARPANET đến Web 3.0, hành trình phát triển đáng kinh ngạc của mạng lưới toàn cầu.', category: 'Công nghệ', imageUrl: 'https://placehold.co/400x250/84CC16/FFFFFF?text=Internet+History', date: '2024-09-15' },
    { id: 10, title: 'Bí mật của các doanh nhân thành công', excerpt: 'Những thói quen và tư duy giúp các tỷ phú xây dựng nên đế chế của mình.', category: 'Kinh doanh', imageUrl: 'https://placehold.co/400x250/F97316/FFFFFF?text=Success+Habits', date: '2024-09-10' },
    { id: 11, title: 'Tác hại của việc thiếu ngủ kéo dài', excerpt: 'Phân tích các rủi ro sức khỏe nghiêm trọng khi bạn không ngủ đủ 7-8 tiếng mỗi đêm.', category: 'Sức khỏe', imageUrl: 'https://placehold.co/400x250/DC2626/FFFFFF?text=Sleep+Deprivation', date: '2024-09-05' },
    { id: 12, title: 'Làm thế nào để học một ngôn ngữ lập trình mới hiệu quả', excerpt: 'Chiến lược học tập từ cơ bản đến nâng cao cho người muốn trở thành lập trình viên.', category: 'Công nghệ', imageUrl: 'https://placehold.co/400x250/4C051E/FFFFFF?text=Coding+Tips', date: '2024-09-01' },
    { id: 13, title: 'Nguyên tắc quản lý ngân sách cá nhân', excerpt: 'Xây dựng thói quen tài chính lành mạnh và đạt được mục tiêu tiết kiệm nhanh hơn.', category: 'Tài chính', imageUrl: 'https://placehold.co/400x250/9333EA/FFFFFF?text=Budget+Plan', date: '2024-08-25' },
    { id: 14, title: 'Tìm hiểu về công nghệ Blockchain', excerpt: 'Blockchain là gì, cách hoạt động và ứng dụng của nó ngoài tiền điện tử.', category: 'Công nghệ', imageUrl: 'https://placehold.co/400x250/0D9488/FFFFFF?text=Blockchain', date: '2024-08-20' },
];

// Số lượng bài viết trên mỗi trang
const ARTICLES_PER_PAGE = 6;

// ====================================================================
// COMPONENT CON: ArticleCard (ĐÃ SỬA ĐỂ CHUYỂN HƯỚNG)
// ====================================================================

const ArticleCard = ({ article, router }) => {
    
    // Hàm xử lý chuyển hướng
    const handleNavigation = () => {
        // Sử dụng router.push() để chuyển hướng đến trang chi tiết
        router.push(`/main/post/id${article.id}`);
    };

    return (
        <div 
            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col transform hover:scale-[1.01] cursor-pointer"
            onClick={handleNavigation} // 💡 Gắn sự kiện click vào toàn bộ card
        >
            
            {/* Hình đại diện */}
            <div className="relative w-full h-52 overflow-hidden">
                <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://placehold.co/400x250/9CA3AF/FFFFFF?text=${article.category.replace(/\s/g, '+')}`;
                    }}
                />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                {/* Chủ đề và ngày đăng */}
                <div className="flex items-center text-sm font-medium mb-3">
                    <span className="flex items-center text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Tag size={12} className="mr-1" /> {article.category}
                    </span>
                    <span className="ml-auto text-gray-500 text-xs">📅 {article.date}</span>
                </div>

                {/* Tiêu đề */}
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-800 transition duration-150">
                    {article.title}
                </h3>

                {/* Mô tả ngắn */}
                <p className="text-gray-600 mb-5 text-base flex-grow line-clamp-3 leading-relaxed">
                    {article.excerpt}
                </p>

                {/* Nút Chi tiết */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn sự kiện click lan ra card
                        handleNavigation(); // Gọi hàm chuyển hướng
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
    // 💡 KHAI BÁO ROUTER
    const router = useRouter(); 

    // State cho việc lọc
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);

    // --- LOGIC LỌC, TÌM KIẾM & SẮP XẾP (useMemo) ---
    const filteredArticles = useMemo(() => {
        let tempArticles = mockArticles;

        // Lọc theo Chủ đề
        if (selectedCategory !== 'Tất cả') {
            tempArticles = tempArticles.filter(
                (article) => article.category === selectedCategory
            );
        }

        // Lọc theo Tìm kiếm
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            tempArticles = tempArticles.filter(
                (article) => 
                    article.title.toLowerCase().includes(lowerCaseSearch) ||
                    article.excerpt.toLowerCase().includes(lowerCaseSearch)
            );
        }
        
        // Sắp xếp theo ngày mới nhất (đảm bảo bài mới nhất hiển thị trước)
        return tempArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [selectedCategory, searchTerm]);

    // --- LOGIC PHÂN TRANG ---
    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const currentArticles = filteredArticles.slice(
        startIndex,
        startIndex + ARTICLES_PER_PAGE
    );

    // Xử lý chuyển trang
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            // Cuộn lên đầu trang sau khi chuyển trang
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    // Xử lý khi chọn Category mới
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1); // RESET TRANG KHI LỌC
    };

    // Xử lý khi tìm kiếm mới
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // RESET TRANG KHI TÌM KIẾM
    };
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white border-b border-indigo-100 shadow-sm">
                <div className="container mx-auto px-4 lg:px-8 py-8"> 
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 flex items-center">
                        <BookOpen size={40} className="text-indigo-600 mr-4" />
                        Góc Tri Thức & Tin Tức ESHOP
                    </h1>
                    <p className="text-gray-600 max-w-4xl text-lg">
                        Khám phá các bài viết chuyên sâu về công nghệ, kinh doanh và đời sống, được cập nhật liên tục từ các chuyên gia hàng đầu.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 lg:px-8 py-12">
                
                {/* Khu vực Lọc và Tìm kiếm */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-12 border-l-4 border-indigo-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                        <Filter size={24} className="mr-2 text-indigo-600" /> Bộ Lọc Thông Minh
                    </h2>
                    
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        
                        {/* Thanh tìm kiếm */}
                        <div className="lg:col-span-1">
                            <label className="text-gray-700 font-bold text-lg mb-2 block">Tìm kiếm:</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tiêu đề, mô tả..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full p-4 pl-12 border-2 border-indigo-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-base transition duration-150 shadow-inner"
                                />
                                <Search size={22} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                                        aria-label="Xóa tìm kiếm"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Lọc theo Chủ đề (Categories) */}
                        <div className='lg:col-span-2'>
                            <label className="text-gray-700 font-bold text-lg mb-2 flex items-center">
                                <LayoutList size={20} className="mr-2 text-indigo-600" /> Chủ đề:
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {mockCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategorySelect(category)}
                                        className={`px-5 py-3 text-base font-bold rounded-full transition duration-200 shadow-md ${
                                            selectedCategory === category
                                                ? 'bg-indigo-600 text-white shadow-indigo-400/50'
                                                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hiển thị kết quả */}
                <div className='flex justify-between items-center mb-6 border-b pb-3'>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {selectedCategory === 'Tất cả' && !searchTerm ? 'Tất Cả Bài Viết' : 'Kết Quả Lọc'} 
                        <span className='text-indigo-600 ml-3'>({filteredArticles.length} bài)</span>
                    </h2>
                    {selectedCategory !== 'Tất cả' && (
                        <span className='text-sm text-gray-500'>
                            Đang xem: <strong className='text-indigo-600'>{selectedCategory}</strong>
                        </span>
                    )}
                </div>

                {/* Danh sách Bài viết */}
                {currentArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> 
                        {currentArticles.map((article) => (
                            // 💡 TRUYỀN ROUTER VÀO ArticleCard
                            <ArticleCard key={article.id} article={article} router={router} /> 
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-lg border-4 border-dashed border-gray-200">
                        <Search size={64} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-2xl font-bold text-gray-600">Không tìm thấy bài viết nào.</p>
                        <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa hoặc chủ đề khác.</p>
                    </div>
                )}

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-3">
                        
                        {/* Nút Quay lại */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-3 rounded-xl transition duration-200 flex items-center font-semibold text-sm ${
                                currentPage === 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md border border-indigo-300'
                            }`}
                            aria-label="Trang trước"
                        >
                            <ArrowLeft size={20} className="mr-1" /> Trang Trước
                        </button>

                        {/* Hiển thị các số trang */}
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Chỉ hiển thị tối đa 5 nút trang (trang hiện tại + 2 trước, 2 sau)
                            const maxPagesToShow = 5;
                            const start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                            const end = Math.min(totalPages, start + maxPagesToShow - 1);

                            if (pageNumber >= start && pageNumber <= end) {
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`w-10 h-10 font-bold rounded-lg transition duration-200 ${
                                            currentPage === pageNumber
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/50'
                                                : 'bg-white text-gray-700 hover:bg-indigo-100 border border-gray-200'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            }
                            return null;
                        })}

                        {/* Nút Kế tiếp */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-3 rounded-xl transition duration-200 flex items-center font-semibold text-sm ${
                                currentPage === totalPages 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md border border-indigo-300'
                            }`}
                            aria-label="Trang sau"
                        >
                            Trang Sau <ArrowRight size={20} className="ml-1" />
                        </button>
                    </div>
                )}
                
            </main>
        </div>
    );
}