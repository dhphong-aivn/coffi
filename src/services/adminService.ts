/**
 * Admin Service — gọi /api/admin (proxy → GAS)
 * Tất cả admin actions đi qua đây, không gọi GAS trực tiếp từ client.
 */

async function callAdmin(action: string, data: Record<string, any> = {}, userRole: string = "") {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data, userRole })
  });
  return res.json();
}

export const adminService = {
  // ── Menu ──
  getMenu: () => callAdmin("GET_MENU"),
  addMenuItem: (data: any, role: string) => callAdmin("ADD_MENU_ITEM", data, role),
  updateMenuItem: (data: any, role: string) => callAdmin("UPDATE_MENU_ITEM", data, role),
  deleteMenuItem: (data: any, role: string) => callAdmin("DELETE_MENU_ITEM", data, role),

  // ── Categories ──
  getCategories: () => callAdmin("GET_CATEGORIES"),

  // ── Suppliers ──
  getSuppliers: (role: string) => callAdmin("GET_SUPPLIERS", {}, role),
  addSupplier: (data: any, role: string) => callAdmin("ADD_SUPPLIER", data, role),

  // ── Orders ──
  getOrders: (role: string) => callAdmin("GET_ORDERS", {}, role),
  updateOrderStatus: (data: any, role: string) => callAdmin("UPDATE_ORDER_STATUS", data, role),

  // ── Stock ──
  getStock: () => callAdmin("GET_STOCK"),
  checkItemStock: (menuId: string) => callAdmin("CHECK_ITEM_STOCK", { menuId }),
  restock: (data: any, role: string) => callAdmin("RESTOCK", data, role),

  // ── Users ──
  getUsers: (role: string) => callAdmin("GET_USERS", {}, role),
  addUser: (data: any, role: string) => callAdmin("ADD_USER", data, role),
  updateUser: (data: any, role: string) => callAdmin("UPDATE_USER", data, role),

  // ── Dashboard ──
  getDashboard: (role: string) => callAdmin("GET_DASHBOARD", {}, role),
};
