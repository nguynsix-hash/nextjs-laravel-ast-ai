"use client";
import React, { useEffect, useState } from "react";
import { Save, X, RefreshCw, Lock } from "lucide-react"; // Thêm icon Lock cho trực quan
import { useRouter, useParams } from "next/navigation";
import ProductStoreService from "@/services/ProductStoreService";

export default function WarehouseImportEdit() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        product_id: "",
        price_root: "",
        qty: "",
        status: 1,
    });

    /* ===== LOAD CHI TIẾT ===== */
    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            try {
                const res = await ProductStoreService.getById(id);
                // Đảm bảo lấy đúng cấu trúc data từ API của bạn
                const data = res.data?.data || res.data;

                setForm({
                    product_id: data.product_id,
                    price_root: data.price_root,
                    qty: data.qty,
                    status: data.status,
                });
            } catch (error) {
                alert("Không tìm thấy phiếu nhập kho");
                router.push("/dashboard/admin/inventory");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, router]);

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

        if (form.qty <= 0) {
            alert("Số lượng phải lớn hơn 0");
            return;
        }

        try {
            await ProductStoreService.update(id, {
                product_id: Number(form.product_id),
                price_root: Number(form.price_root),
                qty: Number(form.qty),
                status: Number(form.status),
            });

            alert("Cập nhật phiếu nhập kho thành công");
            router.push("/dashboard/admin/inventory");
        } catch (error) {
            alert("Cập nhật thất bại");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="animate-spin text-green-600 mr-2" /> 
                Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">

                <h1 className="text-2xl font-black text-green-700 mb-6 flex items-center gap-2">
                    <RefreshCw size={28} /> CẬP NHẬT PHIẾU NHẬP KHO
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* PRODUCT ID - CHỈ ĐƯỢC XEM */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-1">
                            ID sản phẩm <Lock size={12} className="text-gray-400" />
                        </label>
                        <input
                            type="number"
                            name="product_id"
                            value={form.product_id}
                            readOnly // Ngăn người dùng nhập liệu
                            className="w-full border-2 bg-gray-100 border-gray-200 px-4 py-3 rounded-xl cursor-not-allowed text-gray-500 font-medium outline-none"
                            title="Không thể thay đổi ID sản phẩm"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic">* ID sản phẩm là cố định không thể chỉnh sửa</p>
                    </div>

                    {/* PRICE ROOT */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Giá nhập</label>
                        <input
                            type="number"
                            name="price_root"
                            min={0}
                            value={form.price_root}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-green-500 focus:ring-0 transition-all outline-none"
                            required
                        />
                    </div>

                    {/* QTY */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Số lượng nhập</label>
                        <input
                            type="number"
                            name="qty"
                            min={1}
                            value={form.qty}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-green-500 focus:ring-0 transition-all outline-none"
                            required
                        />
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Trạng thái</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-green-500 transition-all outline-none"
                        >
                            <option value={1}>🟢 Hoạt động</option>
                            <option value={0}>🔴 Tạm ngưng</option>
                        </select>
                    </div>

                    {/* ACTION */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/inventory")}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            <X size={18} /> Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                        >
                            <Save size={18} /> Lưu thay đổi
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}