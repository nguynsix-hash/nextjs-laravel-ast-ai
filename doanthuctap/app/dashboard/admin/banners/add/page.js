"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Link, Image as ImageIcon, Save, X, ChevronLeft, Layout, Hash, AlignLeft } from "lucide-react";
import BannerService from "@/services/BannerService";
import { toast } from "react-hot-toast";

export default function AddBanner() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [link, setLink] = useState("");
    const [position, setPosition] = useState("slideshow");
    const [sortOrder, setSortOrder] = useState(0);
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!imageFile) {
            toast.error("Vui lòng chọn ảnh banner!");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Đang lưu dữ liệu...");

        try {
            const bannerData = {
                name,
                image: imageFile,
                link,
                position,
                sort_order: sortOrder,
                description,
                status,
            };

            // Gọi service
            const res = await BannerService.store(bannerData);

            // VÌ CÓ INTERCEPTOR NÊN res CHÍNH LÀ DATA TỪ LARAVEL (có success, message, data)
            if (res && res.success) {
                toast.success(res.message || "Thành công!", { id: loadingToast });
                
                // ĐIỀU HƯỚNG QUAN TRỌNG:
                // Dùng setTimeout để đảm bảo toast kịp hiển thị và event loop xử lý xong
                setTimeout(() => {
                    router.push("/dashboard/admin/banners");
                    router.refresh();
                }, 500);
            } else {
                toast.error("Lưu thất bại!", { id: loadingToast });
            }

        } catch (error) {
            console.error("Full Error:", error);
            
            // Xử lý lỗi 422 (Validation)
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors;
                const firstMsg = Object.values(errors)[0][0];
                toast.error(`Lỗi: ${firstMsg}`, { id: loadingToast });
            } else {
                toast.error(error.response?.data?.message || "Lỗi hệ thống", { id: loadingToast });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight text-blue-600">
                            <PlusCircle size={28} /> Thêm Banner
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/admin/banners")}
                        className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 flex items-center gap-1"
                    >
                        <ChevronLeft size={16} /> Quay lại
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Tên Banner</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Vị trí</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                            >
                                <option value="slideshow">Slideshow</option>
                                <option value="ads">Quảng cáo</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col justify-center">
                            <label className="text-[11px] font-black uppercase text-slate-400 mb-2">Hình ảnh</label>
                            <input type="file" onChange={handleImageChange} className="text-xs" />
                        </div>
                        <div className="h-40 bg-white rounded-xl border flex items-center justify-center overflow-hidden">
                            {imagePreviewUrl ? (
                                <img src={imagePreviewUrl} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="text-slate-200" size={40} />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400">Link</label>
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400">Thứ tự</label>
                            <input
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400">Trạng thái</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                            >
                                <option value={1}>Hiển thị</option>
                                <option value={0}>Ẩn</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : "Lưu dữ liệu"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/banners")}
                            className="px-8 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}