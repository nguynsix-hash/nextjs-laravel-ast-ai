"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Loader2,
    Mail,
    Phone,
    Calendar,
    MessageCircle
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
            // Get user from localStorage
            const userData = localStorage.getItem('client_user');
            if (!userData) {
                router.push('/main/account/login');
                return;
            }

            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Fetch contacts by user_id
            try {
                const res = await ContactService.getAll({
                    user_id: parsedUser.id,
                    sort_by: 'created_at',
                    sort_order: 'desc'
                });

                // Handle response
                const data = res?.data?.data || res?.data || [];
                setContacts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Fetch contacts error:", error);
            }
            setLoading(false);
        };

        checkAuthAndFetch();
    }, [router]);

    // Parse content to separate original message and replies
    const parseContent = (content) => {
        if (!content) return { original: '', replies: [] };

        const parts = content.split('\n\n---\n📩 **Phản hồi từ Admin');
        const original = parts[0] || '';
        const replies = [];

        for (let i = 1; i < parts.length; i++) {
            replies.push(parts[i]);
        }

        return { original, replies };
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        if (status === 1) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <CheckCircle size={14} /> Đã phản hồi
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                <Clock size={14} /> Chờ xử lý
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition"
                    >
                        <ArrowLeft size={20} /> Quay lại
                    </button>

                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <MessageSquare className="text-blue-600" size={32} />
                        Liên hệ của tôi
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Xem lịch sử các liên hệ bạn đã gửi và phản hồi từ Admin
                    </p>
                </div>

                {/* Contact List */}
                {contacts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
                        <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-gray-600 mb-2">Chưa có liên hệ nào</h3>
                        <p className="text-gray-400 mb-6">Bạn chưa gửi liên hệ nào đến chúng tôi</p>
                        <button
                            onClick={() => router.push('/main/contact')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                        >
                            Gửi liên hệ mới
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contacts.map((contact) => {
                            const { original, replies } = parseContent(contact.content);
                            const isSelected = selectedContact?.id === contact.id;

                            return (
                                <div
                                    key={contact.id}
                                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                                        }`}
                                >
                                    {/* Contact Header */}
                                    <div
                                        className="p-6 cursor-pointer"
                                        onClick={() => setSelectedContact(isSelected ? null : contact)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <StatusBadge status={contact.status} />
                                                    {replies.length > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                                            <MessageCircle size={12} /> {replies.length} phản hồi
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-800 font-medium line-clamp-2">
                                                    {original.substring(0, 150)}...
                                                </p>

                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(contact.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={14} />
                                                        {contact.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <ArrowLeft
                                                size={20}
                                                className={`text-gray-400 transition-transform ${isSelected ? 'rotate-90' : '-rotate-90'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isSelected && (
                                        <div className="border-t bg-gray-50 p-6 space-y-4">
                                            {/* Original Message */}
                                            <div className="bg-white p-4 rounded-xl border">
                                                <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                                    Nội dung bạn đã gửi
                                                </h4>
                                                <p className="text-gray-800 whitespace-pre-line">{original}</p>
                                            </div>

                                            {/* Replies */}
                                            {replies.length > 0 ? (
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-bold text-green-600 uppercase tracking-wide flex items-center gap-2">
                                                        <CheckCircle size={16} /> Phản hồi từ Admin
                                                    </h4>
                                                    {replies.map((reply, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-green-50 p-4 rounded-xl border border-green-100"
                                                        >
                                                            <p className="text-gray-800 whitespace-pre-line">
                                                                {reply.replace(/\*\*:?\n?/g, '').trim()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center">
                                                    <Clock className="mx-auto text-yellow-500 mb-2" size={24} />
                                                    <p className="text-yellow-700 font-medium">
                                                        Đang chờ phản hồi từ Admin
                                                    </p>
                                                    <p className="text-yellow-600 text-sm">
                                                        Chúng tôi sẽ phản hồi trong thời gian sớm nhất
                                                    </p>
                                                </div>
                                            )}
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
