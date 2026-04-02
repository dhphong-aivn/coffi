// Bảng tra cứu dữ liệu tĩnh để ánh xạ ID từ AI ra toàn bộ thông tin sản phẩm
export const menuLookup: Record<string, any> = {
  // --- COFFEE ---
  "macchiato": { id: "c1", name: "Macchiato", price: 80000, image: "https://images.unsplash.com/photo-1485600490772-d5cb3676c5b9?auto=format&fit=crop&q=80&w=200&h=200" },
  "cappuccino": { id: "c2", name: "Cappuccino", price: 95000, image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=200&h=200" },
  "espresso": { id: "c3", name: "Espresso", price: 60000, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=200&h=200" },
  "single-origin-pour-over": { id: "c4", name: "Single-Origin Pour Over", price: 120000, image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=200&h=200" },
  "vietnamese-iced-coffee": { id: "c5", name: "Vietnamese Iced Coffee", price: 65000, image: "https://images.unsplash.com/photo-1559863435-095ea9f67a21?auto=format&fit=crop&q=80&w=200&h=200" },
  // --- NON COFFEE ---
  "iced-chocolate": { id: "nc1", name: "Iced Chocolate", price: 150000, image: "https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&q=80&w=200&h=200" },
  "matcha-latte": { id: "nc2", name: "Matcha Latte", price: 90000, image: "https://images.unsplash.com/photo-1536514072410-5019a3c69182?auto=format&fit=crop&q=80&w=200&h=200" },
  "peach-tea": { id: "nc3", name: "Peach Tea", price: 75000, image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=200&h=200" },
  // --- DESSERT ---
  "butter-croissant": { id: "d1", name: "Butter Croissant", price: 55000, image: "https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=200&h=200" },
  "cheesecake": { id: "d2", name: "Cheesecake", price: 85000, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=200&h=200" },
  // --- SNACK ---
  "mixed-nuts": { id: "s1", name: "Mixed Nuts", price: 45000, image: "https://images.unsplash.com/photo-1599599811450-2fb322cc9822?auto=format&fit=crop&q=80&w=200&h=200" },
  "potato-wedges": { id: "s2", name: "Potato Wedges", price: 70000, image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=200&h=200" },
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

  // Nếu size lớn thì cộng thêm tiền (Quy tắc đơn giản dựa trên system prompt)
  let finalPrice = product.price;
  if (size === 'L') finalPrice += 3000;
  if (size === 'S') finalPrice -= 5000;

  return {
    ...product,
    price: finalPrice, 
    quantity: qty,
    size: size,
    id: `${product.id}-${size}-${Date.now()}` // Tạm tạo ID độc nhất cho món trong giỏ
  };
}
