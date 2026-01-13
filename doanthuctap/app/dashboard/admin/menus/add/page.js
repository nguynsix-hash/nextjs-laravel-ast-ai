"use client";

import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    Link as LinkIcon,
    Layers,
    Globe,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Menu as MenuIcon,
    ChevronDown,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import MenuService from "@/services/MenuService";
import CategoryService from "@/services/CategoryService";
import TopicService from "@/services/TopicService";
import PostService from "@/services/PostService";

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
    const [loadingSource, setLoadingSource] = useState(false);

    // ===== FORM STATE =====
    const [name, setName] = useState("");
    const [type, setType] = useState("custom");
    const [link, setLink] = useState("");
    const [position, setPosition] = useState("mainmenu");
    const [parentId, setParentId] = useState(0);
    const [status, setStatus] = useState("active");

    // ===== SOURCE DATA STATE =====
    const [sourceItems, setSourceItems] = useState([]);
    const [selectedSourceId, setSelectedSourceId] = useState("");

    const clearSystemMessage = () => setSystemMessage(null);

    // ===== FETCH SOURCE DATA WHEN TYPE CHANGES =====
    useEffect(() => {
        const fetchSourceData = async () => {
            // Reset source items and selection
            setSourceItems([]);
            setSelectedSourceId("");

            if (type === "custom") return;

            setLoadingSource(true);
            try {
                let items = [];

                if (type === "category") {
                    const res = await CategoryService.getAll({ status: 1 });
                    items = res?.data?.data || res?.data || [];
                } else if (type === "topic") {
                    const res = await TopicService.getAll({ status: 1 });
                    items = res?.data?.data || res?.data || [];
                } else if (type === "page") {
                    // Post with type = 'page'
                    const res = await PostService.index({ status: 1, post_type: 'page' });
                    items = res?.data?.data || res?.data || [];
                }

                setSourceItems(Array.isArray(items) ? items : []);
            } catch (error) {
                console.error("Fetch source error:", error);
                setSystemMessage({ type: "error", text: "Không thể tải danh sách nguồn dữ liệu." });
            }
            setLoadingSource(false);
        };

        fetchSourceData();
    }, [type]);

    // ===== AUTO-FILL NAME & LINK WHEN SOURCE ITEM SELECTED =====
    const handleSourceSelect = (e) => {
        const itemId = e.target.value;
        setSelectedSourceId(itemId);

        if (!itemId) {
            setName("");
            setLink("");
            return;
        }

        const item = sourceItems.find(i => String(i.id) === String(itemId));
        if (item) {
            // Set name
            setName(item.name || item.title || "");

            // Set link based on type
            if (type === "category") {
                setLink(`/main/product?category=${item.id}`);
            } else if (type === "topic") {
                setLink(`/main/post?topic=${item.id}`);
            } else if (type === "page") {
                setLink(`/main/post/${item.id}`);
            }
        }
    };

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
            table_id: selectedSourceId || null,
            position: position,
            status: status === "active" ? 1 : 0,
        };

        try {
            setLoading(true);

            const res = await MenuService.create(payload);

            setSystemMessage({
                type: "success",
                text: res?.message || "Thêm menu thành công!",
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
                    Tạo menu điều hướng cho website - Có thể thêm từ nguồn Category, Topic, hoặc Page
                </p>
            </header>

            <SystemMessage message={systemMessage} clearMessage={clearSystemMessage} />

            {/* FORM */}
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* TYPE */}
                    <div>
                        <label className="block mb-2 font-semibold">Loại nguồn menu *</label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white appearance-none"
                            >
                                <option value="custom">✏️ Custom Link (Nhập thủ công)</option>
                                <option value="category">📁 Thêm từ Category</option>
                                <option value="topic">📂 Thêm từ Topic</option>
                                <option value="page">📄 Thêm từ Post (type=page)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>

                    {/* SOURCE ITEM SELECTOR (only when type != custom) */}
                    {type !== "custom" && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <label className="block mb-2 font-semibold text-purple-700">
                                Chọn {type === "category" ? "Category" : type === "topic" ? "Topic" : "Page"} *
                            </label>
                            {loadingSource ? (
                                <div className="flex items-center gap-2 text-purple-600">
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang tải danh sách...
                                </div>
                            ) : sourceItems.length > 0 ? (
                                <select
                                    value={selectedSourceId}
                                    onChange={handleSourceSelect}
                                    className="w-full px-4 py-3 border rounded-lg bg-white"
                                    required
                                >
                                    <option value="">-- Chọn một mục --</option>
                                    {sourceItems.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name || item.title} (ID: {item.id})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-gray-500 italic">Không có dữ liệu. Vui lòng kiểm tra nguồn.</p>
                            )}
                        </div>
                    )}

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
                        {type !== "custom" && (
                            <p className="text-xs text-gray-400 mt-1">* Tên sẽ tự động điền khi chọn mục từ nguồn</p>
                        )}
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
                        {type !== "custom" && (
                            <p className="text-xs text-gray-400 mt-1">* Link sẽ tự động điền khi chọn mục từ nguồn</p>
                        )}
                    </div>

                    {/* POSITION */}
                    <div>
                        <label className="block mb-2 font-semibold">Vị trí menu *</label>
                        <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg bg-white"
                        >
                            <option value="mainmenu">Main Menu (Header)</option>
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
                            <option value="active">✅ Kích hoạt</option>
                            <option value="inactive">❌ Không kích hoạt</option>
                        </select>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/menus")}
                            className="px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2
                                ${loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? "Đang lưu..." : "Thêm menu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
