    "use client";
    import React, { useEffect, useRef, useState } from "react";
    import { useRouter, useParams } from "next/navigation";
    import {
        X,
        Check,
        FolderCog,
        Loader2,
        ImagePlus,
        Trash2
    } from "lucide-react";
    import CategoryService from "@/services/CategoryService";

    export default function CategoriesEdit() {
        const router = useRouter();
        const params = useParams();
        const id = params.id;

        const imageInputRef = useRef(null);

        // ================= STATE =================
        const [form, setForm] = useState({
            name: "",
            status: "active",
            description: "",
            imageFile: null,        // 🔥 Chứa File object khi chọn ảnh mới
            imagePreview: null,     // 🔥 URL hiển thị (Blob hoặc link server)
            remove_image: 0
        });

        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);
        const [errors, setErrors] = useState({}); // Lưu lỗi validate từ Backend

        // ================= LOAD CATEGORY =================
        useEffect(() => {
            if (!id) return;

            const fetchCategory = async () => {
                try {
                    const res = await CategoryService.getById(id);
                    // Tùy vào cấu trúc API của bạn (thường là res.data hoặc res.data.data)
                    const data = res.data?.data || res.data || res;

                    setForm({
                        name: data.name || "",
                        status: String(data.status) === "1" ? "active" : "inactive",
                        description: data.description || "",
                        imageFile: null, // Ban đầu chưa có file mới
                        imagePreview: data.image
                            ? CategoryService.getImageUrl(data.image)
                            : null,
                        remove_image: 0
                    });
                } catch (err) {
                    console.error(err);
                    alert("❌ Không thể tải dữ liệu danh mục");
                    router.push("/dashboard/admin/categories");
                } finally {
                    setLoading(false);
                }
            };

            fetchCategory();
        }, [id, router]);

        // ================= IMAGE HANDLERS =================
        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Kiểm tra định dạng và dung lượng file (Optional)
            if (file.size > 2 * 1024 * 1024) {
                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB");
                return;
            }

            setForm(prev => ({
                ...prev,
                imageFile: file, // Lưu file để gửi đi
                imagePreview: URL.createObjectURL(file), // Tạo link tạm để xem trước
                remove_image: 0
            }));
        };

        const removeImage = () => {
            setForm(prev => ({
                ...prev,
                imageFile: null,
                imagePreview: null,
                remove_image: 1
            }));
            // Reset giá trị input file để có thể chọn lại cùng 1 file vừa xóa
            if (imageInputRef.current) imageInputRef.current.value = "";
        };

        // ================= SUBMIT =================
        const handleSubmit = async (e) => {
            e.preventDefault();
            setSaving(true);
            setErrors({}); // Reset lỗi trước khi submit

            try {
                // Chuẩn bị dữ liệu gửi đi
                const payload = {
                    name: form.name,
                    status: form.status === "active" ? 1 : 0,
                    description: form.description || "",
                    remove_image: form.remove_image
                };

                // 🔥 QUAN TRỌNG: Chỉ gửi field image nếu người dùng có chọn file mới
                if (form.imageFile) {
                    payload.image = form.imageFile;
                }

                // Gọi service (Service sẽ tự convert sang FormData)
                await CategoryService.update(id, payload);

                alert("✅ Cập nhật danh mục thành công!");
                router.push("/dashboard/admin/categories");
            } catch (err) {
                console.error("Submit Error:", err.response?.data || err);
                
                // Nếu backend trả về lỗi validate (422)
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors || {});
                    alert("❌ Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường.");
                } else {
                    alert("❌ Lỗi khi cập nhật danh mục: " + (err.response?.data?.message || "Lỗi hệ thống"));
                }
            } finally {
                setSaving(false);
            }
        };

        // ================= LOADING UI =================
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center gap-3 text-indigo-600 font-black text-xl">
                        <Loader2 className="animate-spin" size={28} />
                        Đang tải dữ liệu...
                    </div>
                </div>
            );
        }

        // ================= MAIN UI =================
        return (
            <div className="min-h-screen bg-slate-100 p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FolderCog size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Cập nhật danh mục</h1>
                            <p className="text-indigo-100 text-sm font-semibold">
                                Quản lý thông tin hiển thị và hình ảnh danh mục
                            </p>
                        </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* NAME */}
                        <div>
                            <label className="block mb-1 font-black text-slate-700">Tên danh mục</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${
                                    errors.name ? "border-red-500 shadow-sm" : "border-slate-100 focus:border-indigo-400"
                                }`}
                                placeholder="Nhập tên danh mục..."
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name[0]}</p>}
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="block mb-1 font-black text-slate-700">Mô tả</label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 transition-all outline-none"
                                placeholder="Mô tả ngắn về danh mục..."
                            />
                        </div>

                        {/* IMAGE UPLOAD SECTION */}
                        <div>
                            <label className="block mb-2 font-black text-slate-700">Hình ảnh danh mục</label>

                            {form.imagePreview ? (
                                <div className="relative inline-block group">
                                    <img
                                        src={form.imagePreview}
                                        alt="Category Preview"
                                        className="w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-xl group-hover:opacity-90 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                        title="Xóa ảnh"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="mt-2 text-center">
                                        <button 
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className="text-xs font-bold text-indigo-600 hover:underline"
                                        >
                                            Thay đổi ảnh khác
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-slate-400"
                                >
                                    <ImagePlus size={40} strokeWidth={1.5} />
                                    <span className="mt-2 font-bold text-sm text-slate-500">
                                        Tải ảnh lên
                                    </span>
                                </div>
                            )}

                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            {errors.image && <p className="text-red-500 text-xs mt-1 font-bold">{errors.image[0]}</p>}
                        </div>

                        {/* STATUS */}
                        <div>
                            <label className="block mb-1 font-black text-slate-700">Trạng thái hiển thị</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none transition-all appearance-none bg-white"
                            >
                                <option value="active">🟢 Đang hoạt động (Hiển thị)</option>
                                <option value="inactive">🔴 Ngừng hoạt động (Ẩn)</option>
                            </select>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard/admin/categories")}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <X size={18} /> Hủy
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white bg-indigo-600 font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60 transition-all"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} /> Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }