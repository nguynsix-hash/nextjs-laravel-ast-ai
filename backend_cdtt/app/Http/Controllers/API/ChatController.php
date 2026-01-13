<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Config;

class ChatController extends Controller
{
    // Fallback responses khi Gemini không khả dụng
    private $fallbackResponses = [
        'xin chào' => 'Xin chào! 👋 Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
        'hello' => 'Xin chào! 👋 Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
        'hi' => 'Xin chào! 👋 Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
        'giá' => 'Để xem giá sản phẩm, bạn vui lòng truy cập trang Sản phẩm hoặc cho tôi biết tên sản phẩm cụ thể.',
        'đơn hàng' => 'Để kiểm tra đơn hàng, vui lòng đăng nhập và vào mục "Lịch sử mua hàng" trong trang cá nhân.',
        'giao hàng' => '🚚 Giao hàng toàn quốc, 2-5 ngày tùy khu vực. Miễn phí ship cho đơn từ 500.000đ.',
        'đổi trả' => '🔄 Chính sách đổi trả trong 7 ngày nếu sản phẩm còn nguyên tem mác.',
        'thanh toán' => '💳 Hỗ trợ: COD, Chuyển khoản ngân hàng, Ví điện tử.',
        'khuyến mãi' => '🎉 Xem khuyến mãi mới nhất tại trang Khuyến mãi trên website.',
        'liên hệ' => '📞 Liên hệ hotline hoặc ghé trang Liên hệ để được hỗ trợ.',
        'cảm ơn' => 'Không có gì! Rất vui được hỗ trợ bạn. Chúc bạn mua sắm vui vẻ! 🎉',
    ];

    private function getFallbackResponse($message, $hotline)
    {
        $lowerMsg = mb_strtolower($message, 'UTF-8');
        
        foreach ($this->fallbackResponses as $keyword => $response) {
            if (str_contains($lowerMsg, $keyword)) {
                return str_replace('hotline', "hotline {$hotline}", $response);
            }
        }
        
        return "Cảm ơn bạn đã nhắn tin! 😊\n\nĐể được hỗ trợ tốt hơn:\n• Hỏi về: giá, đơn hàng, giao hàng, đổi trả\n• Hoặc gọi hotline: {$hotline}";
    }

    /**
     * POST /api/chat
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $userMessage = $request->message;
        $apiKey = env('GEMINI_API_KEY');

        // Lấy thông tin website từ config
        $config = Config::first();
        $siteName = $config->site_name ?? 'ESHOP';
        $email = $config->email ?? 'support@eshop.vn';
        $phone = $config->phone ?? '1900 6868';
        $hotline = $config->hotline ?? $phone;
        $address = $config->address ?? 'TP. Hồ Chí Minh';

        // Nếu không có API key, dùng fallback
        if (!$apiKey) {
            return response()->json([
                'success' => true,
                'message' => $this->getFallbackResponse($userMessage, $hotline)
            ]);
        }

        try {
            $systemPrompt = "Bạn là trợ lý ảo của cửa hàng {$siteName}. Hotline: {$hotline}, Email: {$email}, Địa chỉ: {$address}. Giao hàng 2-5 ngày, miễn phí ship từ 500k. Đổi trả 7 ngày. Thanh toán: COD, chuyển khoản. Trả lời ngắn gọn, thân thiện, dưới 100 từ, dùng emoji. Luôn tiếng Việt.";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(15)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $systemPrompt . "\n\nKhách hỏi: " . $userMessage]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 300,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                
                if ($reply) {
                    return response()->json([
                        'success' => true,
                        'message' => $reply
                    ]);
                }
            }

            // Gemini failed, use fallback
            \Log::warning('Gemini API failed, using fallback: ' . $response->status());
            return response()->json([
                'success' => true,
                'message' => $this->getFallbackResponse($userMessage, $hotline)
            ]);

        } catch (\Exception $e) {
            \Log::error('Chat Error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'message' => $this->getFallbackResponse($userMessage, $hotline)
            ]);
        }
    }
}
