const CartService = {
  // Lấy danh sách giỏ hàng
  getCart: () => {
    if (typeof window === "undefined") return [];
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  },

  // Thêm sản phẩm
  addToCart: (product, quantity, color, size) => {
    let cart = CartService.getCart();
    // Tạo ID duy nhất cho biến thể (ID sản phẩm + màu + size)
    const cartItemId = `${product.id}-${color || ''}-${size || ''}`;
    
    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        cartItemId,
        id: product.id,
        name: product.name,
        price: product.price_sale || product.price_buy,
        thumbnail: product.thumbnail,
        quantity,
        color,
        size
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    // Tạo một Event để các component khác (như Icon giỏ hàng trên Header) cập nhật kịp thời
    window.dispatchEvent(new Event("cartUpdate"));
    return cart;
  }
};

export default CartService;