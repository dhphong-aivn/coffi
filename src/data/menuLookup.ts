// Bảng tra cứu dữ liệu tĩnh để ánh xạ ID từ AI ra toàn bộ thông tin sản phẩm
export const menuLookup: Record<string, any> = {
  "den-da": { id: "p1", name: "Cà phê đen đá", price: 25000, image: "https://images.unsplash.com/photo-1550133730-695473e5ea0c?auto=format&fit=crop&q=80&w=200&h=200" },
  "nau-da": { id: "p2", name: "Cà phê nâu đá", price: 29000, image: "https://images.unsplash.com/photo-1559863435-095ea9f67a21?auto=format&fit=crop&q=80&w=200&h=200" },
  "bac-xiu": { id: "p3", name: "Bạc xỉu", price: 35000, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200&h=200" },
  "macchiato": { id: "p4", name: "Caramel Macchiato", price: 45000, image: "https://images.unsplash.com/photo-1485600490772-d5cb3676c5b9?auto=format&fit=crop&q=80&w=200&h=200" },
  "tra-dao": { id: "p5", name: "Trà đào cam sả", price: 39000, image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=200&h=200" },
};

export function getFullCartItem(menuId: string, size: string = 'M', qty: number = 1) {
  const normalizedId = menuId.toLowerCase().trim();
  const product = menuLookup[normalizedId];

  if (!product) {
    // Fallback if AI hallucinates an ID
    return {
      id: `custom-${Date.now()}`,
      name: menuId, 
      price: 30000,
      quantity: qty,
      size: size,
      image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=200&h=200"
    };
  }

  // Nếu size lớn thì cộng thêm tiền (Quy tắc đơn giản)
  let finalPrice = product.price;
  if (size === 'L') finalPrice += 10000;
  if (size === 'S') finalPrice -= 5000;

  return {
    ...product,
    price: finalPrice, 
    quantity: qty,
    size: size,
    id: `${product.id}-${size}-${Date.now()}` // Tạm tạo ID độc nhất cho món trong giỏ
  };
}
