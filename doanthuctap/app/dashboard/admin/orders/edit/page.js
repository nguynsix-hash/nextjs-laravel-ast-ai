"use client";
import React, { useState, useEffect } from "react";
import { Save, X, Edit, User, ListChecks, Loader2, Mail, Phone, MapPin } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation";
import OrderService from "@/services/OrderService"; 

// Helper to get status color and text for options
const statusOptions = [
    { value: 1, text: "Chờ xử lý", className: "text-yellow-700 bg-yellow-100 border-yellow-300" }, // pending
    { value: 2, text: "Đang xử lý", className: "text-blue-700 bg-blue-100 border-blue-300" }, // processing
    { value: 3, text: "Hoàn thành", className: "text-green-700 bg-green-100 border-green-300" }, // completed
    { value: 4, text: "Hủy", className: "text-red-700 bg-red-100 border-red-300" }, // canceled
];

export default function OrderEdit() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // ======================
    // 1. TẢI DỮ LIỆU & ÁNH XẠ
    // ======================
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await OrderService.getById(id);
                const apiData = res.data.data || res.data; 
                
                // ÁNH XẠ ĐẦY ĐỦ DỮ LIỆU TỪ API SANG STATE
                const mappedOrderData = {
                    id: apiData.id,
                    user_id: apiData.user_id,         
                    created_by: apiData.created_by,   
                    customer: apiData.name || apiData.customer_name || 'N/A', // Đảm bảo có tên khách hàng
                    email: apiData.email || 'N/A',
                    phone: apiData.phone || 'N/A',
                    address: apiData.address || 'N/A',
                    note: apiData.note || 'Không có ghi chú',
                    
                    total: apiData.total ? Number(apiData.total) : 500000, // Vẫn giữ lại trong state để gửi lên API
                    
                    date: apiData.created_at, // Vẫn giữ lại trong state
                    status: Number(apiData.status),
                };
                
                setOrder(mappedOrderData); 
            } catch (err) {
                console.error("Lỗi tải chi tiết đơn hàng:", err.response?.data || err);
                const errorMsg = err.response?.data?.message || `Không thể tải chi tiết đơn hàng (ID: ${id}). Vui lòng kiểm tra API endpoint và kết nối.`;
                setError(errorMsg);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    // ======================
    // 2. XỬ LÝ THAY ĐỔI FORM (Chỉ cho phép sửa status)
    // ======================
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'status') {
             const newValue = Number(value);
             setOrder(prevOrder => ({
                 ...prevOrder,
                 [name]: newValue,
             }));
        }
    };

    // ======================
    // 3. XỬ LÝ SUBMIT FORM (UPDATE)
    // ======================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!order || !order.id) {
            setError("Lỗi: Không có ID đơn hàng để cập nhật.");
            setIsSubmitting(false);
            return;
        }

        try {
            // TẠO PAYLOAD ĐẦY ĐỦ: Gửi lại TẤT CẢ các trường đã tải về 
            // để đảm bảo backend không báo lỗi thiếu validation.
            const payload = {
                user_id: order.user_id,
                name: order.customer, 
                email: order.email,
                phone: order.phone,
                address: order.address,
                note: order.note, // Gửi lại
                created_by: order.created_by,
                total: Number(order.total), // Gửi lại
                status: Number(order.status), 
            };

            const res = await OrderService.update(order.id, payload);
            console.log("Cập nhật thành công:", res.data);
            
            alert(`✅ Đơn hàng #${order.id} của ${order.customer} đã được cập nhật trạng thái thành công!`); 
            
            router.push("/dashboard/admin/orders");
        } catch (err) {
            console.error("Lỗi cập nhật đơn hàng:", err.response?.data || err);
            
            // XỬ LÝ LỖI 422 CHI TIẾT
            let apiError = `Lỗi 422: API không chấp nhận dữ liệu gửi đi.`;
            const errorData = err.response?.data;
            
            if (errorData?.errors) {
                apiError += " Chi tiết lỗi Validation:";
                Object.entries(errorData.errors).forEach(([field, messages]) => {
                    apiError += ` [${field}: ${messages[0]}]`;
                });
            } else if (errorData?.message) {
                apiError += ` Chi tiết: ${errorData.message}`;
            }
            
            setError(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Lấy class hiện tại cho select status, chỉ lấy phần màu nền và màu chữ
    const currentStatusClass = statusOptions.find(opt => opt.value === order?.status)?.className.split(' ').slice(0, 2).join(' ') || "bg-white text-gray-800";


    // ======================
    // RENDER TRẠNG THÁI
    // ======================
    if (loading) {
         return (
            <div className="p-8 text-center text-xl font-bold text-blue-600 flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin mr-2" size={24} /> Đang tải dữ liệu đơn hàng...
            </div>
        );
    }
    
    if (error && !order) {
         return (
            <div className="p-8 text-center bg-white shadow-lg rounded-xl max-w-md mx-auto mt-10">
                <p className="text-red-600 text-xl font-extrabold mb-4">
                    {error}
                </p>
                <button
                    onClick={() => router.push("/dashboard/admin/orders")}
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    if (!order) {
         return (
             <div className="p-8 text-center bg-white shadow-lg rounded-xl max-w-md mx-auto mt-10">
                <p className="text-red-600 text-xl font-extrabold mb-4">
                    Không tìm thấy đơn hàng với ID: {id}
                </p>
                <button
                    onClick={() => router.push("/dashboard/admin/orders")}
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    // ======================
    // RENDER FORM (CHỈ CÒN THÔNG TIN CẦN THIẾT)
    // ======================
    return (
        <div className="p-4 sm:p-6 lg:p-10 bg-gray-100 min-h-screen"> 
            <div className="max-w-3xl mx-auto"> {/* Tăng max-w một chút cho đẹp */}
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Edit size={32} className="text-blue-600" /> Cập nhật Trạng thái Đơn hàng <span className="text-blue-700">#{order.id}</span>
                    </h1>
                </header>

                <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                    {error && (
                         <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-medium rounded text-base"> 
                            **Lỗi Cập nhật:** {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        
                        {/* CÁC TRƯỜNG THÔNG TIN KHÔNG CHỈNH SỬA */}
                        <h2 className="text-xl font-bold text-gray-700 mb-2 border-b pb-2">Thông tin Khách hàng</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Khách hàng (name) */}
                            <InfoCard icon={User} title="Khách hàng" value={order.customer} />

                            {/* Email */}
                            <InfoCard icon={Mail} title="Email" value={order.email} />

                            {/* Điện thoại */}
                            <InfoCard icon={Phone} title="Điện thoại" value={order.phone} />

                            {/* Địa chỉ */}
                            <InfoCard icon={MapPin} title="Địa chỉ" value={order.address} />

                        </div> 
                        
                        <div className="mt-4">
                             <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Trạng thái (Có thể thay đổi)</h2>
                            {/* TRẠNG THÁI - EDITABLE */}
                            <div className="bg-white p-4 rounded-lg border-2 border-blue-500 shadow-lg"> 
                                <label htmlFor="status" className="flex items-center gap-2 font-extrabold text-blue-700 mb-2">
                                    <ListChecks size={20} /> CHỌN TRẠNG THÁI MỚI
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    // Sử dụng class hiện tại để làm nổi bật ô select
                                    className={`border-2 border-gray-400 px-4 py-2 rounded-lg w-full text-lg font-bold focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none ${currentStatusClass}`}
                                    value={order.status}
                                    onChange={handleChange}
                                >
                                    {statusOptions.map(option => (
                                        <option 
                                            key={option.value} 
                                            value={option.value}
                                            // Dùng Tailwind classes cho option, nhưng phải dùng chung màu nền để thống nhất
                                            className={`font-semibold ${option.className.replace('border-yellow-300', '').replace('border-blue-300', '').replace('border-green-300', '').replace('border-red-300', '')}`} 
                                        >
                                            {option.text}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-extrabold hover:bg-blue-700 transition duration-200 shadow-xl shadow-blue-500/50 flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Save size={20} />
                                )} 
                                {isSubmitting ? 'Đang Lưu...' : 'LƯU THAY ĐỔI TRẠNG THÁI'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard/admin/orders")}
                                className="flex items-center justify-center gap-2 bg-gray-300 text-gray-800 px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-400 transition duration-200 flex-1"
                            >
                                <X size={20} /> HỦY BỎ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Custom Component cho thông tin chỉ đọc
const InfoCard = ({ icon: Icon, title, value }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <Icon size={20} className="text-blue-500 flex-shrink-0 mt-1" />
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="font-semibold text-gray-900 text-lg break-words">{value}</p>
        </div>
    </div>
);