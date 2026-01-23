<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Tổng doanh thu (Tính từ OrderDetail vì Order có thể thiếu field total_amount)
        $totalRevenue = \App\Models\OrderDetail::sum('amount');

        // 2. Tổng đơn hàng
        $totalOrders = Order::count();

        // 3. Tổng khách hàng
        $totalMembers = User::where('roles', '!=', 'admin')->count();

        // 4. Tổng sản phẩm
        $totalProducts = Product::count();
        
        // 5. Đơn hàng gần đây
        $recentOrders = Order::with('user')
            ->withSum('details', 'amount') // Tính tổng tiền từ chi tiết
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => '#ORD-' . $order->id,
                    'customer' => $order->user ? $order->user->name : ($order->name ? $order->name : 'Khách lẻ'),
                    'product' => $order->note ? $order->note : 'Đơn hàng #' . $order->id, 
                    'amount' => number_format($order->details_sum_amount, 0, ',', '.') . 'đ', // Dùng kết quả withSum
                    'status' => $this->mapStatus($order->status),
                    'date' => Carbon::parse($order->created_at)->diffForHumans()
                ];
            });

        return response()->json([
            'success' => true,
            'stats' => [
                [
                    'title' => "Tổng Doanh Thu",
                    'value' => number_format($totalRevenue, 0, ',', '.') . 'đ',
                    'change' => "+12.5%", // Logic tính % tăng trưởng nếu cần phức tạp hơn
                    'trend' => "up",
                    'icon' => "DollarSign",
                    'gradient' => "from-emerald-500 to-teal-400",
                    'shadow' => "shadow-emerald-200"
                ],
                [
                    'title' => "Đơn Hàng",
                    'value' => $totalOrders,
                    'change' => "+8.2%",
                    'trend' => "up",
                    'icon' => "ShoppingCart",
                    'gradient' => "from-blue-500 to-indigo-400",
                    'shadow' => "shadow-blue-200"
                ],
                [
                    'title' => "Khách Hàng",
                    'value' => $totalMembers,
                    'change' => "-2.1%",
                    'trend' => "down",
                    'icon' => "Users",
                    'gradient' => "from-violet-500 to-purple-400",
                    'shadow' => "shadow-violet-200"
                ],
                [
                    'title' => "Sản Phẩm",
                    'value' => $totalProducts,
                    'change' => "+5.4%",
                    'trend' => "up",
                    'icon' => "Package",
                    'gradient' => "from-orange-500 to-amber-400",
                    'shadow' => "shadow-orange-200"
                ]
            ],
            'recent_orders' => $recentOrders
        ]);
    }

    private function mapStatus($status)
    {
        // Map status ID sang string class (success, pending, shipping, cancel)
        switch ($status) {
            case 1: return 'pending'; // Đơn mới
            case 2: return 'shipping'; // Đương giao
            case 3: return 'success'; // Hoàn thành
            case 4: return 'cancel'; // Hủy
            default: return 'pending';
        }
    }
}
