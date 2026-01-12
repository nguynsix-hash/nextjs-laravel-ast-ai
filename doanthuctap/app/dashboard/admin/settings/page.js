"use client";
import React, { useState, useEffect } from "react";
import { Settings, Globe, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";
import ConfigService from "@/services/ConfigService"; // Import ConfigService

export default function SettingsPage() {
    // ===============================
    // STATE
    // ===============================
    const [id, setId] = useState(null); // ID của bản ghi cấu hình (giả định là 1)
    const [siteName, setSiteName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [hotline, setHotline] = useState("");
    const [address, setAddress] = useState("");
    
    const [loading, setLoading] = useState(true); // Bắt đầu ở trạng thái loading khi component mount
    const [saving, setSaving] = useState(false); // Trạng thái đang lưu

    // ===============================
    // LOAD DATA FROM API
    // ===============================
    useEffect(() => {
        const loadConfig = async () => {
            setLoading(true);
            try {
                // Giả định: API getAll trả về mảng, ta lấy phần tử đầu tiên (hoặc gọi getById(1))
                const res = await ConfigService.getAll(); 
                const configData = res.data.data?.[0]; // Lấy bản ghi đầu tiên trong mảng data

                if (configData) {
                    // Cập nhật state với dữ liệu từ API
                    setId(configData.id);
                    setSiteName(configData.site_name || "");
                    setEmail(configData.email || "");
                    setPhone(configData.phone || "");
                    setHotline(configData.hotline || "");
                    setAddress(configData.address || "");
                } else {
                    console.warn("Không tìm thấy dữ liệu cấu hình. Vui lòng tạo bản ghi ID=1.");
                    // Vẫn đặt ID để chuẩn bị cho việc tạo mới (nếu API hỗ trợ) hoặc cập nhật ID=1
                    setId(1); 
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu cấu hình:", error);
                alert("Lỗi khi tải dữ liệu cấu hình. Vui lòng kiểm tra console.");
            }
            setLoading(false);
        };

        loadConfig();
    }, []);

    // ===============================
    // HÀM SUBMIT FORM
    // ===============================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving || !id) return;

        setSaving(true);
        const data = {
            site_name: siteName,
            email: email,
            phone: phone,
            hotline: hotline,
            address: address,
            status: 1, // Giữ trạng thái mặc định là 1
        };

        try {
            // Giả định: Cập nhật dựa trên ID đã tải (thường là 1)
            const res = await ConfigService.update(id, data); 
            
            alert("Cập nhật thông tin website thành công!");

        } catch (error) {
            console.error("Lỗi khi cập nhật cấu hình:", error);
            alert("Lỗi khi cập nhật cấu hình. Vui lòng kiểm tra console.");
        }

        setSaving(false);
    };

    // Class Tailwind chung cho Input/Textarea/Select
    const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-inner text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <span className="ml-3 text-lg font-medium text-gray-700">Đang tải cấu hình...</span>
            </div>
        );
    }
    
    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200">
                
                {/* Header */}
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Settings size={26} className="text-blue-700" /> Cài đặt Chung Website
                    </h1>
                    <p className="text-gray-600 mt-1">Cập nhật thông tin cơ bản và liên hệ của trang web (ID: {id || 'Chưa xác định'}).</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* --- PHẦN 1: THÔNG TIN CƠ BẢN --- */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-300 shadow-sm">
                        <h2 className="text-xl font-extrabold mb-4 text-blue-900 flex items-center gap-2">
                            <Globe size={20} /> Cấu hình Website
                        </h2>
                        
                        {/* Tên website */}
                        <div>
                            <label htmlFor="siteName" className="block mb-2 text-base font-extrabold text-gray-800">Tên Website</label>
                            <input
                                id="siteName"
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                className={inputClass} 
                                placeholder="Nhập tên website của bạn"
                                required
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* --- PHẦN 2: THÔNG TIN LIÊN HỆ --- */}
                    <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 space-y-4 shadow-sm">
                        <h2 className="text-xl font-extrabold mb-4 text-gray-900 flex items-center gap-2">
                            <Phone size={20} className="text-green-700" /> Thông tin Liên hệ
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block mb-2 text-base font-extrabold text-gray-800 flex items-center gap-1">
                                    <Mail size={16} /> Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass} 
                                    placeholder="Địa chỉ email liên hệ"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block mb-2 text-base font-extrabold text-gray-800 flex items-center gap-1">
                                    <Phone size={16} /> Điện thoại (Văn phòng)
                                </label>
                                <input
                                    id="phone"
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={inputClass} 
                                    placeholder="Số điện thoại bàn"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Hotline */}
                        <div>
                            <label htmlFor="hotline" className="block mb-2 text-base font-extrabold text-gray-800 flex items-center gap-1">
                                <Phone size={16} className="text-red-500"/> Hotline
                            </label>
                            <input
                                id="hotline"
                                type="text"
                                value={hotline}
                                onChange={(e) => setHotline(e.target.value)}
                                className={inputClass} 
                                placeholder="Hotline hỗ trợ 24/7"
                                disabled={saving}
                            />
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <label htmlFor="address" className="block mb-2 text-base font-extrabold text-gray-800 flex items-center gap-1">
                                <MapPin size={16} /> Địa chỉ Công ty
                            </label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={inputClass} 
                                rows={3}
                                placeholder="Nhập địa chỉ chi tiết"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Button Actions */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className={`flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-extrabold hover:bg-blue-700 transition duration-200 shadow-lg ${saving || loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={saving || loading}
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}