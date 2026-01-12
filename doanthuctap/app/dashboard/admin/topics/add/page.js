"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Tag,
    FilePlus2,
    BookOpenText,
    Save,
    X,
    ListOrdered,
    ToggleLeft
} from "lucide-react";
import TopicService from "@/services/TopicService";

export default function AddTopic() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(1);       // 👈 mới
    const [sortOrder, setSortOrder] = useState(0); // 👈 mới
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("❌ Tên Topic không được để trống");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: name,
                description: description,
                status: Number(status),              // 0 | 1
                sort_order: Number(sortOrder) || 0
            };

            const res = await TopicService.create(payload);

            if (res.success) {
                alert("✅ Thêm Topic thành công");
                router.push("/dashboard/admin/topics");
            } else {
                alert("❌ Thêm Topic thất bại");
            }
        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                alert(Object.values(errors).flat().join("\n"));
            } else {
                alert("❌ Lỗi hệ thống");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <header className="mb-6 pb-4 border-b border-gray-300">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <FilePlus2 size={30} className="text-indigo-600" />
                        Thêm Chủ đề (Topic) Mới
                    </h1>
                </header>

                {/* Form */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Tên Topic */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
                                <Tag size={16} /> Tên Topic
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                required
                            />
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
                                <BookOpenText size={16} /> Mô tả
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
                                <ListOrdered size={16} /> Thứ tự hiển thị
                            </label>
                            <input
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                min={0}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
                                <ToggleLeft size={16} /> Trạng thái
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                                <option value={1}>Hiển thị</option>
                                <option value={0}>Ẩn</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold flex-1
                                ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                }`}
                            >
                                <Save size={18} />
                                {loading ? "Đang lưu..." : "Thêm Topic"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/dashboard/admin/topics")}
                                className="flex items-center justify-center gap-2 bg-gray-300 px-6 py-2 rounded-lg font-semibold flex-1"
                            >
                                <X size={18} /> Hủy
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
