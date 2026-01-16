"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    ArrowLeft,
    Loader2,
    Mail,
    Calendar,
    MessageCircle,
    Send,
    User
} from 'lucide-react';
import ContactService from '@/services/ContactService';

export default function MyContactsPage() {
    const router = useRouter();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);

    // Check auth and fetch contacts
    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const userData = localStorage.getItem('client_user');
            if (!userData) {
                router.push('/main/account/login');
                return;
            }

            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            try {
                const res = await ContactService.getAll({
                    user_id: parsedUser.id,
                    sort_by: 'created_at',
                    sort_order: 'desc'
                });
                const data = res?.data?.data || res?.data || [];
                setContacts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Fetch contacts error:", error);
            }
            setLoading(false);
        };

        checkAuthAndFetch();
    }, [router]);

    // Parse content
    const parseContent = (content) => {
        if (!content) return { original: '', replies: [] };
        const parts = content.split('\n\n---\n📩 **Phản hồi từ Admin');
        const original = parts[0] || '';
        const replies = parts.slice(1);
        return { original, replies };
    };

    // UI Status Badge
    const StatusBadge = ({ status }) => {
        if (status === 1) {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200/50">
                    <CheckCircle size={14} className="fill-emerald-500 text-white" />
                    <span>Đã phản hồi</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 shadow-sm border border-amber-200/50">
                <Clock size={14} className="fill-amber-500 text-white" />
                <span>Chờ xử lý</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600 drop-shadow-lg" size={48} />
                    <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-100 py-10 px-4 md:px-0">
            <div className="max-w-5xl mx-auto">
                {/* HEAD SECTION */}
                <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-all duration-300 hover:-translate-x-1"
                    >
                        <div className="p-2 rounded-full bg-white shadow-sm ring-1 ring-slate-200 group-hover:ring-indigo-200 group-hover:bg-indigo-50 transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-medium">Quay lại</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                Liên hệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">của bạn</span>
                            </h1>
                            <p className="text-slate-500 text-lg max-w-2xl">
                                Theo dõi trạng thái và lịch sử trao đổi giữa bạn và đội ngũ hỗ trợ.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/main/contact')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <Send size={18} /> Gửi liên hệ mới
                        </button>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                {contacts.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border border-white/50 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <MessageSquare className="text-indigo-300" size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Chưa có liên hệ nào</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Bạn chưa gửi bất kỳ yêu cầu hỗ trợ nào. Nếu cần giúp đỡ, đừng ngần ngại gửi tin nhắn cho chúng tôi.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {contacts.map((contact, index) => {
                            const { original, replies } = parseContent(contact.content);
                            const isSelected = selectedContact?.id === contact.id;

                            return (
                                <div
                                    key={contact.id}
                                    className={`group relative bg-white/70 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 border transition-all duration-300 overflow-hidden ${isSelected ? 'ring-2 ring-indigo-500 border-transparent bg-white shadow-2xl scale-[1.01] z-10' : 'border-white/60 hover:border-indigo-200'}`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Summary Card */}
                                    <div
                                        className="p-6 cursor-pointer"
                                        onClick={() => setSelectedContact(isSelected ? null : contact)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-3 mb-3">
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                        #{contact.id}
                                                    </span>
                                                    <StatusBadge status={contact.status} />
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        {new Date(contact.created_at).toLocaleDateString('vi-VN', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                <h3 className={`text-lg font-bold text-slate-800 mb-1 transition-colors ${isSelected ? 'text-indigo-700' : 'group-hover:text-indigo-600'}`}>
                                                    {original.length > 80 ? original.substring(0, 80) + '...' : original}
                                                </h3>

                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Mail size={14} /> {contact.email}
                                                    </div>
                                                    {replies.length > 0 && (
                                                        <div className="flex items-center gap-1 text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                                                            <MessageCircle size={14} /> {replies.length} phản hồi
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`p-2 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all ${isSelected ? 'rotate-90 bg-indigo-100 text-indigo-600' : ''}`}>
                                                <ArrowLeft size={20} className="transform rotate-180" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isSelected && (
                                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex flex-col gap-6">
                                                {/* Original Message Bubble */}
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
                                                            <User size={20} className="text-slate-500" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline justify-between mb-1">
                                                            <span className="font-bold text-slate-700">Bạn</span>
                                                            <span className="text-xs text-slate-400 text-right">{new Date(contact.created_at).toLocaleTimeString('vi-VN')}</span>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                                                            {original}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Admin Reply Bubble */}
                                                {replies.length > 0 ? (
                                                    replies.map((reply, idx) => (
                                                        <div key={idx} className="flex flex-row-reverse gap-4">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-white shadow-md flex items-center justify-center">
                                                                    <span className="font-bold text-white text-xs">SV</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 text-right">
                                                                <div className="mb-1">
                                                                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Admin Support</span>
                                                                </div>
                                                                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-indigo-500/20 text-white/95 leading-relaxed text-left whitespace-pre-line">
                                                                    {reply.replace(/\*\*:?\n?/g, '').trim()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex gap-4 opacity-70">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center animate-pulse">
                                                                <Clock size={18} className="text-slate-400" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-slate-100 border border-slate-200 border-dashed p-4 rounded-2xl text-slate-500 italic text-sm">
                                                                Đang chờ phản hồi từ quản trị viên...
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
