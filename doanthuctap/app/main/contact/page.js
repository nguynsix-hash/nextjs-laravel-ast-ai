"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertTriangle, CheckCircle } from 'lucide-react';

// Dữ liệu thông tin liên hệ mẫu (Giữ lại vì nó liên quan đến nội dung trang)
const CONTACT_INFO = {
    address: "Tầng 10, Tòa nhà ABC, 123 Đường Công Nghệ, Q. Bình Thạnh, TP.HCM",
    phone: "+84 901 234 567",
    email: "support@eshop.vn",
};

// --- Component Chính ContactPageContent (Chỉ là NỘI DUNG) ---
export default function ContactPageContent() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ message: '', type: '' }); // type: 'success' | 'error'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Xóa lỗi ngay khi người dùng bắt đầu nhập lại
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,12}$/;

        if (!formData.name.trim()) {
            newErrors.name = "Vui lòng nhập họ tên.";
        }
        
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            newErrors.email = "Email không hợp lệ.";
        }
        
        if (formData.phone.trim() && !phoneRegex.test(formData.phone)) {
             newErrors.phone = "Số điện thoại phải từ 10-12 chữ số.";
        }
        
        if (!formData.subject.trim()) {
            newErrors.subject = "Vui lòng nhập chủ đề.";
        }

        if (!formData.message.trim() || formData.message.trim().length < 10) {
            newErrors.message = "Nội dung tin nhắn phải ít nhất 10 ký tự.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus({ message: '', type: '' }); // Reset status

        if (validateForm()) {
            // --- Logic Xử Lý Dữ Liệu Hợp Lệ ---
            console.log("Dữ liệu gửi đi:", formData);

            // Giả lập lưu dữ liệu và thông báo thành công
            setStatus({ 
                message: "Cảm ơn bạn! Thông tin của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm nhất.", 
                type: 'success' 
            });
            // Reset form sau khi gửi thành công
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

        } else {
            // --- Logic Xử Lý Dữ Liệu KHÔNG Hợp Lệ ---
            setStatus({ 
                message: "Có lỗi xảy ra. Vui lòng kiểm tra lại các trường thông tin không hợp lệ.", 
                type: 'error' 
            });
        }
    };
    
    // --- Sub-Component: Input Field with Error Display ---
    const FormInput = ({ label, name, type = 'text', isTextArea = false, required = true, placeholder = '', ...rest }) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {isTextArea ? (
                <textarea
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`mt-1 block w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
                    {...rest}
                />
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`mt-1 block w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
                    {...rest}
                />
            )}
            {errors[name] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors[name]}
                </p>
            )}
        </div>
    );

    return (
        // Dùng div thay cho <main> và loại bỏ các class layout (min-h-screen, flex-col, Header, Footer)
        // MainLayout sẽ cung cấp thẻ <main> và cấu trúc flex cơ bản.
        <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Liên Hệ Với Chúng Tôi</h1>
                
                {/* --- 1. Map & Info Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    
                    {/* Bản đồ (Iframe Placeholder) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden h-96">
                        <iframe
                            title="Vị trí cửa hàng"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.288210343717!2d106.6974868!3d10.7937397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f36d6ed9a1d%3A0xf67586a97f2e1a3d!2sHUTECH!5e0!3m2!1svi!2s!4v1678877700000!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                        ></iframe>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600 h-full flex flex-col justify-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông Tin Liên Hệ</h2>
                        <ul className="space-y-4 text-gray-600">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1 mr-3" />
                                <span className="font-medium">Địa chỉ: <br/>{CONTACT_INFO.address}</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mr-3" />
                                <span className="font-medium">Điện thoại: {CONTACT_INFO.phone}</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mr-3" />
                                <span className="font-medium">Email: {CONTACT_INFO.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* --- 2. Contact Form Section --- */}
                <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl border-t-8 border-blue-600">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Gửi Yêu Cầu Liên Hệ</h2>
                    <p className="text-gray-600 text-center mb-8">Vui lòng điền đầy đủ thông tin vào form dưới đây, chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>

                    <form onSubmit={handleSubmit} noValidate>
                        
                        {/* Status Message */}
                        {status.message && (
                            <div className={`p-4 mb-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {status.type === 'success' ? <CheckCircle className="h-5 w-5 mr-3" /> : <AlertTriangle className="h-5 w-5 mr-3" />}
                                <span className="font-medium">{status.message}</span>
                            </div>
                        )}
                        
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <FormInput label="Họ Tên" name="name" placeholder="Ví dụ: Nguyễn Văn A" />
                            <FormInput label="Email" name="email" type="email" placeholder="email@example.com" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                             <FormInput 
                                label="Số Điện Thoại" 
                                name="phone" 
                                type="tel" 
                                placeholder="0901234567" 
                                required={false} // Không bắt buộc
                                pattern="[0-9]{10,12}" 
                            />
                            <FormInput label="Chủ Đề" name="subject" placeholder="Ví dụ: Hỗ trợ kỹ thuật" />
                        </div>
                        
                        <FormInput 
                            label="Nội Dung Tin Nhắn" 
                            name="message" 
                            isTextArea={true} 
                            placeholder="Chi tiết yêu cầu của bạn (Tối thiểu 10 ký tự)..."
                        />

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center justify-center space-x-2 text-lg"
                            >
                                <Send className="h-5 w-5" />
                                <span>Gửi Liên Hệ</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}