"use client";
import React, { useState, useEffect } from "react";
import { Box } from "lucide-react";
import { useRouter } from "next/navigation";

import ProductStoreService from "@/services/ProductStoreService";
import ProductService from "@/services/ProductService";

export default function WarehouseImportAdd() {
    const router = useRouter();

    const [products, setProducts] = useState([]);

    const [newImport, setNewImport] = useState({
        product_id: "",
        qty: 1,
        price_root: "",
        status: 1,
    });

    // =============================
    // 🔥 LOAD DANH SÁCH SẢN PHẨM
    // =============================
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await ProductService.getAll();
                console.log("📌 API /products trả về:", res.data);

                let list = [];

                // Dạng 1: []
                if (Array.isArray(res.data)) {
                    list = res.data;
                }

                // Dạng 2: { data: [] }
                else if (Array.isArray(res.data.data)) {
                    list = res.data.data;
                }

                // Dạng 3: { products: [] }
                else if (Array.isArray(res.data.products)) {
                    list = res.data.products;
                }

                setProducts(list);
            } catch (error) {
                console.error("❌ Lỗi tải sản phẩm:", error);
                setProducts([]);
            }
        };

        fetchProducts();
    }, []);

    // =============================
    // 🔥 HANDLE SUBMIT
    // =============================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newImport.product_id || newImport.qty <= 0 || !newImport.price_root) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        const payload = {
            product_id: parseInt(newImport.product_id),
            qty: parseInt(newImport.qty),
            price_root: parseInt(newImport.price_root),
            status: parseInt(newImport.status),
        };

        try {
            await ProductStoreService.create(payload);
            alert("Tạo phiếu nhập kho thành công!");
            router.push("/dashboard/admin/inventory");
        } catch (error) {
            console.error("❌ Error:", error);
            alert("Lỗi tạo phiếu nhập!");
        }
    };

    // =============================
    // 🔥 HANDLE INPUT CHANGE
    // =============================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewImport((prev) => ({ ...prev, [name]: value }));
    };

    // =============================
    // 🔥 UI RENDER
    // =============================
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-blue-100">
                <h1 className="text-3xl font-extrabold text-blue-700 mb-6 border-b pb-3 flex items-center gap-3">
                    <Box size={28} /> TẠO PHIẾU NHẬP KHO MỚI
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Select Product */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Chọn sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="product_id"
                            className="border px-4 py-2 rounded-lg bg-white"
                            value={newImport.product_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Chọn sản phẩm --</option>

                            {Array.isArray(products) &&
                                products.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Price Root */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Giá nhập <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price_root"
                            className="border px-4 py-2 rounded-lg"
                            placeholder="Nhập giá gốc"
                            value={newImport.price_root}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Số lượng nhập <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="qty"
                            min={1}
                            className="border px-4 py-2 rounded-lg"
                            value={newImport.qty}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Status */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Trạng thái</label>
                        <select
                            name="status"
                            className="border px-4 py-2 rounded-lg"
                            value={newImport.status}
                            onChange={handleInputChange}
                        >
                            <option value={1}>Hoạt động</option>
                            <option value={0}>Tạm dừng</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-end mt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/inventory")}
                            className="bg-gray-500 text-white px-5 py-2 rounded-lg"
                        >
                            HỦY
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold"
                        >
                            THÊM PHIẾU NHẬP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
