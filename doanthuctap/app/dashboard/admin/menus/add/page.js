"use client";

import React, { useState } from "react";
import {
    PlusCircle,
    Link as LinkIcon,
    Layers,
    FileText,
    Globe,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Menu as MenuIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import MenuService from "@/services/MenuService";

// ================= COMPONENT THÔNG BÁO =================
const SystemMessage = ({ message, clearMessage }) => {
    if (!message) return null;

    let color = "bg-green-100 text-green-800 border-green-300";
    let Icon = CheckCircle;

    if (message.type === "error") {
        color = "bg-red-100 text-red-800 border-red-300";
        Icon = XCircle;
    } else if (message.type === "info") {
        color = "bg-blue-100 text-blue-800 border-blue-300";
        Icon = AlertTriangle;
    }

    return (
        <div className={`flex justify-between items-start p-4 mb-4 border rounded-lg ${color}`}>
            <div className="flex gap-3">
                <Icon size={20} />
                <span>{message.text}</span>
            </div>
            <button onClick={clearMessage}>
                <XCircle size={16} />
            </button>
        </div>
    );
};

// ================= COMPONENT CHÍNH =================
export default function AddMenu() {
    const router = useRouter();

    const [systemMessage, setSystemMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // ===== FORM STATE =====
    const [name, setName] = useState("");
    const [type, setType] = useState("custom");
    const [link, setLink] = useState("");
    const [position, setPosition] = useState("mainmenu");
    const [parentId, setParentId] = useState(0);
    const [status, setStatus] = useState("active");

    const clearSystemMessage = () => setSystemMessage(null);

    // ===== SUBMIT =====
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !link) {
            setSystemMessage({
                type: "error",
                text: "Vui lòng nhập đầy đủ Tên menu và Link."
            });
            return;
        }

        const payload = {
            name: name,
            type: type,
            link: link,
            parent_id: parentId,
            sort_order: 1,
            table_id: null,
            position: position,
            status: status === "active" ? 1 : 0,
        };

        try {
            setLoading(true);

            const res = await MenuService.create(payload);

            setSystemMessage({
                type: "success",
                text: res.data?.message || "Thêm menu thành công!",
            });

            setTimeout(() => {
                router.push("/dashboard/admin/menus");
            }, 1200);

        } catch (error) {
            console.error(error);
            setSystemMessage({
                type: "error",
                text: error.response?.data?.message || "Thêm menu thất bại!",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <header className="mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MenuIcon className="text-purple-600" />
                    Thêm Menu Mới
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Tạo menu điều hướng cho website
                </p>
            </header>

            <SystemMessage message={systemMessage} clearMessage={clearSystemMessage} />

            {/* FORM */}
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* NAME */}
                    <div>
                        <label className="block mb-2 font-semibold">Tên menu *</label>
                        <div className="relative">
                            <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg"
                                placeholder="Ví dụ: Trang chủ"
                                required
                            />
                        </div>
                    </div>

                    {/* TYPE */}
                    <div>
                        <label className="block mb-2 font-semibold">Loại menu *</label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white"
                            >
                                <option value="custom">Custom Link</option>
                                <option value="category">Category</option>
                                <option value="page">Page</option>
                                <option value="topic">Topic</option>
                            </select>
                        </div>
                    </div>

                    {/* LINK */}
                    <div>
                        <label className="block mb-2 font-semibold">Link *</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg"
                                placeholder="/ hoặc /contact"
                                required
                            />
                        </div>
                    </div>

                    {/* POSITION */}
                    <div>
                        <label className="block mb-2 font-semibold">Vị trí menu *</label>
                        <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg bg-white"
                        >
                            <option value="mainmenu">Main Menu</option>
                            <option value="footermenu">Footer Menu</option>
                        </select>
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="block mb-2 font-semibold">Trạng thái *</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg bg-white"
                        >
                            <option value="active">Kích hoạt</option>
                            <option value="inactive">Không kích hoạt</option>
                        </select>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/menu")}
                            className="px-6 py-3 bg-gray-200 rounded-lg font-semibold"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-lg font-semibold text-white
                                ${loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
                        >
                            {loading ? "Đang lưu..." : "Thêm menu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
