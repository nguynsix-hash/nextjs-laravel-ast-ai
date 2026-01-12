<!DOCTYPE html>
<html>
<head>
    <title>Xác nhận đơn hàng</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
        .header { background-color: #f8f9fa; padding: 10px; text-align: center; }
        .order-details { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; text-align: right; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Cảm ơn bạn đã đặt hàng!</h2>
        </div>
        <p>Xin chào {{ $order->name }},</p>
        <p>Đơn hàng <strong>#{{ $order->id }}</strong> của bạn đã được đặt thành công.</p>
        
        <div class="order-details">
            <h3>Chi tiết đơn hàng</h3>
            <p><strong>Người nhận:</strong> {{ $order->name }}</p>
            <p><strong>Điện thoại:</strong> {{ $order->phone }}</p>
            <p><strong>Địa chỉ:</strong> {{ $order->address }}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->details as $detail)
                    <tr>
                        <td>{{ $detail->product->name ?? 'Sản phẩm #' . $detail->product_id }}</td>
                        <td>{{ $detail->qty }}</td>
                        <td>{{ number_format($detail->price) }} đ</td>
                        <td>{{ number_format($detail->amount) }} đ</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            
            <div class="total">
                <p>Tổng cộng: {{ number_format($order->details->sum('amount')) }} đ</p>
            </div>
        </div>
        
        <p>Chúng tôi sẽ sớm liên hệ để xác nhận và giao hàng.</p>
        <p>Trân trọng,<br>Đội ngũ ESHOP</p>
    </div>
</body>
</html>
