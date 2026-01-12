"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Menu, Loader2 } from "lucide-react";
import MenuService from "@/services/MenuService";

export default function EditMenu() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        link: "",
        type: "custom",
        parent_id: 0,
        sort_order: 1,
        position: "mainmenu",
        status: 1,
    });

    /* ===== LOAD MENU ===== */
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchMenu = async () => {
            try {
                const res = await MenuService.getById(id);

                // httpAxios interceptor trả về response.data
                // nên res = { success: true, data: {...} }
                const menu = res.data || res;

                setForm({
                    name: menu.name || "",
                    link: menu.link || "",
                    type: menu.type || "custom",
                    parent_id: menu.parent_id ?? 0,
                    sort_order: menu.sort_order ?? 1,
                    position: menu.position || "mainmenu",
                    status: menu.status ?? 1,
                });
            } catch (err) {
                console.error(err);
                alert("Không tìm thấy menu!");
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [id]);

    /* ===== SUBMIT ===== */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            await MenuService.update(id, form);
            alert("Cập nhật menu thành công!");
            router.push("/dashboard/admin/menus");
        } catch (err) {
            console.error(err);
            alert("Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-2 mb-6">
                <Menu />
                <h1 className="text-xl font-bold">Chỉnh sửa Menu</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-3xl bg-white p-6 rounded-xl shadow space-y-4"
            >
                <input
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                    placeholder="Tên menu"
                    required
                />

                <input
                    value={form.link}
                    onChange={(e) =>
                        setForm({ ...form, link: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                    placeholder="Link"
                    required
                />

                <select
                    value={form.type}
                    onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                >
                    <option value="custom">Custom</option>
                    <option value="page">Page</option>
                    <option value="category">Category</option>
                </select>

                <select
                    value={form.position}
                    onChange={(e) =>
                        setForm({ ...form, position: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                >
                    <option value="mainmenu">Main Menu</option>
                    <option value="footermenu">Footer Menu</option>
                </select>

                <select
                    value={form.status}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            status: Number(e.target.value),
                        })
                    }
                    className="w-full border px-4 py-2 rounded"
                >
                    <option value={1}>Kích hoạt</option>
                    <option value={0}>Tắt</option>
                </select>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/dashboard/admin/menus")
                        }
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        <ArrowLeft size={16} /> Quay lại
                    </button>

                    <button
                        disabled={loading}
                        className="px-5 py-2 bg-purple-600 text-white rounded"
                    >
                        <Save size={16} />
                        {loading ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </form>
        </div>
    );
}
