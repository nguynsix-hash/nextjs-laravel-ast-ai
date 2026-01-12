"use client";
import React, { useEffect, useState, useMemo } from "react";
// Import các icons cần thiết
import { X, Package, Calendar, User, DollarSign, Tag, TrendingUp, Mail, Phone, MapPin, MessageSquare } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation";
import OrderService from "@/services/OrderService";

export default function OrderShow() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // ======================
    // CALL API
    // ======================
    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            try {
                // Giả định API trả về định dạng tốt, sử dụng order?.data.data hoặc order?.data tùy theo cấu trúc
                const res = await OrderService.getById(id);
                // Đảm bảo dữ liệu là đối tượng đơn hàng
                const apiData = res.data.data || res.data;
                // Ánh xạ data. Lưu ý: Giả định tên khách hàng là 'name'
                setOrder({
                    ...apiData,
                    name: apiData.name || apiData.customer_name || "Chưa có tên", // Dùng trường name hoặc customer_name
                    email: apiData.email || "N/A", // Thêm trường Email
                    phone: apiData.phone || "N/A",
                    address: apiData.address || "N/A",
                    note: apiData.note || "Không có ghi chú.",
                }); 
            } catch (error) {
                console.error("Lỗi lấy chi tiết đơn hàng:", error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    // ======================
    // STATUS BADGE (Đã chỉnh màu và độ đậm)
    // ======================
    const getStatusBadge = (status) => {
        switch (status) {
            case 1:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">Chờ xử lý</span>;
            case 2:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">Đang xử lý</span>;
            case 3:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">Hoàn thành</span>;
            case 4:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">Hủy</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800">Không xác định</span>;
        }
    };

    // ======================
    // TÍNH TỔNG TIỀN (SAU GIẢM)
    // ======================
    const totalAmount = useMemo(() => {
        if (!order?.details) return 0;
        // Sử dụng trường total trong order nếu có, nếu không thì tính lại từ details
        return order.total ? Number(order.total) : order.details.reduce(
            (sum, item) => sum + Number(item.amount),
            0
        );
    }, [order]);

    // ======================
    // FORMAT DATE (Tạo hàm format ngày tháng)
    // ======================
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        // Giả sử dateString là một chuỗi ISO hoặc định dạng có thể tạo Date
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("vi-VN", {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return dateString; // Trả về chuỗi gốc nếu không thể format
        }
    }


    // ======================
    // LOADING
    // ======================
    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-screen">
                <div className="text-center text-xl font-bold text-blue-600 animate-pulse">
                    Đang tải dữ liệu đơn hàng...
                </div>
            </div>
        );
    }

    // ======================
    // NOT FOUND
    // ======================
    if (!order) {
        return (
            <div className="p-8 text-center bg-white shadow-lg rounded-xl max-w-md mx-auto mt-10">
                <p className="text-red-600 text-xl font-bold mb-4">
                    Không tìm thấy đơn hàng
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
    // RENDER
    // ======================
    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3 text-gray-800">
                        <Package className="text-blue-600 w-8 h-8" />
                        Chi tiết đơn hàng <span className="text-blue-600">#{order.id}</span>
                    </h1>
                    <button
                        onClick={() => router.push("/dashboard/admin/orders")}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
                    >
                        <X size={20} /> Quay lại
                    </button>
                </div>

                {/* THÔNG TIN ĐƠN */}
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-3 flex items-center gap-2">
                        <TrendingUp size={24} className="text-orange-500" />
                        Tổng quan & Khách hàng
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* 3 cột */}
                        
                        {/* Khách hàng & Email */}
                        <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-500 flex items-center gap-2"><User className="w-4 h-4 text-blue-600"/> Khách hàng</p>
                            <p className="font-extrabold text-lg text-gray-900">{order.name || "Chưa có tên"}</p>
                            
                            {/* Hiển thị Email */}
                            {(order.email && order.email !== 'N/A') && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600"/> {order.email}
                                </p>
                            )}
                        </div>
                        
                        {/* Điện thoại */}
                        <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600"/> Điện thoại</p>
                            <p className="font-extrabold text-lg text-gray-900">{order.phone}</p>
                        </div>
                        
                        {/* Ngày đặt */}
                        <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600"/> Ngày đặt</p>
                            <p className="font-semibold text-gray-900 text-base">{formatDate(order.created_at)}</p>
                        </div>

                        {/* Địa chỉ (Kéo dài 3 cột trên màn hình lớn) */}
                        <div className="lg:col-span-3 flex flex-col gap-1 p-3 bg-gray-100 rounded-lg border border-gray-300">
                            <p className="text-sm text-gray-600 flex items-center gap-2 font-bold"><MapPin className="w-5 h-5 text-red-500"/> Địa chỉ Giao hàng</p>
                            <p className="font-semibold text-lg text-gray-900">{order.address}</p>
                        </div>
                        
                        {/* Ghi chú (Kéo dài 3 cột trên màn hình lớn) */}
                        <div className="lg:col-span-3 flex flex-col gap-1 p-3 bg-gray-100 rounded-lg border border-gray-300">
                            <p className="text-sm text-gray-600 flex items-center gap-2 font-bold"><MessageSquare className="w-5 h-5 text-purple-500"/> Ghi chú</p>
                            <p className="font-medium text-gray-800 whitespace-pre-wrap">{order.note}</p>
                        </div>

                        {/* Trạng thái */}
                        <div className="md:col-span-1 flex flex-col gap-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-500 flex items-center gap-2"><Package className="w-4 h-4 text-blue-600"/> Trạng thái</p>
                            {getStatusBadge(order.status)}
                        </div>

                        {/* Tổng tiền (Kéo dài 2 cột) */}
                        <div className="md:col-span-2 flex flex-col gap-1 p-3 bg-green-50 rounded-lg border border-green-300">
                            <p className="text-sm text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600"/> **Tổng tiền (Sau giảm giá)**</p>
                            <p className="font-extrabold text-2xl text-green-700">
                                {totalAmount.toLocaleString("vi-VN")} ₫
                            </p>
                        </div>

                    </div>
                </div>

                {/* DANH SÁCH SẢN PHẨM */}
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <h2 className="text-2xl font-bold p-6 text-gray-700 border-b">
                        Chi tiết sản phẩm
                    </h2>
                    <table className="w-full text-sm text-left text-gray-500 table-auto">
                        <thead className="text-xs uppercase bg-blue-600 text-white">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-10">#</th>
                                <th scope="col" className="px-4 py-3 min-w-[250px]">Sản phẩm</th>
                                <th scope="col" className="px-4 py-3 text-right min-w-[120px]">Giá</th>
                                <th scope="col" className="px-4 py-3 text-center w-20">SL</th>
                                <th scope="col" className="px-4 py-3 text-right min-w-[120px]">Giảm</th>
                                <th scope="col" className="px-4 py-3 text-right min-w-[150px]">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.details?.map((item, index) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-4 py-3 font-semibold text-blue-700 whitespace-nowrap">
                                        {item.product?.name || "Sản phẩm không rõ"}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                                        {Number(item.price).toLocaleString("vi-VN")} ₫
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-800">
                                        {item.qty}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-red-600 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <Tag size={14} />
                                            {Number(item.discount).toLocaleString("vi-VN")} ₫
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-extrabold text-green-600 whitespace-nowrap">
                                        {Number(item.amount).toLocaleString("vi-VN")} ₫
                                    </td>
                                </tr>
                            ))}

                            {order.details?.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500 italic">
                                        Đơn hàng chưa có sản phẩm nào được ghi nhận.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}