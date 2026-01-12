"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Search, Edit, FileText, Loader2, AlertTriangle,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Tag, AlignLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import PostService from "@/services/PostService";
import toast from "react-hot-toast";

/* =========================
 * STATUS BADGE
 * ========================= */
const statusMap = {
    1: {
        text: "Xuất bản",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-300"
    },
    0: {
        text: "Bản nháp",
        className: "bg-slate-100 text-slate-600 border border-slate-300"
    }
};

/* =========================
 * PAGINATION RANGE
 * ========================= */
const getPaginationRange = (current, last) => {
    const delta = 1;
    const pages = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
        pages.push(i);
    }
    return pages;
};

export default function PostsManagement() {
    const router = useRouter();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    /* =========================
     * FETCH POSTS
     * ========================= */
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await PostService.index({
                page,
                per_page: 6,
                search: search || undefined,
                status: status === "all" ? undefined : status
            });

            const data = res.data;
            setPosts(data.data || []);
            setPage(data.current_page);
            setLastPage(data.last_page);
            setTotal(data.total);
            setError(null);
        } catch {
            setError("Không thể tải dữ liệu bài viết");
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    /* =========================
     * DELETE
     * ========================= */
    const deletePost = async (id) => {
        if (!confirm(`Xóa bài viết #${id}?`)) return;
        try {
            await PostService.destroy(id);
            toast.success("Đã xóa bài viết");
            fetchPosts();
        } catch {
            toast.error("Xóa thất bại");
        }
    };

    const pages = getPaginationRange(page, lastPage);

    /* =========================
     * RENDER
     * ========================= */
    return (
        <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="text-indigo-600" size={30} />
                        Quản lý bài viết
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Tổng cộng <b>{total}</b> bài viết
                    </p>
                </div>

                <button
                    onClick={() => router.push("/dashboard/admin/posts/add")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                               bg-indigo-600 text-white font-semibold
                               hover:bg-indigo-700 shadow-lg shadow-indigo-500/40 transition"
                >
                    <Plus size={18} /> Thêm bài viết
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white rounded-2xl shadow border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Tìm kiếm tiêu đề..."
                        className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-300
                                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                    />
                </div>

                <select
                    className="px-4 py-2.5 rounded-xl border border-slate-300
                               focus:ring-2 focus:ring-indigo-500"
                    value={status}
                    onChange={(e) => {
                        setPage(1);
                        setStatus(e.target.value);
                    }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value={1}>Xuất bản</option>
                    <option value={0}>Bản nháp</option>
                </select>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            )}

            {/* ERROR */}
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-xl flex items-center gap-2">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* TABLE */}
            {!loading && !error && (
                <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600">Ảnh</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600">Tiêu đề</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Tag size={14} /> Topic
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <AlignLeft size={14} /> Nội dung
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600">Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {posts.map((post) => {
                                const statusInfo = statusMap[post.status];
                                const imageUrl = PostService.getImageUrl(post.image);

                                return (
                                    <tr key={post.id} className="border-t hover:bg-indigo-50/40 transition">
                                        <td className="px-6 py-4 font-bold text-slate-800">#{post.id}</td>

                                        <td className="px-6 py-4">
                                            <img
                                                src={imageUrl || "/placeholder.jpg"}
                                                onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                                                alt={post.title}
                                                className="w-24 h-14 object-cover rounded-xl shadow border"
                                            />
                                        </td>

                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {post.title}
                                        </td>

                                        <td className="px-6 py-4">
                                            {post.topic ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold
                         rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300">
                                                    {post.topic.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">Chưa gán</span>
                                            )}
                                        </td>


                                        <td className="px-6 py-4 text-slate-600 max-w-xs">
                                            <p className="line-clamp-2 text-sm">
                                                {post.content}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusInfo.className}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/dashboard/admin/posts/edit?id=${post.id}`)
                                                    }
                                                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => deletePost(post.id)}
                                                    className="p-2 rounded-full text-red-600 hover:bg-red-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINATION */}
            {lastPage > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft /></button>
                    <button onClick={() => setPage(page - 1)} disabled={page === 1}><ChevronLeft /></button>

                    {pages.map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-4 py-2 rounded-xl font-semibold transition ${p === page
                                    ? "bg-indigo-600 text-white shadow"
                                    : "bg-white border hover:bg-indigo-50"
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button onClick={() => setPage(page + 1)} disabled={page === lastPage}><ChevronRight /></button>
                    <button onClick={() => setPage(lastPage)} disabled={page === lastPage}><ChevronsRight /></button>
                </div>
            )}
        </div>
    );
}
