"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Save, Package, Calendar, Clock, Percent, DollarSign, Trash2, Zap, Upload, FileDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Giả định các service này đã được import và hoạt động
import ProductSaleService from "@/services/ProductSaleService";
import ProductService from "@/services/ProductService";

// Hàm tiện ích: định dạng tiền tệ Việt Nam (VNĐ)
const formatCurrency = (number) => {
    // Đảm bảo là số, nếu không phải thì trả về 0
    const num = Number(number) || 0;

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(num).replace('₫', 'đ'); // Thay ký hiệu ₫ thành đ
};

// Cấu trúc state cho toàn bộ chương trình khuyến mãi
const initialPromoState = {
    // Phần Thời gian áp dụng
    date_begin: "",
    date_end: "",

    // Phần Sản phẩm khuyến mãi
    sale_type_global: "percent", // 'percent' hoặc 'price' - Lựa chọn thiết lập nhanh
    sale_value_global: 0,

    products_on_sale: [], // Danh sách các sản phẩm đã chọn
    status: "1", // Trạng thái
    name: "", // Tên chương trình (Đã thêm vào form)
};

// Cấu trúc sản phẩm ban đầu để thêm vào form
const createSaleProduct = (product) => ({
    product_id: product.id, // Sử dụng product_id để khớp với API payload
    name: product.name,
    sku: product.sku,
    original_price: product.price, // Đây là giá gốc (price_buy)
    sale_price: product.price, // Mặc định là giá gốc
    sale_type: 'percent', // Có thể thay đổi từng sản phẩm
    sale_value: 0,
});


