"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Thay thế bằng đường dẫn chính xác của bạn
import ProductService from "@/services/ProductService";
import CategoryService from "@/services/CategoryService";
import AttributeService from "@/services/AttributeService";
import ProductAttributeService from "@/services/ProductAttributeService";

// Component Toast đơn giản (Giữ nguyên logic, tinh chỉnh giao diện)
const Toast = ({ message, type, onClose }) => {
    // Bảng màu dịu hơn
    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl text-white transition-opacity duration-300 z-50 transform hover:scale-105 ease-out max-w-sm";
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500'; // Dùng màu 500 dịu hơn

    if (!message) return null;

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <div className="flex justify-between items-start">
                <span className="font-semibold">{message}</span>
                <button onClick={onClose} className="ml-4 font-bold p-1 rounded-full hover:bg-white hover:bg-opacity-30 transition">X</button>
            </div>
        </div>
    );
};


export default function AddProduct({ onSave }) {
    const router = useRouter(); // Khởi tạo useRouter

    // Giữ nguyên Initial State
    const initialFormData = {
        name: "",
        price_buy: 0,
        status: 1,
        description: "",
        content: "",
        category_id: "",
        thumbnail: null,
        images: [],
        attributes: [],
    };

    const [formData, setFormData] = useState(initialFormData);
    const [categories, setCategories] = useState([]);
    const [masterAttributes, setMasterAttributes] = useState([]);
    const [attrValueSuggestions, setAttrValueSuggestions] = useState({});
    const [previewUrls, setPreviewUrls] = useState({
        thumbnail: null,
        images: [],
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    // --- LOGIC FETCH DATA (GIỮ NGUYÊN) ---
    useEffect(() => {
        const fetchData = async () => {
             try {
                // 1. Lấy Categories
                const catRes = await CategoryService.getAll();
                setCategories(catRes.data.data || []);

                // 2. Lấy Attributes Gốc
                const attrRes = await AttributeService.getAll();
                setMasterAttributes(attrRes.data || []);

                // 3. LẤY GỢI Ý GIÁ TRỊ THUỘC TÍNH
                const suggestionRes = await ProductAttributeService.getList({
                    unique_values: true,
                });

                const formattedSuggestions = (suggestionRes.data.data || []).reduce((acc, item) => {
                    const attrId = String(item.attribute_id);
                    if (!acc[attrId]) {
                        acc[attrId] = [];
                    }
                    if (item.value && !acc[attrId].includes(item.value)) {
                        acc[attrId].push(item.value);
                    }
                    return acc;
                }, {});

                setAttrValueSuggestions(formattedSuggestions);

            } catch (err) {
                console.error("❌ Lỗi khi lấy dữ liệu:", err);
                setToast({ message: 'Lỗi tải dữ liệu ban đầu.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        const cleanupPreviews = () => {
            if (previewUrls.thumbnail) URL.revokeObjectURL(previewUrls.thumbnail);
            previewUrls.images.forEach(url => URL.revokeObjectURL(url));
        };

        fetchData();
        return cleanupPreviews;
    }, []);

    // --- HANDLERS (GIỮ NGUYÊN) ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : (name === 'price_buy' ? Number(value) : value);
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleThumbnail = (e) => {
        const file = e.target.files[0];
        if (previewUrls.thumbnail) URL.revokeObjectURL(previewUrls.thumbnail);

        setFormData(prev => ({ ...prev, thumbnail: file }));
        setPreviewUrls(prev => ({
            ...prev,
            thumbnail: file ? URL.createObjectURL(file) : null
        }));
    };

    const handleImages = (e) => {
        const newFiles = Array.from(e.target.files);
        const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newFiles]
        }));
        setPreviewUrls(prev => ({
            ...prev,
            images: [...prev.images, ...newPreviewUrls]
        }));

        e.target.value = null;
    };

    const removeImage = (index) => {
        const urlToRemove = previewUrls.images[index];
        URL.revokeObjectURL(urlToRemove);

        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setPreviewUrls(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const addAttribute = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [
                ...prev.attributes,
                { id: Date.now() + Math.random(), attribute_id: "", value: "" }
            ],
        }));
    };

    const updateAttribute = (id, field, val) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map((attr) =>
                attr.id === id ? { ...attr, [field]: val } : attr
            ),
        }));
    };

    const removeAttribute = (id) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((attr) => attr.id !== id),
        }));
    };


    // --- SUBMIT FORM VÀ CHUYỂN HƯỚNG (GIỮ NGUYÊN LOGIC) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setToast({ message: '', type: '' });

        try {
            const data = new FormData();
            // Append các trường dữ liệu
            data.append("name", formData.name);
            data.append("price_buy", formData.price_buy);
            data.append("status", formData.status);
            data.append("description", formData.description);
            data.append("content", formData.content);
            data.append("category_id", formData.category_id);

            if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);

            formData.images.forEach((file) => data.append("images[]", file));

            let attrIndex = 0;
            formData.attributes.forEach((attr) => {
                if (attr.attribute_id && attr.value) {
                    data.append(`attributes[${attrIndex}][attribute_id]`, attr.attribute_id);
                    data.append(`attributes[${attrIndex}][value]`, attr.value);
                    attrIndex++;
                }
            });

            const res = await ProductService.create(data);

            setToast({ message: 'Tạo sản phẩm thành công! Đang chuyển hướng...', type: 'success' });
            if (onSave) onSave(res.data.data);

            setTimeout(() => {
                router.push('/dashboard/admin/product');
            }, 1500);

        } catch (err) {
            console.error("❌ Lỗi tạo sản phẩm:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                const errors = err.response.data.errors;
                let errorMsg = "Lỗi validation: ";
                // Chỉ lấy lỗi đầu tiên của mỗi trường và giới hạn ký tự cho gọn
                const errorKeys = Object.keys(errors).slice(0, 3);
                errorKeys.forEach((key, index) => {
                    errorMsg += `${index > 0 ? ', ' : ''}${errors[key][0]}`;
                });
                setToast({ message: errorMsg, type: 'error' });
            } else {
                setToast({ message: 'Lỗi! Không thể tạo sản phẩm.', type: 'error' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 p-8 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
                     <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tải dữ liệu...
                </div>
            </div>
        );
    }


    // ----------------------------------------------------------------------------------------------------
    // START: GIAO DIỆN NÂNG CẤP VỚI MÀU DỊU MẮT
    // ----------------------------------------------------------------------------------------------------
    return (
        <>
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: '' })}
            />
            <form onSubmit={handleSubmit} className="p-4 md:p-8 lg:p-10 space-y-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <header className="pb-4 border-b border-gray-300 dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center">
                        <svg className="w-8 h-8 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Tạo Sản Phẩm Mới
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Điền đầy đủ các thông tin cần thiết để thêm sản phẩm vào hệ thống.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CỘT 1 & 2: THÔNG TIN CƠ BẢN & MÔ TẢ */}
                    <div className="lg:col-span-2 space-y-8">
                         {/* Card 1: Thông Tin Cơ Bản */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700/50 flex items-center">
                                <span className="text-blue-500 mr-2">i</span> Thông Tin Chung
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tên sản phẩm */}
                                <InputGroup label="Tên sản phẩm" name="name" value={formData.name} onChange={handleChange} required type="text" placeholder="Áo thun cơ bản, iPhone 15 Pro..." />

                                {/* Giá */}
                                <InputGroup label="Giá mua (VNĐ)" name="price_buy" value={formData.price_buy} onChange={handleChange} required type="number" min="0" placeholder="100000" />

                                {/* Danh mục */}
                                <div className="form-group">
                                    <Label required>Danh mục</Label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="StyledSelect"
                                        required
                                    >
                                        <option value="" disabled>-- Chọn danh mục --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Trạng thái */}
                                <div className="form-group">
                                    <Label required>Trạng thái</Label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="StyledSelect"
                                    >
                                        <option value={1}>✅ Hiển thị</option>
                                        <option value={0}>❌ Ẩn</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                         {/* Card 2: Mô tả & Nội dung */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                             <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700/50 flex items-center">
                                <span className="text-blue-500 mr-2">📝</span> Mô Tả Chi Tiết
                            </h2>
                            <div className="space-y-6">
                                <div className="form-group">
                                    <Label>Mô tả ngắn (Description)</Label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="StyledInput h-24"
                                        rows="3"
                                        placeholder="Sản phẩm nổi bật với..."
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <Label>Nội dung chi tiết (Content)</Label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        className="StyledInput h-36"
                                        rows="5"
                                        placeholder="Thông tin chi tiết về chất liệu, bảo hành, v.v."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT 3: HÌNH ẢNH */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Card 3: Quản Lý Hình Ảnh */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 sticky top-4">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700/50 flex items-center">
                                <span className="text-blue-500 mr-2">📸</span> Ảnh & Media
                            </h2>

                            {/* THUMBNAIL */}
                            <div className="form-group mb-6">
                                <Label required>Ảnh đại diện (Thumbnail)</Label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnail}
                                    className="FileUploadInput"
                                />
                                {previewUrls.thumbnail && (
                                    <ImagePreview url={previewUrls.thumbnail} onRemove={() => {
                                        setFormData(prev => ({ ...prev, thumbnail: null }));
                                        URL.revokeObjectURL(previewUrls.thumbnail);
                                        setPreviewUrls(prev => ({ ...prev, thumbnail: null }));
                                    }} isSingle />
                                )}
                            </div>

                            {/* HÌNH ẢNH KHÁC */}
                            <div className="form-group">
                                <Label>Hình ảnh khác</Label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImages}
                                    className="FileUploadInput"
                                />
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {previewUrls.images.map((url, index) => (
                                        <ImagePreview key={index} url={url} onRemove={() => removeImage(index)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KHU VỰC THUỘC TÍNH SẢN PHẨM (Nằm phía dưới cùng, chiếm toàn bộ chiều ngang) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700/50 flex items-center">
                        <span className="text-blue-500 mr-2">🏷️</span> Thuộc tính (Attributes)
                    </h3>
                    <div className="space-y-4">
                        {formData.attributes.map((attr) => (
                            <div key={attr.id} className="AttributeRow">
                                {/* Dropdown chọn thuộc tính gốc */}
                                <div className="w-full sm:w-5/12">
                                    <Label size="sm">Tên thuộc tính</Label>
                                    <select
                                        name="attribute_id"
                                        value={attr.attribute_id}
                                        onChange={(e) => updateAttribute(attr.id, "attribute_id", e.target.value)}
                                        className="StyledSelect"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-500">-- Chọn thuộc tính gốc --</option>
                                        {masterAttributes.map(masterAttr => (
                                            <option key={masterAttr.id} value={masterAttr.id}>
                                                {masterAttr.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Input giá trị (CÓ THÊM DATALIST) */}
                                <div className="w-full sm:w-5/12">
                                    <Label size="sm">Giá trị</Label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: Đỏ, XL, 512GB..."
                                        value={attr.value}
                                        onChange={(e) => updateAttribute(attr.id, "value", e.target.value)}
                                        className="StyledInput"
                                        required
                                        list={`suggestions-for-${attr.attribute_id}`}
                                    />
                                    {attr.attribute_id && attrValueSuggestions[attr.attribute_id] && (
                                        <datalist id={`suggestions-for-${attr.attribute_id}`}>
                                            {attrValueSuggestions[attr.attribute_id].map((val, i) => (
                                                <option key={i} value={val} />
                                            ))}
                                        </datalist>
                                    )}
                                </div>

                                {/* Nút xóa */}
                                <div className="w-full sm:w-2/12 sm:pt-6">
                                    <button type="button" onClick={() => removeAttribute(attr.id)} className="DeleteButton">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Nút thêm thuộc tính */}
                        <button type="button" onClick={addAttribute} className="AddButton">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Thêm thuộc tính
                        </button>
                    </div>
                </div>

                {/* Nút Submit Lớn */}
                <footer className="pt-8 flex justify-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full max-w-lg ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-4 rounded-xl font-extrabold text-xl shadow-2xl transition duration-300 transform hover:scale-[1.01] flex items-center justify-center`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3m-4-8l4-4m0 0l-4 4m4-4H9m-9 4h20"></path></svg>
                                Lưu Sản Phẩm
                            </>
                        )}
                    </button>
                </footer>
            </form>

            {/* CÁC COMPONENTS PHỤ ĐƯỢC TÁCH RIÊNG */}
            <style jsx global>{`
                /* Global Styles for Inputs */
                .StyledInput, .StyledSelect, .DeleteButton, .AddButton {
                    transition: all 0.2s ease-in-out;
                    padding: 0.75rem 1rem; /* p-3 */
                    border-radius: 0.5rem; /* rounded-lg */
                    border: 1px solid var(--border-color);
                    width: 100%;
                }

                :root {
                    --bg-color: #f7f9fc; /* Light Gray */
                    --card-bg: #ffffff;
                    --text-color: #1f2937; /* Gray 800 */
                    --border-color: #d1d5db; /* Gray 300 */
                    --primary-color: #3b82f6; /* Blue 500 */
                }

                .dark :root {
                    --bg-color: #111827; /* Gray 900 */
                    --card-bg: #1f2937; /* Gray 800 */
                    --text-color: #f3f4f6; /* Gray 100 */
                    --border-color: #374151; /* Gray 700 */
                    --primary-color: #60a5fa; /* Blue 400 */
                }

                .StyledInput, .StyledSelect {
                    background-color: var(--card-bg);
                    color: var(--text-color);
                }

                .StyledInput:focus, .StyledSelect:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px var(--primary-color-light); /* custom focus ring */
                    outline: none;
                }
                
                .dark .StyledInput, .dark .StyledSelect {
                    background-color: var(--card-bg);
                    border-color: var(--border-color);
                }

                /* File Upload Input */
                .FileUploadInput {
                    display: block;
                    width: 100%;
                    text-sm;
                    text-gray-500;
                    dark:text-gray-400;
                }

                .FileUploadInput::file-selector-button {
                    padding: 0.5rem 1rem;
                    margin-right: 1rem;
                    border-radius: 9999px; /* rounded-full */
                    border: none;
                    font-size: 0.875rem; /* text-sm */
                    font-weight: 600; /* font-semibold */
                    background-color: #eff6ff; /* Blue 50 */
                    color: #2563eb; /* Blue 600 */
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .FileUploadInput::file-selector-button:hover {
                    background-color: #dbeafe; /* Blue 100 */
                }
                .dark .FileUploadInput::file-selector-button {
                    background-color: #1e3a8a; /* Blue 900 */
                    color: #93c5fd; /* Blue 300 */
                }
                .dark .FileUploadInput::file-selector-button:hover {
                    background-color: #172554; /* Blue 950 */
                }


                /* Attribute Row */
                .AttributeRow {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    background-color: #f0f8ff; /* Lightest Blue background */
                    border: 1px solid #bfdbfe; /* Blue 200 border */
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
                }
                .dark .AttributeRow {
                    background-color: #1e293b; /* Gray 800-ish */
                    border: 1px solid #374151;
                }
                @media (min-width: 640px) {
                    .AttributeRow {
                        flex-direction: row;
                        align-items: flex-end;
                    }
                }
                
                /* Buttons */
                .AddButton {
                    background-color: #2563eb; /* Blue 600 */
                    color: white;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .AddButton:hover {
                    background-color: #1d4ed8; /* Blue 700 */
                }
                .DeleteButton {
                    background-color: #ef4444; /* Red 500 */
                    color: white;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .DeleteButton:hover {
                    background-color: #dc2626; /* Red 600 */
                }

                @media (min-width: 640px) {
                    .DeleteButton {
                        padding: 0.75rem 1rem;
                    }
                }

            `}</style>
        </>
    );
}

// --- TÁCH CÁC COMPONENTS CON ĐỂ TÁI SỬ DỤNG VÀ LÀM SẠCH CODE ---

const Label = ({ children, required, size = 'md' }) => (
    <label className={`block mb-1 font-medium ${size === 'sm' ? 'text-sm' : 'text-base'} text-gray-700 dark:text-gray-300`}>
        {children} {required && <span className="text-red-500">*</span>}
    </label>
);

const InputGroup = ({ label, name, value, onChange, required, type = 'text', min, placeholder }) => (
    <div className="form-group">
        <Label required={required}>{label}</Label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="StyledInput"
            min={min}
            required={required}
            placeholder={placeholder}
        />
    </div>
);

const ImagePreview = ({ url, onRemove, isSingle = false }) => (
    <div className={`relative inline-block p-1 rounded-lg shadow-md transition-all duration-300 ${isSingle ? 'mt-4 border-2 border-blue-400' : 'border border-gray-300'}`}>
        <img
            src={url}
            alt="Preview"
            className={`${isSingle ? 'w-36 h-36' : 'w-20 h-20'} object-cover rounded`}
        />
        <button
            type="button"
            onClick={onRemove}
            className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700 transition"
        >
            &times;
        </button>
    </div>
);