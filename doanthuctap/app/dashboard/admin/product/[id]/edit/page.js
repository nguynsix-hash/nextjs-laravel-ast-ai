"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductService from "@/services/ProductService";
import CategoryService from "@/services/CategoryService";
import AttributeService from "@/services/AttributeService";

const initialFormData = {
    name: '',
    slug: '',
    status: 1,
    category_id: '',
    price_buy: 0,
    stock: 0,
    description: '',
    content: '',
    thumbnail: null,
    thumbnail_url: null,
    images_urls: [],
    options: [],
};

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
};

export default function AdminProductEdit() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;

    const thumbnailInputRef = useRef(null);
    const [form, setForm] = useState(initialFormData);
    const [categories, setCategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    // State cho dropdown chọn thuộc tính
    const [selectedAttrToAdd, setSelectedAttrToAdd] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // --- Load product + master data ---
    const fetchProductAndMasterData = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!productId) {
            setLoading(false);
            return;
        }

        try {
            const [productRes, categoryRes, attributeRes] = await Promise.all([
                ProductService.getById(productId),
                CategoryService.getAll(),
                AttributeService.getAll()
            ]);

            setCategories(categoryRes.data.data || []);
            setAttributes(attributeRes.data || []);

            const fetchedProduct = productRes.data.data || productRes.data;

            const thumbnail_url = fetchedProduct.thumbnail ? ProductService.getImageUrl(fetchedProduct.thumbnail) : null;
            const images_urls = fetchedProduct.images?.map(img => ({
                id: img.id,
                url: ProductService.getImageUrl(img.image),
                file: null
            })) || [];

            const options = (fetchedProduct.attributes || []).reduce((acc, attr) => {
                const exist = acc.find(o => o.id === attr.attribute_id);
                if (exist) {
                    exist.values.push(attr.value);
                } else {
                    acc.push({
                        id: attr.attribute_id,
                        name: attr.attribute?.name || "Thuộc tính",
                        values: [attr.value]
                    });
                }
                return acc;
            }, []);

            setForm({
                ...initialFormData,
                ...fetchedProduct,
                slug: fetchedProduct.slug || '', // Load slug
                category_id: fetchedProduct.category_id || '',
                price_buy: Number(fetchedProduct.price_buy || 0),
                stock: Number(fetchedProduct.store?.qty || 0),
                status: Number(fetchedProduct.status || 1),
                content: fetchedProduct.content || '',
                thumbnail_url,
                images_urls,
                options,
            });

        } catch (err) {
            console.error(err);
            setError(`Không thể tải dữ liệu sản phẩm (ID: ${productId})`);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) fetchProductAndMasterData();
    }, [fetchProductAndMasterData]);

    // --- Change handlers ---
    const handleChange = (field, value) => {
        setForm(prev => {
            const newData = { ...prev, [field]: value };
            // Auto generate slug if name changes and slug is empty
            if (field === 'name' && (!prev.slug || prev.slug === generateSlug(prev.name))) {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm(prev => ({
            ...prev,
            thumbnail: file,
            thumbnail_url: URL.createObjectURL(file)
        }));
    };

    const handleRemoveThumbnail = () => setForm(prev => ({ ...prev, thumbnail: null, thumbnail_url: null }));

    // Xử lý thêm thuộc tính từ Dropdown
    const handleAddOption = () => {
        if (!selectedAttrToAdd) return alert("Vui lòng chọn thuộc tính để thêm!");

        const attrId = Number(selectedAttrToAdd);

        // Kiểm tra xem đã có chưa
        const exists = form.options.find(o => o.id === attrId);
        if (exists) return alert("Thuộc tính này đã được thêm rồi!");

        const attr = attributes.find(a => a.id === attrId);
        if (!attr) return;

        setForm(prev => ({
            ...prev,
            options: [...prev.options, { id: attr.id, name: attr.name, values: [""] }]
        }));
        setSelectedAttrToAdd(""); // Reset dropdown
    };

    const handleOptionValueChange = (optId, index, value) => {
        setForm(prev => ({
            ...prev,
            options: prev.options.map(opt =>
                opt.id === optId
                    ? { ...opt, values: opt.values.map((v, i) => i === index ? value : v) }
                    : opt
            )
        }));
    };

    const handleRemoveOptionValue = (optId, index) => {
        setForm(prev => ({
            ...prev,
            options: prev.options.map(opt =>
                opt.id === optId ? { ...opt, values: opt.values.filter((_, i) => i !== index) } : opt
            )
        }));
    };

    const handleRemoveOption = (optId) => setForm(prev => ({ ...prev, options: prev.options.filter(opt => opt.id !== optId) }));

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const newImages = files.map(f => ({ id: null, file: f, url: URL.createObjectURL(f) }));
        setForm(prev => ({
            ...prev,
            images_urls: [...prev.images_urls, ...newImages]
        }));
    };

    const handleRemoveImage = (index) => {
        const imageToRemove = form.images_urls[index];
        if (imageToRemove.id) {
            setDeletedImages(prev => [...prev, imageToRemove.id]);
        }

        setForm(prev => ({
            ...prev,
            images_urls: prev.images_urls.filter((_, i) => i !== index)
        }));
    };

    // --- Save product ---
    const handleSave = async () => {
        if (!form.name.trim()) return alert("Tên sản phẩm không được để trống!");
        setIsSaving(true);

        try {
            const data = new FormData();

            data.append("name", form.name);
            data.append("slug", form.slug || generateSlug(form.name));
            data.append("status", form.status);
            data.append("category_id", form.category_id);
            data.append("price_buy", form.price_buy);
            data.append("description", form.description || "");
            data.append("content", form.content || "");
            data.append("qty", form.stock);

            // Thumbnail
            if (form.thumbnail instanceof File) {
                data.append("thumbnail", form.thumbnail);
            }

            // Images
            form.images_urls.forEach((img, i) => {
                if (img.file) {
                    data.append(`images[${i}]`, img.file);
                }
            });

            // Deleted images
            deletedImages.forEach((id, i) => {
                data.append(`deleted_images[${i}]`, id);
            });

            // Attributes
            let attrIndex = 0;
            form.options.forEach(opt => {
                opt.values.forEach(val => {
                    if (val && val.trim() !== "") {
                        data.append(`attributes[${attrIndex}][attribute_id]`, opt.id);
                        data.append(`attributes[${attrIndex}][value]`, val);
                        attrIndex++;
                    }
                });
            });

            await ProductService.update(productId, data);

            alert(`✅ Cập nhật sản phẩm "${form.name}" thành công!`);
            router.push("/dashboard/admin/product");

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "❌ Lỗi khi lưu sản phẩm!");
        } finally {
            setIsSaving(false);
        }
    };


    if (loading) return <div className="p-8 text-center text-blue-700 font-extrabold text-xl bg-blue-100 rounded-lg">⏳ Đang tải dữ liệu...</div>;
    if (error) return <div className="p-8 text-center text-red-700 font-extrabold text-xl bg-red-100 rounded-lg">❌ {error}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <h1 className="text-4xl font-extrabold text-blue-800">📝 Chỉnh sửa sản phẩm: <span className="text-gray-900">{form.name}</span></h1>
                    <button onClick={() => router.push("/dashboard/admin/product")} className="px-6 py-2 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800">← Quay lại</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Images Column */}
                    <div className="space-y-4 lg:col-span-1">
                        <h2 className="text-3xl font-extrabold text-gray-800 border-b pb-2 mb-4">🖼️ Hình ảnh</h2>
                        {form.thumbnail_url ? (
                            <div className="relative">
                                <img src={form.thumbnail_url} alt="Thumbnail" className="rounded-xl shadow-lg w-full object-cover max-h-80 border-4 border-blue-500" />
                                <button onClick={handleRemoveThumbnail} className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded">❌ Xóa</button>
                            </div>
                        ) : (
                            <div className="h-80 bg-gray-200 flex items-center justify-center rounded-xl text-gray-500 font-bold">🚫 Chưa có Ảnh đại diện</div>
                        )}
                        <input type="file" onChange={handleThumbnailChange} hidden ref={thumbnailInputRef} accept="image/*" />
                        <button onClick={() => thumbnailInputRef.current?.click()} disabled={isUploading} className={`w-full py-3 text-white font-extrabold rounded-xl shadow-md ${isUploading ? 'bg-gray-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {isUploading ? '⬆️ Đang tải lên...' : '📸 Thay đổi ảnh đại diện'}
                        </button>

                        <div className="mt-4">
                            <label className="font-bold text-gray-800 block mb-1">Ảnh sản phẩm khác:</label>
                            <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {form.images_urls.map((img, i) => (
                                    <div key={i} className="relative">
                                        <img src={img.url} alt="img" className="w-full h-24 object-cover rounded" />
                                        <button onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-500 text-white px-1 rounded">❌</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Info Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Name & Slug */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="font-bold text-gray-800 block mb-1">Tên sản phẩm:</label>
                                <input value={form.name} onChange={e => handleChange("name", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg font-semibold text-gray-900" />
                            </div>
                            <div>
                                <label className="font-bold text-gray-800 block mb-1">Slug (Đường dẫn):</label>
                                <div className="flex gap-2">
                                    <input value={form.slug} onChange={e => handleChange("slug", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
                                    <button onClick={() => handleChange("slug", generateSlug(form.name))} className="px-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-bold">Auto</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div>
                                <label className="font-bold text-gray-800 block mb-1">Trạng thái:</label>
                                <select value={form.status} onChange={e => handleChange("status", Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg">
                                    <option value={1}>✅ Hiển thị</option>
                                    <option value={0}>❌ Ẩn</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold text-gray-800 block mb-1">Danh mục:</label>
                                <select value={form.category_id} onChange={e => handleChange("category_id", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="font-bold text-gray-800 block mb-1">Giá (VNĐ):</label>
                                <input type="number" value={form.price_buy} onChange={e => handleChange("price_buy", Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="font-bold text-gray-800 block mb-1">Tồn kho:</label>
                                <input type="number" value={form.stock} onChange={e => handleChange("stock", Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="font-bold text-gray-800 block mb-1">Mô tả ngắn:</label>
                            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg h-24" />
                        </div>
                        <div className="mt-2">
                            <label className="font-bold text-gray-800 block mb-1">Nội dung chi tiết:</label>
                            <textarea value={form.content} onChange={e => handleChange("content", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg h-32" />
                        </div>

                        {/* Attribute Section */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h3 className="text-xl font-extrabold text-blue-900 mb-4">🧩 Thuộc tính sản phẩm</h3>

                            {/* List existing options */}
                            {form.options.map((opt, i) => (
                                <div key={opt.id} className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <strong className="text-lg text-gray-800">{opt.name}</strong>
                                        <button onClick={() => handleRemoveOption(opt.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">🗑️ Xóa</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {opt.values.map((val, j) => (
                                            <div key={j} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                                <input
                                                    value={val}
                                                    onChange={e => handleOptionValueChange(opt.id, j, e.target.value)}
                                                    className="bg-transparent border-b border-gray-400 focus:border-blue-500 outline-none w-24 text-sm"
                                                    placeholder="Giá trị..."
                                                />
                                                <button onClick={() => handleRemoveOptionValue(opt.id, j)} className="text-red-500 font-bold ml-1">×</button>
                                            </div>
                                        ))}
                                        <button onClick={() => handleOptionValueChange(opt.id, opt.values.length, "")} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-bold">+ Thêm giá trị</button>
                                    </div>
                                </div>
                            ))}

                            {/* Add new option dropdown */}
                            <div className="flex items-center gap-2 mt-4">
                                <select
                                    value={selectedAttrToAdd}
                                    onChange={e => setSelectedAttrToAdd(e.target.value)}
                                    className="p-2 border border-blue-300 rounded-lg flex-1"
                                >
                                    <option value="">-- Chọn thuộc tính để thêm --</option>
                                    {attributes.filter(a => !form.options.find(o => o.id === a.id)).map(attr => (
                                        <option key={attr.id} value={attr.id}>{attr.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddOption}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow disabled:bg-gray-400"
                                    disabled={!selectedAttrToAdd}
                                >
                                    + Thêm
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center sticky bottom-4 bg-white p-4 shadow-xl rounded-2xl border border-gray-200 z-10">
                            <button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all">
                                {isSaving ? '💾 Đang lưu...' : '💾 LƯU SẢN PHẨM'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
