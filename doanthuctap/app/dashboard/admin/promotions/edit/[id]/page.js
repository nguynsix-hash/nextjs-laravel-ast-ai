"use client";
import React, { useEffect, useState } from "react";
import { Save, X, RefreshCw, Calendar, Tag } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import ProductSaleService from "@/services/ProductSaleService";

export default function PromotionEdit() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [productName, setProductName] = useState("");

    const [form, setForm] = useState({
        name: "",
        price_sale: "",
        date_begin: "",
        date_end: "",
        status: 1,
    });

    /* ===== LOAD CHI TIẾT ===== */
    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            try {
                const res = await ProductSaleService.getById(id);
                const data = res.data;

                setProductName(data.product?.name || "Không rõ");

                setForm({
                    name: data.name,
                    price_sale: data.price_sale,
                    date_begin: data.date_begin?.slice(0, 10),
                    date_end: data.date_end?.slice(0, 10),
                    status: data.status,
                });
            } catch (error) {
                alert("Không tìm thấy chương trình khuyến mãi");
                router.push("/dashboard/admin/promotions");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    /* ===== HANDLE CHANGE ===== */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /* ===== SUBMIT ===== */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new Date(form.date_begin) > new Date(form.date_end)) {
            alert("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
            return;
        }

        try {
            await ProductSaleService.update(id, {
                name: form.name,
                price_sale: Number(form.price_sale),
                date_begin: form.date_begin,
                date_end: form.date_end,
                status: Number(form.status),
            });

            alert("Cập nhật khuyến mãi thành công");
            router.push("/dashboard/admin/promotions");
        } catch (error) {
            alert("Cập nhật thất bại");
        }
    };

    if (loading) {
        return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-xl">

                <h1 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <RefreshCw /> CẬP NHẬT KHUYẾN MÃI
                </h1>

                <p className="text-sm text-gray-500 mb-4">
                    ID Sale: <b>{id}</b>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* PRODUCT NAME (READONLY) */}
                    <div>
                        <label className="text-sm font-semibold">Sản phẩm áp dụng</label>
                        <input
                            type="text"
                            value={productName}
                            disabled
                            className="w-full border px-4 py-2 rounded bg-gray-100"
                        />
                    </div>

                    {/* NAME */}
                    <div>
                        <label className="text-sm font-semibold">Tên chương trình</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded"
                            required
                        />
                    </div>

                    {/* PRICE SALE */}
                    <div>
                        <label className="text-sm font-semibold">Giá khuyến mãi</label>
                        <input
                            type="number"
                            name="price_sale"
                            min={0}
                            value={form.price_sale}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded"
                            required
                        />
                    </div>

                    {/* DATE */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">Ngày bắt đầu</label>
                            <input
                                type="date"
                                name="date_begin"
                                value={form.date_begin}
                                onChange={handleChange}
                                className="w-full border px-4 py-2 rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold">Ngày kết thúc</label>
                            <input
                                type="date"
                                name="date_end"
                                value={form.date_end}
                                onChange={handleChange}
                                className="w-full border px-4 py-2 rounded"
                                required
                            />
                        </div>
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="text-sm font-semibold">Trạng thái</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded"
                        >
                            <option value={1}>Đang hoạt động</option>
                            <option value={0}>Ngừng hoạt động</option>
                        </select>
                    </div>

                    {/* ACTION */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/promotions")}
                            className="px-5 py-2 bg-gray-400 text-white rounded"
                        >
                            <X size={16} /> Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-purple-600 text-white rounded"
                        >
                            <Save size={16} /> Lưu
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
