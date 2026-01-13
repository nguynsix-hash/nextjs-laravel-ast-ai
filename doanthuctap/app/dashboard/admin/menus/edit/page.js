"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Menu, Loader2, Layers, Globe, ChevronDown } from "lucide-react";
import MenuService from "@/services/MenuService";
import CategoryService from "@/services/CategoryService";
import TopicService from "@/services/TopicService";
import PostService from "@/services/PostService";

export default function EditMenu() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingSource, setLoadingSource] = useState(false);

    const [form, setForm] = useState({
        name: "",
        link: "",
        type: "custom",
        parent_id: 0,
        sort_order: 1,
        position: "mainmenu",
        status: 1,
        table_id: null,
    });

    // ===== SOURCE DATA STATE =====
    const [sourceItems, setSourceItems] = useState([]);
    const [selectedSourceId, setSelectedSourceId] = useState("");

    /* ===== LOAD MENU ===== */
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchMenu = async () => {
            try {
                const res = await MenuService.getById(id);
                const menu = res.data || res;

                setForm({
                    name: menu.name || "",
                    link: menu.link || "",
                    type: menu.type || "custom",
                    parent_id: menu.parent_id ?? 0,
                    sort_order: menu.sort_order ?? 1,
                    position: menu.position || "mainmenu",
                    status: menu.status ?? 1,
                    table_id: menu.table_id || null,
                });

                setSelectedSourceId(menu.table_id || "");
            } catch (err) {
                console.error(err);
                alert("Không tìm thấy menu!");
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [id]);

    // ===== FETCH SOURCE DATA WHEN TYPE CHANGES =====
    useEffect(() => {
        const fetchSourceData = async () => {
            if (form.type === "custom") {
                setSourceItems([]);
                return;
            }

            setLoadingSource(true);
            try {
                let items = [];

                if (form.type === "category") {
                    const res = await CategoryService.getAll({ status: 1 });
                    items = res?.data?.data || res?.data || [];
                } else if (form.type === "topic") {
                    const res = await TopicService.getAll({ status: 1 });
                    items = res?.data?.data || res?.data || [];
                } else if (form.type === "page") {
                    const res = await PostService.index({ status: 1, post_type: 'page' });
                    items = res?.data?.data || res?.data || [];
                }

                setSourceItems(Array.isArray(items) ? items : []);
            } catch (error) {
                console.error("Fetch source error:", error);
            }
            setLoadingSource(false);
        };

        fetchSourceData();
    }, [form.type]);

    // ===== HANDLE SOURCE ITEM SELECTION =====
    const handleSourceSelect = (e) => {
        const itemId = e.target.value;
        setSelectedSourceId(itemId);

        if (!itemId) return;

        const item = sourceItems.find(i => String(i.id) === String(itemId));
        if (item) {
            let newLink = form.link;

            if (form.type === "category") {
                newLink = `/main/product?category=${item.id}`;
            } else if (form.type === "topic") {
                newLink = `/main/post?topic=${item.id}`;
            } else if (form.type === "page") {
                newLink = `/main/post/${item.id}`;
            }

            setForm({
                ...form,
                name: item.name || item.title || form.name,
                link: newLink,
                table_id: item.id,
            });
        }
    };

    /* ===== SUBMIT ===== */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            await MenuService.update(id, {
                ...form,
                table_id: selectedSourceId || null,
            });
            alert("Cập nhật menu thành công!");
            router.push("/dashboard/admin/menus");
        } catch (err) {
            console.error(err);
            alert("Cập nhật thất bại!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-purple-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-2 mb-6">
                <Menu className="text-purple-600" />
                <h1 className="text-2xl font-bold">Chỉnh sửa Menu</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-3xl bg-white p-8 rounded-xl shadow-lg space-y-6"
            >
                {/* TYPE */}
                <div>
                    <label className="block mb-2 font-semibold">Loại nguồn menu</label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                        <select
                            value={form.type}
                            onChange={(e) => {
                                setForm({ ...form, type: e.target.value });
                                setSelectedSourceId("");
                            }}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white appearance-none"
                        >
                            <option value="custom">✏️ Custom Link</option>
                            <option value="category">📁 Category</option>
                            <option value="topic">📂 Topic</option>
                            <option value="page">📄 Page</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {/* SOURCE SELECTOR */}
                {form.type !== "custom" && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <label className="block mb-2 font-semibold text-purple-700">
                            Chọn {form.type === "category" ? "Category" : form.type === "topic" ? "Topic" : "Page"}
                        </label>
                        {loadingSource ? (
                            <div className="flex items-center gap-2 text-purple-600">
                                <Loader2 className="animate-spin" size={18} />
                                Đang tải...
                            </div>
                        ) : sourceItems.length > 0 ? (
                            <select
                                value={selectedSourceId}
                                onChange={handleSourceSelect}
                                className="w-full px-4 py-3 border rounded-lg bg-white"
                            >
                                <option value="">-- Chọn mục --</option>
                                {sourceItems.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name || item.title} (ID: {item.id})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-500 italic">Không có dữ liệu.</p>
                        )}
                    </div>
                )}

                {/* NAME */}
                <div>
                    <label className="block mb-2 font-semibold">Tên menu *</label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border px-4 py-3 rounded-lg"
                        placeholder="Tên menu"
                        required
                    />
                </div>

                {/* LINK */}
                <div>
                    <label className="block mb-2 font-semibold">Link *</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                        <input
                            value={form.link}
                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg"
                            placeholder="/ hoặc /contact"
                            required
                        />
                    </div>
                </div>

                {/* POSITION */}
                <div>
                    <label className="block mb-2 font-semibold">Vị trí menu</label>
                    <select
                        value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                        className="w-full border px-4 py-3 rounded-lg bg-white"
                    >
                        <option value="mainmenu">Main Menu</option>
                        <option value="footermenu">Footer Menu</option>
                    </select>
                </div>

                {/* STATUS */}
                <div>
                    <label className="block mb-2 font-semibold">Trạng thái</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                        className="w-full border px-4 py-3 rounded-lg bg-white"
                    >
                        <option value={1}>✅ Kích hoạt</option>
                        <option value={0}>❌ Tắt</option>
                    </select>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/admin/menus")}
                        className="px-5 py-3 bg-gray-200 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-300"
                    >
                        <ArrowLeft size={18} /> Quay lại
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-5 py-3 rounded-lg font-semibold text-white flex items-center gap-2
                            ${saving ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
}
