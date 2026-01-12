"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Search, Edit3, Grid, CornerLeftUp } from "lucide-react";
import { useRouter } from "next/navigation";
import TopicService from "@/services/TopicService";

export default function TopicsManagement() {
    const router = useRouter();

    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // "", 0, 1

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 5;

    // =======================
    // LOAD DATA FROM API
    // =======================
    const loadTopics = async () => {
        try {
            setLoading(true);
            const res = await TopicService.getAll({
                search: search || undefined,
                status: statusFilter !== "" ? statusFilter : undefined,
                per_page: 1000, // load tất cả rồi tự paginate FE
            });

            setTopics(res.data?.data ?? []);
        } catch (error) {
            console.error("Lỗi load topics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTopics();
    }, [search, statusFilter]);

    // =======================
    // FILTER + PAGINATION
    // =======================
    const filtered = useMemo(() => {
        let data = topics;

        // Lọc status
        if (statusFilter !== "") {
            data = data.filter(t => Number(t.status) === Number(statusFilter));
        }

        // Tìm kiếm theo tên
        if (search.trim() !== "") {
            data = data.filter(t =>
                t.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        return data;
    }, [topics, search, statusFilter]);

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

    // =======================
    // DELETE TOPIC
    // =======================
    const deleteTopic = async (id) => {
        if (!confirm(`Bạn có chắc muốn xóa Topic ID ${id}?`)) return;

        try {
            await TopicService.remove(id);
            loadTopics();
        } catch (error) {
            alert("Xóa thất bại!");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            
            {/* Header */}
            <header className="mb-6 pb-4 border-b border-gray-300">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Grid size={32} className="text-indigo-600" /> Quản lý Chủ đề (Topics)
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Tổng số chủ đề: <b>{topics.length}</b> — Hiển thị: <b>{filtered.length}</b>
                </p>
            </header>

            {/* SEARCH + FILTER + ADD */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                
                {/* SEARCH */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        placeholder="Tìm kiếm topic..."
                        className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full font-medium focus:ring-indigo-500 focus:border-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* STATUS FILTER */}
                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 font-medium focus:ring-indigo-500 focus:border-indigo-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="1">Hiển thị</option>
                    <option value="0">Ẩn</option>
                </select>

                {/* ADD BUTTON */}
                <button
                    onClick={() => router.push("/dashboard/admin/topics/add")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 shadow-md"
                >
                    <Plus size={18} /> Thêm Chủ đề
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-700 uppercase w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-700 uppercase w-48">Tên Topic</th>
                            <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-700 uppercase">Mô tả</th>
                            <th className="px-6 py-3 text-center text-xs font-extrabold text-gray-700 uppercase w-32">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-extrabold text-gray-700 uppercase w-32">Hành động</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : paginated.length > 0 ? (
                            paginated.map(topic => (
                                <tr key={topic.id} className="hover:bg-indigo-50 transition">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        #{topic.id}
                                    </td>

                                    <td className="px-6 py-4 text-md font-semibold text-indigo-700">
                                        {topic.name}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {topic.description}
                                    </td>

                                    {/* STATUS */}
                                    <td className="px-6 py-4 text-center">
                                        {topic.status == 1 ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                Hiển thị
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                Ẩn
                                            </span>
                                        )}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                                                onClick={() => router.push(`/dashboard/admin/topics/edit/${topic.id}`)}
                                            >
                                                <Edit3 size={16} />
                                            </button>

                                            <button
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                                onClick={() => deleteTopic(topic.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    Không có dữ liệu phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-3">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                currentPage === i + 1
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* BACK TO POSTS */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => router.push("/dashboard/admin/posts")}
                    className="flex items-center mx-auto gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                    <CornerLeftUp size={16} /> Quay lại Quản lý Bài viết
                </button>
            </div>

        </div>
    );
}
