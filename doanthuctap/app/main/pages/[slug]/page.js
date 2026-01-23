"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, FileText, AlertCircle, ChevronRight, Share2, Printer, Clock, ShieldCheck } from 'lucide-react';
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
                    // DEFAULT CONTENT IF NOT FOUND IN DB
                    let defaultContent = "";
                    const title = PAGE_TITLES[slug] || 'Trang thông tin';

                    // RICH CONTENT TEMPLATES
                    switch (slug) {
                        case 'about':
                            defaultContent = `
                                <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                                    <p class="text-xl text-gray-500 font-light italic border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/50 rounded-r-lg">
                                        "ESHOP không chỉ bán sản phẩm, chúng tôi mang đến giải pháp công nghệ tối ưu cho cuộc sống của bạn."
                                    </p>
                                    <p class="leading-relaxed text-gray-700">Được thành lập vào năm 2024, <strong>ESHOP</strong> tự hào là hệ thống bán lẻ các sản phẩm công nghệ chính hãng với giá cả cạnh tranh nhất thị trường. Chúng tôi cam kết mang lại trải nghiệm mua sắm tuyệt vời cùng chế độ hậu mãi chu đáo, tận tâm.</p>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
                                        <div class="p-6 bg-white rounded-2xl shadow-lg shadow-indigo-100 hover:-translate-y-1 transition-transform border border-indigo-50">
                                            <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                            </div>
                                            <h3 class="font-bold text-gray-900 text-center mb-2">Chính hãng 100%</h3>
                                            <p class="text-sm text-gray-500 text-center">Cam kết sản phẩm chất lượng, nguồn gốc rõ ràng, full VAT.</p>
                                        </div>
                                        <div class="p-6 bg-white rounded-2xl shadow-lg shadow-purple-100 hover:-translate-y-1 transition-transform border border-purple-50">
                                            <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                            </div>
                                            <h3 class="font-bold text-gray-900 text-center mb-2">Bảo hành 1 đổi 1</h3>
                                            <p class="text-sm text-gray-500 text-center">Lỗi là đổi mới trong 30 ngày đầu tiên. Thủ tục đơn giản.</p>
                                        </div>
                                        <div class="p-6 bg-white rounded-2xl shadow-lg shadow-pink-100 hover:-translate-y-1 transition-transform border border-pink-50">
                                            <div class="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polyline points="8 21 8 16 16 16 16 21"/><polyline points="12 21 12 16"/><path d="M16 16v-3a2 2 0 0 0-2-2"/></svg>
                                            </div>
                                            <h3 class="font-bold text-gray-900 text-center mb-2">Giao hàng 2H</h3>
                                            <p class="text-sm text-gray-500 text-center">Giao siêu tốc nội thành HCM & HN. Nhận hàng ngay lập tức.</p>
                                        </div>
                                    </div>
                                    <p class="leading-relaxed text-gray-700">Với phương châm <em>"Khách hàng là trọng tâm"</em>, toàn thể đội ngũ ESHOP luôn nỗ lực không ngừng để hoàn thiện chất lượng dịch vụ, mang đến cho quý khách sự hài lòng tuyệt đối.</p>
                                </div>
                            `;
                            break;

                        case 'privacy-policy':
                            defaultContent = `
                                <div class="space-y-6 text-gray-700">
                                    <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                        <div class="bg-blue-600 text-white p-2 rounded-lg shrink-0 mt-1">
                                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 
                                        </div>
                                        <div>
                                            <h4 class="font-bold text-blue-800 text-lg">Cam kết bảo mật</h4>
                                            <p class="text-sm text-blue-700 mt-1">ESHOP cam kết bảo mật tuyệt đối thông tin cá nhân của quý khách hàng theo đúng quy định của pháp luật và chuẩn mực thương mại điện tử.</p>
                                        </div>
                                    </div>

                                    <div class="pl-4 border-l-2 border-gray-200 space-y-4">
                                        <h3 class="text-xl font-bold text-gray-900">1. Mục đích thu thập thông tin</h3>
                                        <p>Chúng tôi thu thập thông tin cá nhân chỉ cần thiết nhằm phục vụ cho mục đích:</p>
                                        <ul class="list-none space-y-2">
                                            <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Xử lý đơn hàng và giao nhận hàng hóa.</li>
                                            <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Thông báo về việc giao hàng và hỗ trợ khách hàng.</li>
                                            <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Cung cấp thông tin liên quan đến sản phẩm.</li>
                                        </ul>
                                    </div>

                                    <div class="pl-4 border-l-2 border-gray-200 space-y-4">
                                        <h3 class="text-xl font-bold text-gray-900">2. Phạm vi sử dụng thông tin</h3>
                                        <p>Thông tin cá nhân thu thập được sẽ chỉ được sử dụng trong nội bộ công ty. Chúng tôi có thể chia sẻ tên và địa chỉ của quý khách cho dịch vụ chuyển phát nhanh hoặc nhà cung cấp của chúng tôi để có thể giao hàng cho quý khách.</p>
                                    </div>

                                    <div class="pl-4 border-l-2 border-gray-200 space-y-4">
                                        <h3 class="text-xl font-bold text-gray-900">3. Thời gian lưu trữ thông tin</h3>
                                        <p>Thông tin của quý khách sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ. Còn lại trong mọi trường hợp thông tin cá nhân thành viên sẽ được bảo mật trên máy chủ của ESHOP.</p>
                                    </div>
                                </div>
                            `;
                            break;

                        case 'guide':
                        case 'buying-guide':
                            defaultContent = `
                                <div class="space-y-8">
                                    <div class="flex items-center justify-between bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
                                        <div>
                                            <h2 class="text-2xl font-bold">Quy trình mua hàng</h2>
                                            <p class="text-gray-400">Đơn giản - Nhanh chóng - Tiện lợi</p>
                                        </div>
                                        <div class="hidden md:block text-4xl font-black opacity-20">SHOPPING</div>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition hover:shadow-md">
                                            <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">1</div>
                                            <div>
                                                <h4 class="font-bold text-lg text-gray-900 mb-2">Tìm kiếm sản phẩm</h4>
                                                <p class="text-sm text-gray-500">Sử dụng ô tìm kiếm hoặc duyệt qua các danh mục để chọn sản phẩm ưng ý.</p>
                                            </div>
                                        </div>
                                        
                                        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition hover:shadow-md">
                                            <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">2</div>
                                            <div>
                                                <h4 class="font-bold text-lg text-gray-900 mb-2">Thêm vào giỏ hàng</h4>
                                                <p class="text-sm text-gray-500">Kiểm tra thông tin chi tiết, chọn màu sắc/phiên bản và nhấn "Mua ngay".</p>
                                            </div>
                                        </div>

                                        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition hover:shadow-md">
                                            <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">3</div>
                                            <div>
                                                <h4 class="font-bold text-lg text-gray-900 mb-2">Thanh toán & Giao hàng</h4>
                                                <p class="text-sm text-gray-500">Điền thông tin nhận hàng, chọn phương thức thanh toán an toàn.</p>
                                            </div>
                                        </div>

                                        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition hover:shadow-md">
                                            <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-black text-xl">4</div>
                                            <div>
                                                <h4 class="font-bold text-lg text-gray-900 mb-2">Nhận hàng</h4>
                                                <p class="text-sm text-gray-500">Kiểm tra hàng hóa và tận hưởng sản phẩm công nghệ tuyệt vời.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            break;

                        default:
                            defaultContent = `
                                <div class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 mb-2">Nội dung đang cập nhật</h3>
                                    <p class="text-gray-500 mb-6 max-w-md mx-auto">Thông tin cho trang "${title}" đang được biên tập và sẽ sớm ra mắt.</p>
                                    <button class="px-6 py-2 bg-gray-100 text-gray-600 rounded-full font-medium text-sm hover:bg-gray-200 transition">Quay lại trang chủ</button>
                                </div>`;
                    }

                    setPage({
                        title: title,
                        content: defaultContent,
                        isPlaceholder: true,
                        image: slug === 'about' ? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' : null,
                        updated_at: new Date().toISOString()
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                    <p className="text-gray-400 text-sm font-medium animate-pulse uppercase tracking-widest">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-3xl p-10 text-center shadow-xl max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-500 mb-8">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* HERO HEADER */}
            <div className="relative bg-gray-900 text-white overflow-hidden pb-12 pt-32 lg:pt-40 lg:pb-24">
                {/* Abstract Background pattern */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-3xl mix-blend-screen animate-blob"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000"></div>
                    {page?.image && (
                        <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-sm"></div>
                    )}
                    {page?.image && (
                        <img
                            src={page.image.startsWith('http') ? page.image : `http://localhost:8000/${page.image}`}
                            className="absolute inset-0 w-full h-full object-cover opacity-50 z-0 scale-105"
                            alt="Background"
                        />
                    )}
                </div>

                <div className="container mx-auto px-4 relative z-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 hover:bg-white/20 transition cursor-default">
                            <ShieldCheck size={14} /> Center of Excellence
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight drop-shadow-2xl">
                            {page?.title || PAGE_TITLES[slug]}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-300">
                            <span className="flex items-center gap-1"><Clock size={16} /> Cập nhật: {new Date(page?.updated_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span>2 phút đọc</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT WRAPPER - Overlapping header */}
            <div className="container mx-auto px-4 relative z-30 -mt-10 md:-mt-16">
                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

                    {/* MAIN CONTENT CARD */}
                    <div className="flex-1 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 md:p-12 lg:p-16 ring-1 ring-gray-100">
                        {/* Breadcrumb inside card */}
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 border-b border-gray-100 pb-4">
                            <button onClick={() => router.push('/main')} className="hover:text-indigo-600 transition">Trang chủ</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-900 font-medium truncate">{page?.title || slug}</span>
                        </div>

                        {/* HTML Content */}
                        <article className="prose prose-lg prose-indigo max-w-none 
                            prose-headings:font-bold prose-headings:text-gray-900 
                            prose-p:text-gray-600 prose-p:leading-relaxed 
                            prose-a:text-indigo-600 prose-a:font-semibold hover:prose-a:text-indigo-700
                            prose-strong:text-gray-900 prose-strong:font-bold
                            prose-ul:list-disc prose-ul:pl-5 prose-li:my-2
                            prose-img:rounded-2xl prose-img:shadow-lg
                            ">
                            {page?.content ? (
                                <div dangerouslySetInnerHTML={{ __html: page.content }} />
                            ) : (
                                <p className="text-center text-gray-500 italic">Nội dung đang cập nhật...</p>
                            )}
                        </article>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between text-gray-500 text-sm">
                            <div className="flex items-center gap-4">
                                <span className="font-semibold text-gray-900">Chia sẻ:</span>
                                <button className="hover:text-indigo-600 transition p-2 hover:bg-gray-50 rounded-full"><Share2 size={18} /></button>
                                <button className="hover:text-indigo-600 transition p-2 hover:bg-gray-50 rounded-full"><Printer size={18} /></button>
                            </div>
                            <p>© 2024 ESHOP Inc.</p>
                        </div>
                    </div>

                    {/* SIDEBAR NAVIGATION */}
                    <div className="lg:w-80 shrink-0 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                                Danh mục hỗ trợ
                            </h3>
                            <div className="space-y-1">
                                {Object.entries(PAGE_TITLES).slice(0, 6).map(([s, title]) => (
                                    <a
                                        key={s}
                                        href={`/main/pages/${s}`}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${slug === s
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <span className="font-medium text-sm">{title}</span>
                                        {slug === s && <ChevronRight size={16} />}
                                    </a>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition"></div>
                                    <h4 className="font-bold text-lg mb-2 relative z-10">Cần hỗ trợ gấp?</h4>
                                    <p className="text-indigo-100 text-xs mb-4 relative z-10">Đội ngũ CSKH của chúng tôi luôn sẵn sàng 24/7.</p>
                                    <button onClick={() => router.push('/main/contact')} className="w-full py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition shadow-lg relative z-10">Liên hệ ngay</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