export default function PromotionManagementForm() {
    const router = useRouter();

    const [allProducts, setAllProducts] = useState([]); // Danh sách tất cả sản phẩm từ API
    const [promoData, setPromoData] = useState(initialPromoState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(""); // Dùng cho dropdown chọn sản phẩm
    const [errorMessage, setErrorMessage] = useState(null); // Để hiển thị lỗi API/Form

    // Lấy danh sách sản phẩm
    useEffect(() => {
        ProductService.getAll()
            .then((res) => {
                // SỬA: Giả định API trả về list sản phẩm có cấu trúc {id, name, price_buy, sku}
                const formattedProducts = (res.data.data || []).map(p => ({
                    id: p.id,
                    name: p.name + (p.size ? ` - ${p.size}` : ''), // Giả sử API có trường size
                    sku: p.sku || `SKU-${p.id}`,
                    price: Number(p.price_buy) || 0, // <<< ĐÃ SỬA: LẤY GIÁ GỐC TỪ 'price_buy'
                }));
                setAllProducts(formattedProducts);
            })
            .catch((err) => {
                console.error("Lỗi lấy sản phẩm:", err);
                setErrorMessage("Không thể tải danh sách sản phẩm từ server.");
            });
    }, []);

    // ----------------------------------------------------
    // LOGIC TÍNH TOÁN
    // ----------------------------------------------------

    // Tính toán lại giá khuyến mãi cho một sản phẩm (Sử dụng useCallback để tối ưu)
    const calculateSalePrice = useCallback((originalPrice, type, value) => {
        const val = Number(value) || 0;
        const original = Number(originalPrice) || 0;

        if (type === 'percent') {
            // Giá trị giảm (tối đa 100%)
            const percentValue = Math.min(100, Math.max(0, val));
            const salePrice = original - (original * percentValue / 100);
            return Math.max(0, Math.round(salePrice)); // Giá không thể âm, làm tròn
        }
        if (type === 'price') {
            // Giá bán cố định
            return Math.max(0, Math.round(val));
        }
        return original;
    }, []);

    // Tính tổng doanh thu dự kiến giảm (Original Price Sum - Sale Price Sum)
    const totalDiscount = useMemo(() => {
        return promoData.products_on_sale.reduce((sum, item) => {
            const discount = item.original_price - item.sale_price;
            return sum + Math.max(0, discount); // Chỉ tính giảm giá, không tính tăng giá
        }, 0);
    }, [promoData.products_on_sale]);


    // ----------------------------------------------------
    // HANDLERS CHUNG
    // ----------------------------------------------------

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Xóa lỗi khi người dùng bắt đầu nhập
        if (errorMessage) setErrorMessage(null);

        setPromoData(prev => ({
            ...prev,
            [name]: value,
            // Đảm bảo sale_value_global là số
            ...(name.includes('sale_value_global') && { [name]: Number(value) || 0 })
        }));
    };

    // ----------------------------------------------------
    // HANDLERS SẢN PHẨM KHUYẾN MÃI
    // ----------------------------------------------------

    // Thêm sản phẩm vào danh sách khuyến mãi
    const handleAddProduct = () => {
        if (!selectedProductId) return;

        const productToAdd = allProducts.find(p => p.id === Number(selectedProductId));
        // Đảm bảo không thêm sản phẩm đã có (Dùng product_id)
        if (productToAdd && !promoData.products_on_sale.some(p => p.product_id === productToAdd.id)) {

            const newSaleProduct = createSaleProduct(productToAdd);

            // Áp dụng thiết lập nhanh toàn cục
            const updatedProduct = {
                ...newSaleProduct,
                sale_type: promoData.sale_type_global,
                sale_value: promoData.sale_value_global,
            };

            // Tính toán giá bán cuối cùng
            updatedProduct.sale_price = calculateSalePrice(
                updatedProduct.original_price,
                updatedProduct.sale_type,
                updatedProduct.sale_value
            );

            setPromoData(prev => ({
                ...prev,
                products_on_sale: [...prev.products_on_sale, updatedProduct]
            }));
            setSelectedProductId(""); // Reset dropdown
        }
    };

    // Xóa sản phẩm khỏi danh sách khuyến mãi
    const handleRemoveProduct = (productId) => {
        setPromoData(prev => ({
            ...prev,
            // Lọc theo product_id
            products_on_sale: prev.products_on_sale.filter(p => p.product_id !== productId)
        }));
    };

    // Cập nhật giá trị khuyến mãi cho từng sản phẩm
    const handleProductSaleChange = (productId, field, value) => {
        setPromoData(prev => {
            const updatedProducts = prev.products_on_sale.map(item => {
                // Sửa logic: So sánh bằng product_id
                if (item.product_id === productId) {

                    let updatedItem = { ...item, [field]: value };

                    // Xử lý giá trị nhập vào phải là số
                    if (field === 'sale_value') {
                        updatedItem[field] = Number(value) || 0;
                    }

                    // Tính toán lại giá bán sau khi thay đổi type/value
                    updatedItem.sale_price = calculateSalePrice(
                        updatedItem.original_price,
                        updatedItem.sale_type,
                        updatedItem.sale_value
                    );

                    return updatedItem;
                }
                return item;
            });
            return { ...prev, products_on_sale: updatedProducts };
        });
    };

    // Áp dụng thiết lập nhanh (Giảm theo % hoặc Giá cố định) cho TẤT CẢ sản phẩm đã chọn
    const handleApplyAll = () => {
        setPromoData(prev => {
            // Lấy các giá trị global đã được cập nhật
            const globalType = prev.sale_type_global;
            const globalValue = Number(prev.sale_value_global) || 0;

            const updatedProducts = prev.products_on_sale.map(item => {
                const updatedItem = {
                    ...item,
                    sale_type: globalType,
                    sale_value: globalValue,
                };

                // FIX: Dùng calculateSalePrice với các giá trị global đã lấy
                updatedItem.sale_price = calculateSalePrice(
                    updatedItem.original_price,
                    globalType, // <-- Đã sửa
                    globalValue // <-- Đã sửa
                );

                return updatedItem;
            });
            return { ...prev, products_on_sale: updatedProducts };
        });
    };

    // ----------------------------------------------------
    // IMPORT EXCEL
    // ----------------------------------------------------
    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Gọi API import
            const res = await ProductSaleService.import(formData);
            const importedData = res.data; // httpAxios trả về body, nên res.data là mảng data trong body JSON

            if (!Array.isArray(importedData)) {
                console.error("Data received:", importedData);
                alert("Dữ liệu file không hợp lệ! (Xem console)");
                return;
            }

            const newProducts = [];
            let duplicateCount = 0;
            let notFoundCount = 0;

            importedData.forEach(item => {
                const pId = Number(item.product_id);
                // 1. Tìm sản phẩm trong danh sách master
                const masterProduct = allProducts.find(p => p.id === pId);

                if (!masterProduct) {
                    notFoundCount++;
                    return;
                }

                // 2. Kiểm tra trùng lặp trong danh sách ĐANG chọn
                // (Optional: Nếu muốn ghi đè thì bỏ check này)
                if (promoData.products_on_sale.some(p => p.product_id === pId) ||
                    newProducts.some(p => p.product_id === pId)) {
                    duplicateCount++;
                    return;
                }

                // 3. Tạo object sale product
                const saleProd = createSaleProduct(masterProduct);

                // 4. Override giá trị từ Excel
                saleProd.sale_type = item.sale_type === 'price' ? 'price' : 'percent';
                saleProd.sale_value = Number(item.sale_value) || 0;

                // 5. Tính lại giá sale
                saleProd.sale_price = calculateSalePrice(
                    saleProd.original_price,
                    saleProd.sale_type,
                    saleProd.sale_value
                );

                newProducts.push(saleProd);
            });

            // Cập nhật state
            if (newProducts.length > 0) {
                setPromoData(prev => ({
                    ...prev,
                    products_on_sale: [...prev.products_on_sale, ...newProducts]
                }));
                alert(`Đã import thành công ${newProducts.length} sản phẩm!\n(${duplicateCount} trùng lặp, ${notFoundCount} không tìm thấy ID)`);
            } else {
                alert(`Không thêm được sản phẩm nào.\n(${duplicateCount} trùng lặp, ${notFoundCount} không tồn tại)`);
            }

        } catch (error) {
            console.error("Import error:", error);
            alert("Lỗi khi import file: " + (error.response?.data?.message || "Lỗi server"));
        } finally {
            // Reset input file
            e.target.value = null;
        }
    };

    // ----------------------------------------------------
    // SUBMIT FORM
    // ----------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        // 1. Kiểm tra ngày hợp lệ
        const dateBegin = new Date(promoData.date_begin);
        const dateEnd = new Date(promoData.date_end);

        if (dateBegin > dateEnd) {
            setErrorMessage("Ngày kết thúc phải sau ngày bắt đầu.");
            setIsSubmitting(false);
            return;
        }

        if (promoData.products_on_sale.length === 0) {
            setErrorMessage("Vui lòng chọn ít nhất một sản phẩm để áp dụng khuyến mãi.");
            setIsSubmitting(false);
            return;
        }

        // 2. Tạo payload cho API
        const payload = {
            name: promoData.name,
            date_begin: promoData.date_begin,
            date_end: promoData.date_end,
            status: Number(promoData.status),

            // Tạo list các sản phẩm cần thêm khuyến mãi
            product_sales: promoData.products_on_sale.map(p => ({
                product_id: p.product_id, // Sử dụng product_id để khớp với DB
                original_price: p.original_price, // Giá gốc (giá mua/price_buy)
                price_sale: p.sale_price, // Giá khuyến mãi
                sale_type: p.sale_type,
                sale_value: p.sale_value,
            })),
            total_discount_amount: totalDiscount,
        };

        // 3. Gọi API
        try {
            await ProductSaleService.create(payload);

            alert("Thêm chương trình khuyến mãi thành công!");
            router.push("/dashboard/admin/promotions");
        } catch (err) {
            const apiMessage = err.response?.data?.message || err.response?.data?.exception || "Tạo khuyến mãi thất bại không rõ nguyên nhân!";
            console.error("API Error:", err.response?.data || err);
            setErrorMessage(`Lỗi API: ${apiMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    // Lọc ra các sản phẩm chưa được chọn để hiển thị trong dropdown
    const availableProducts = useMemo(() => {
        const selectedIds = new Set(promoData.products_on_sale.map(p => p.product_id));
        return allProducts.filter(p => !selectedIds.has(p.id));
    }, [allProducts, promoData.products_on_sale]);

    // ----------------------------------------------------
    // JSX RENDER
    // ----------------------------------------------------

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-pink-100">
                <h1 className="text-3xl font-extrabold text-pink-700 mb-8 border-b pb-3">
                    ✨ Quản Lý Chương Trình Khuyến Mãi
                </h1>

                {/* HIỂN THỊ LỖI */}
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Lỗi! </strong>
                        <span className="block sm:inline">{errorMessage}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setErrorMessage(null)}>
                            <X size={18} />
                        </span>
                    </div>
                )}


                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                    {/* KHỐI 1: THÔNG TIN CHUNG VÀ THỜI GIAN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-pink-50 p-6 rounded-xl shadow-inner border border-pink-200 h-fit">
                            <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
                                <Clock size={20} /> Thời gian áp dụng
                            </h2>

                            {/* Tên khuyến mãi */}
                            <div className="flex flex-col mb-4">
                                <label className="font-bold mb-2 text-gray-700">Tên chương trình</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={promoData.name}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-500"
                                    placeholder="Nhập tên chương trình"
                                    required
                                />
                            </div>

                            {/* Ngày bắt đầu */}
                            <div className="flex flex-col mb-4">
                                <label className="font-bold mb-2 text-gray-700">Thời gian bắt đầu</label>
                                <input
                                    type="date"
                                    name="date_begin"
                                    value={promoData.date_begin}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-500"
                                    required
                                />
                            </div>

                            {/* Ngày kết thúc */}
                            <div className="flex flex-col mb-4">
                                <label className="font-bold mb-2 text-gray-700">Thời gian kết thúc</label>
                                <input
                                    type="date"
                                    name="date_end"
                                    value={promoData.date_end}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-500"
                                    required
                                />
                            </div>

                            {/* Cảnh báo tự động kết thúc */}
                            <div className="mt-4 p-3 text-sm bg-yellow-100 text-yellow-800 rounded-lg flex items-start gap-2">
                                <Zap size={16} className="mt-0.5" />
                                <span>Khuyến mãi sẽ tự động kết thúc vào thời gian này. Sản phẩm sẽ trở về giá gốc.</span>
                            </div>
                        </div>

                        {/* KHỐI 2: SẢN PHẨM KHUYẾN MÃI */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2 border-b pb-2">
                                <Package size={20} /> Sản phẩm khuyến mãi
                            </h2>

                            {/* Thiết lập nhanh & Áp dụng tất cả */}
                            <div className="flex flex-wrap items-center gap-4 p-4 mb-4 bg-orange-50 rounded-lg border border-orange-200">
                                <span className="font-semibold text-gray-700 whitespace-nowrap">Thiết lập nhanh:</span>

                                {/* Chọn loại giảm giá */}
                                <select
                                    name="sale_type_global"
                                    value={promoData.sale_type_global}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 px-3 py-2 rounded-lg appearance-none bg-white"
                                >
                                    <option value="percent">Giảm theo %</option>
                                    <option value="price">Giá bán cố định</option>
                                </select>

                                {/* Nhập giá trị giảm */}
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <input
                                        type="number"
                                        name="sale_value_global"
                                        value={promoData.sale_value_global}
                                        onChange={handleInputChange}
                                        className="px-3 py-2 w-20 text-right focus:ring-0 focus:border-0"
                                        min={promoData.sale_type_global === 'percent' ? 0 : 0}
                                        max={promoData.sale_type_global === 'percent' ? 100 : undefined}
                                        required
                                    />
                                    <span className="bg-gray-200 px-3 py-2 font-medium text-gray-600">
                                        {/* Hiển thị đơn vị tương ứng */}
                                        {promoData.sale_type_global === 'percent' ? '%' : (
                                            formatCurrency(0).replace('0', '').trim()
                                        )}
                                    </span>
                                </div>

                                {/* Nút Áp dụng tất cả */}
                                <button
                                    type="button"
                                    onClick={handleApplyAll}
                                    disabled={promoData.products_on_sale.length === 0}
                                    className={`flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow-md transition duration-150 ${promoData.products_on_sale.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Zap size={18} /> Áp dụng tất cả
                                </button>
                            </div>

                            {/* Dropdown chọn sản phẩm để thêm */}
                            <div className="flex items-center gap-4 mb-4">
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="flex-grow border border-gray-300 px-4 py-2 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-pink-500"
                                    disabled={availableProducts.length === 0}
                                >
                                    <option value="" disabled>-- Chọn sản phẩm để thêm --</option>
                                    {availableProducts.length > 0 ? (
                                        availableProducts.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({formatCurrency(p.price)})
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Đã chọn tất cả sản phẩm hiện có</option>
                                    )}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddProduct}
                                    disabled={!selectedProductId}
                                    className={`flex-shrink-0 bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-lg shadow transition duration-150 ${!selectedProductId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    + Thêm sản phẩm
                                </button>
                            </div>

                            {/* Import File Section */}
                            <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-blue-800 mb-1 flex items-center gap-2">
                                        <Upload size={18} /> Import từ Excel
                                    </h3>
                                    <p className="text-sm text-blue-600">
                                        Nhập nhanh sản phẩm từ file CSV/Excel.
                                        <a href="/sample_promotions.csv" download className="font-bold underline ml-1 hover:text-blue-900 flex items-center inline-flex gap-1">
                                            <FileDown size={14} /> Tải file mẫu
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <input
                                        type="file"
                                        id="import-file"
                                        hidden
                                        accept=".csv, .xlsx, .xls"
                                        onChange={handleImportFile}
                                    />
                                    <label
                                        htmlFor="import-file"
                                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow transition"
                                    >
                                        <Upload size={18} /> Chọn File
                                    </label>
                                </div>
                            </div>

                            {/* Bảng danh sách sản phẩm khuyến mãi */}
                            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-1/3">SẢN PHẨM</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">GIÁ GỐC</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase w-1/4">KHUYẾN MÃI</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">GIÁ KM</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {promoData.products_on_sale.length > 0 ? (
                                            promoData.products_on_sale.map((p) => (
                                                // Sử dụng product_id làm key
                                                <tr key={p.product_id} className="hover:bg-pink-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                                                        <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-500">
                                                        {formatCurrency(p.original_price)}
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-center">
                                                        {/* Input giá trị giảm */}
                                                        <div className="flex items-center justify-center gap-1">

                                                            {/* Dropdown loại giảm giá cho từng SP */}
                                                            <select
                                                                value={p.sale_type}
                                                                onChange={(e) => handleProductSaleChange(p.product_id, 'sale_type', e.target.value)}
                                                                className="border border-gray-300 px-1 py-1 text-sm rounded appearance-none bg-white w-20"
                                                            >
                                                                <option value="percent">%</option>
                                                                <option value="price">Đ</option>
                                                            </select>

                                                            <input
                                                                type="number"
                                                                value={p.sale_value}
                                                                onChange={(e) => handleProductSaleChange(p.product_id, 'sale_value', e.target.value)}
                                                                className="border border-gray-300 px-2 py-1 text-sm rounded w-16 text-right"
                                                                min={p.sale_type === 'percent' ? 0 : 0}
                                                                max={p.sale_type === 'percent' ? 100 : undefined}
                                                                required
                                                            />
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {p.sale_type === 'percent' ? '%' : ''}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-base font-bold">
                                                        <span className="text-pink-600">{formatCurrency(p.sale_price)}</span>
                                                        {p.sale_price < p.original_price && (
                                                            <div className="text-xs text-red-500 font-medium">
                                                                Giảm {formatCurrency(p.original_price - p.sale_price)}
                                                            </div>
                                                        )}
                                                        {p.sale_price > p.original_price && p.sale_type === 'price' && (
                                                            <div className="text-xs text-green-600 font-medium">
                                                                Tăng giá
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProduct(p.product_id)}
                                                            className="text-red-500 hover:text-red-700 transition"
                                                            title="Xóa sản phẩm khỏi khuyến mãi"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                                    Vui lòng chọn sản phẩm để áp dụng khuyến mãi.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tổng kết */}
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-inner flex justify-between items-center border-t border-gray-300">
                                <span className="font-semibold text-gray-700">Đã chọn {promoData.products_on_sale.length} sản phẩm</span>
                                <div className="text-lg font-bold text-pink-600">
                                    <span className="text-gray-700">TỔNG DOANH THU DỰ KIẾN GIẢM: </span>
                                    {/* Hiển thị tổng giảm giá */}
                                    {formatCurrency(totalDiscount)}
                                </div>
                            </div>

                            {/* Trạng thái */}
                            <div className="flex flex-col mt-6">
                                <label className="font-bold mb-2 text-gray-700">Trạng thái chương trình</label>
                                <select
                                    name="status"
                                    value={promoData.status}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 px-4 py-3 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-pink-500 transition duration-150"
                                >
                                    <option value="1" className="font-medium">Hoạt động</option>
                                    <option value="0" className="font-medium">Ngừng hoạt động</option>
                                </select>
                            </div>

                        </div>
                    </div>


                    {/* Buttons */}
                    <div className="flex gap-4 justify-end pt-4 border-t mt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/admin/promotions")}
                            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            <X size={20} /> Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || promoData.products_on_sale.length === 0}
                            className={`flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 ${isSubmitting || promoData.products_on_sale.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={20} />
                            {isSubmitting ? 'Đang Lưu...' : 'Lưu Chương Trình'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}