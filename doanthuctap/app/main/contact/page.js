"use client";
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import ContactService from '@/services/ContactService';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Payload matches backend expectations: name, email, phone, content, status=1
            const payload = {
                ...formData,
                status: 1 // Default status for new contact
            };

            const res = await ContactService.create(payload);

            if (res?.success) {
                setStatus({ type: 'success', message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.' });
                setFormData({ name: '', email: '', phone: '', content: '' });
            } else {
                setStatus({ type: 'error', message: res?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
            }
        } catch (error) {
            console.error("Contact submit error:", error);
            setStatus({ type: 'error', message: 'Lỗi kết nối server. Vui lòng thử lại sau.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        LIÊN HỆ VỚI CHÚNG TÔI
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại tin nhắn hoặc ghé thăm cửa hàng của chúng tôi.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: INFO & MAP */}
                    <div className="space-y-8">
                        {/* Contact Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Địa chỉ</h3>
                                <p className="text-sm text-gray-500">215, Điện Biên Phủ, Hồ Chí Minh</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <Phone size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Hotline</h3>
                                <p className="text-sm text-gray-500">0123 456 789</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                                    <Mail size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                                <p className="text-sm text-gray-500">contact@eshop.com</p>
                            </div>
                        </div>

                        {/* MAP */}
                        <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm h-[400px] overflow-hidden relative group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2215983796856!2d106.70295287451745!3d10.794301558863695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528b6d8579d49%3A0xe744e2401f092323!2zMjE1IMSQaeG7h24gQmnDqm4gUGjhu6csIFBoxrDhu51uZyAxNSwgQsOsbmggVGjhuqFuaCwgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1715582345123!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-2xl w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                            ></iframe>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FORM */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-black rounded-full block"></span>
                            GỬI TIN NHẮN
                        </h2>

                        {status.message && (
                            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {status.type === 'success' ? <CheckCircle className="shrink-0" size={20} /> : <AlertCircle className="shrink-0" size={20} />}
                                <p className="text-sm font-bold">{status.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập tên của bạn"
                                    className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="example@gmail.com"
                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0912 345 678"
                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nội dung</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Bạn cần hỗ trợ gì?"
                                    className="w-full p-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400 resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg tracking-wide uppercase transition-all shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}