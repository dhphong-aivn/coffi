/**
 * ════════════════════════════════════════════════════════════════
 *  Cof fi — Google Apps Script Backend v3.0
 *  Full RBAC + Dynamic Menu + Stock + Orders + Telegram Alerts
 * ════════════════════════════════════════════════════════════════
 *
 *  HƯỚNG DẪN TRIỂN KHAI:
 *  1. Google Sheets → Extensions → Apps Script → dán file này
 *  2. Cập nhật CONFIG bên dưới (Sheets ID, Telegram Bot Token, Email)
 *  3. Deploy → New Deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy URL → .env.local: NEXT_PUBLIC_GOOGLE_SHEETS_URL=<URL>
 *
 *  SHEETS TỰ TẠO (nếu chưa có):
 *  Categories · Suppliers · Menu · Orders · Restock · Users
 * ════════════════════════════════════════════════════════════════
 */

// ─── CONFIG ─────────────────────────────────────────────────────
var CONFIG = {
  API_SECRET: "coffi-2026-xyz",
  ALERT_EMAIL: "your-email@gmail.com",              // ← ĐỔI
  TELEGRAM_BOT_TOKEN: "",                            // ← ĐỔI (từ @BotFather)
  TELEGRAM_CHAT_ID: "",                              // ← ĐỔI (chat ID nhận thông báo)
  SHEETS: {
    CATEGORIES: "Categories",
    SUPPLIERS:  "Suppliers",
    MENU:       "Menu",
    ORDERS:     "Orders",
    RESTOCK:    "Restock",
    USERS:      "Users"
  }
};

// ════════════════════════════════════════════════════════════════
//  ENTRY POINTS
// ════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    if (payload.apiSecret !== CONFIG.API_SECRET) {
      return jsonResponse({ success: false, error: "Unauthorized" });
    }

    switch (payload.action) {
      // ── Auth ──
      case "CHECK_LOGIN":       return handleCheckLogin(payload.data);

      // ── Menu (Public Read, Admin Write) ──
      case "GET_MENU":          return handleGetMenu();
      case "ADD_MENU_ITEM":     return handleAddMenuItem(payload.data, payload.userRole);
      case "UPDATE_MENU_ITEM":  return handleUpdateMenuItem(payload.data, payload.userRole);
      case "DELETE_MENU_ITEM":  return handleDeleteMenuItem(payload.data, payload.userRole);

      // ── Categories ──
      case "GET_CATEGORIES":    return handleGetCategories();

      // ── Suppliers (Admin only) ──
      case "GET_SUPPLIERS":     return handleGetSuppliers(payload.userRole);
      case "ADD_SUPPLIER":      return handleAddSupplier(payload.data, payload.userRole);

      // ── Orders ──
      case "SUBMIT_ORDER":      return handleSubmitOrder(payload.data);
      case "GET_ORDERS":        return handleGetOrders(payload.userRole);
      case "UPDATE_ORDER_STATUS": return handleUpdateOrderStatus(payload.data, payload.userRole);

      // ── Stock ──
      case "GET_STOCK":         return handleGetStock();
      case "CHECK_ITEM_STOCK":  return handleCheckItemStock(payload.data);
      case "RESTOCK":           return handleRestock(payload.data, payload.userRole);

      // ── Leads ──
      case "SAVE_LEAD":         return handleSaveLead(payload.data);

      // ── Users (Admin only) ──
      case "GET_USERS":         return handleGetUsers(payload.userRole);
      case "ADD_USER":          return handleAddUser(payload.data, payload.userRole);
      case "UPDATE_USER":       return handleUpdateUser(payload.data, payload.userRole);

      // ── Dashboard ──
      case "GET_DASHBOARD":     return handleGetDashboard(payload.userRole);

      default:
        return jsonResponse({ success: false, error: "Unknown action: " + payload.action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ status: "ok", service: "Cof fi Backend v3.0", timestamp: new Date().toISOString() });
}

// ════════════════════════════════════════════════════════════════
//  AUTH & RBAC
// ════════════════════════════════════════════════════════════════

function handleCheckLogin(data) {
  var sheet = getOrCreateSheet(CONFIG.SHEETS.USERS, [
    "User_ID", "Email", "Password", "Full_Name", "Role", "Active"
  ]);

  var email = String(data.email || "").trim().toLowerCase();
  var password = String(data.password || "");

  if (!email || !password) {
    return jsonResponse({ success: false, error: "Email và mật khẩu không được để trống" });
  }

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase().trim() === email) {
      // Check Active
      if (rows[i][5] !== true && String(rows[i][5]).toUpperCase() !== "TRUE") {
        return jsonResponse({ success: false, error: "Tài khoản đã bị vô hiệu hóa" });
      }
      // Check Password
      if (String(rows[i][2]) !== password) {
        return jsonResponse({ success: false, error: "Mật khẩu không chính xác" });
      }
      // Success
      return jsonResponse({
        success: true,
        user: {
          userId: rows[i][0],
          email: rows[i][1],
          fullName: rows[i][3],
          role: rows[i][4],
          active: true
        }
      });
    }
  }

  return jsonResponse({ success: false, error: "Email không tồn tại trong hệ thống" });
}

/**
 * Kiểm tra quyền — gọi ở đầu mỗi hàm cần bảo vệ.
 * Ném Error nếu không đủ quyền.
 */
function requireRole(userRole, allowedRoles) {
  if (!userRole || allowedRoles.indexOf(userRole) === -1) {
    throw new Error("Bạn không có quyền thực hiện thao tác này (cần: " + allowedRoles.join("/") + ")");
  }
}

// ════════════════════════════════════════════════════════════════
//  MENU (CRUD)
// ════════════════════════════════════════════════════════════════

function handleGetMenu() {
  var sheet = getOrCreateSheet(CONFIG.SHEETS.MENU, [
    "Menu_ID", "Name", "Cat_ID", "Supplier_ID", "Unit_Price",
    "Min_Stock", "Image_URL", "Active", "Size_S_Adj", "Size_L_Adj", "Description"
  ]);

  var catSheet = getOrCreateSheet(CONFIG.SHEETS.CATEGORIES, ["Cat_ID", "Cat_Name", "Description"]);
  var catMap = buildLookupMap(catSheet, 0, 1);

  var rows = sheet.getDataRange().getValues();
  var items = [];

  for (var i = 1; i < rows.length; i++) {
    items.push({
      menuId:      rows[i][0],
      name:        rows[i][1],
      catId:       rows[i][2],
      catName:     catMap[rows[i][2]] || "",
      supplierId:  rows[i][3],
      unitPrice:   rows[i][4],
      minStock:    rows[i][5],
      imageUrl:    rows[i][6],
      active:      rows[i][7] === true || String(rows[i][7]).toUpperCase() === "TRUE",
      sizeS_Adj:   rows[i][8] || -5000,
      sizeL_Adj:   rows[i][9] || 3000,
      description: rows[i][10] || ""
    });
  }

  return jsonResponse({ success: true, items: items });
}

function handleAddMenuItem(data, userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.MENU, [
    "Menu_ID", "Name", "Cat_ID", "Supplier_ID", "Unit_Price",
    "Min_Stock", "Image_URL", "Active", "Size_S_Adj", "Size_L_Adj", "Description"
  ]);

  var menuId = String(data.menuId || "").toLowerCase().trim().replace(/\s+/g, "-");
  if (!menuId || !data.name || !data.unitPrice) {
    return jsonResponse({ success: false, error: "menuId, name, unitPrice là bắt buộc" });
  }

  // Check duplicate
  var existing = findRowByCol(sheet, 0, menuId);
  if (existing > 0) {
    return jsonResponse({ success: false, error: "Menu ID '" + menuId + "' đã tồn tại" });
  }

  sheet.appendRow([
    menuId,
    data.name,
    data.catId || "",
    data.supplierId || "",
    Number(data.unitPrice),
    Number(data.minStock || 0),
    data.imageUrl || "",
    true,
    Number(data.sizeS_Adj || -5000),
    Number(data.sizeL_Adj || 3000),
    data.description || ""
  ]);

  return jsonResponse({ success: true, message: "Thêm món thành công", menuId: menuId });
}

function handleUpdateMenuItem(data, userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.MENU, []);
  var row = findRowByCol(sheet, 0, data.menuId);
  if (row < 0) return jsonResponse({ success: false, error: "Không tìm thấy món: " + data.menuId });

  if (data.name !== undefined)       sheet.getRange(row, 2).setValue(data.name);
  if (data.catId !== undefined)      sheet.getRange(row, 3).setValue(data.catId);
  if (data.supplierId !== undefined) sheet.getRange(row, 4).setValue(data.supplierId);
  if (data.unitPrice !== undefined)  sheet.getRange(row, 5).setValue(Number(data.unitPrice));
  if (data.minStock !== undefined)   sheet.getRange(row, 6).setValue(Number(data.minStock));
  if (data.imageUrl !== undefined)   sheet.getRange(row, 7).setValue(data.imageUrl);
  if (data.active !== undefined)     sheet.getRange(row, 8).setValue(data.active);
  if (data.description !== undefined) sheet.getRange(row, 11).setValue(data.description);

  return jsonResponse({ success: true, message: "Cập nhật thành công" });
}

function handleDeleteMenuItem(data, userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.MENU, []);
  var row = findRowByCol(sheet, 0, data.menuId);
  if (row < 0) return jsonResponse({ success: false, error: "Không tìm thấy món: " + data.menuId });

  sheet.deleteRow(row);
  return jsonResponse({ success: true, message: "Đã xóa món: " + data.menuId });
}

// ════════════════════════════════════════════════════════════════
//  CATEGORIES
// ════════════════════════════════════════════════════════════════

function handleGetCategories() {
  var sheet = getOrCreateSheet(CONFIG.SHEETS.CATEGORIES, ["Cat_ID", "Cat_Name", "Description"]);
  var rows = sheet.getDataRange().getValues();
  var items = [];
  for (var i = 1; i < rows.length; i++) {
    items.push({ catId: rows[i][0], catName: rows[i][1], description: rows[i][2] });
  }
  return jsonResponse({ success: true, items: items });
}

// ════════════════════════════════════════════════════════════════
//  SUPPLIERS
// ════════════════════════════════════════════════════════════════

function handleGetSuppliers(userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.SUPPLIERS, [
    "Supplier_ID", "Name", "Contact", "Phone", "Email"
  ]);
  var rows = sheet.getDataRange().getValues();
  var items = [];
  for (var i = 1; i < rows.length; i++) {
    items.push({
      supplierId: rows[i][0], name: rows[i][1], contact: rows[i][2],
      phone: rows[i][3], email: rows[i][4]
    });
  }
  return jsonResponse({ success: true, items: items });
}

function handleAddSupplier(data, userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.SUPPLIERS, [
    "Supplier_ID", "Name", "Contact", "Phone", "Email"
  ]);

  var suppId = "SUP" + String(sheet.getLastRow()).padStart(3, "0");
  sheet.appendRow([suppId, data.name, data.contact || "", data.phone || "", data.email || ""]);

  return jsonResponse({ success: true, supplierId: suppId });
}

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════

function handleSubmitOrder(data) {
  var sheet = getOrCreateSheet(CONFIG.SHEETS.ORDERS, [
    "Order_ID", "Phone", "Name", "Items_JSON", "Total",
    "Fulfillment", "Status", "Source", "Note", "Timestamp"
  ]);

  var orderId = "CF-" + Date.now().toString(36).toUpperCase();
  var timestamp = formatTimestamp();

  // Serialize items
  var itemsJson = JSON.stringify(data.items || []);
  var itemsSummary = (data.items || []).map(function(i) {
    return (i.name || "?") + " x" + (i.quantity || 1);
  }).join(", ");

  sheet.appendRow([
    orderId,
    data.phone || "",
    data.name || "Khách",
    itemsJson,
    Number(data.totalAmount || 0),
    data.fulfillment || "Unknown",
    data.status || "Pending",
    data.source || "Unknown",
    data.note || "",
    timestamp
  ]);

  // 🔔 MANDATORY: Gửi Telegram thông báo đơn mới
  sendNewOrderTelegram(orderId, data.name, data.phone, itemsSummary, data.totalAmount, timestamp);

  // Gửi Email cảnh báo (backup)
  sendNewOrderEmail(orderId, data.name, data.phone, itemsSummary, data.totalAmount, timestamp);

  return jsonResponse({ success: true, orderId: orderId, message: "Đặt hàng thành công" });
}

function handleGetOrders(userRole) {
  requireRole(userRole, ["admin", "staff"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.ORDERS, []);
  var rows = sheet.getDataRange().getValues();
  var orders = [];

  for (var i = rows.length - 1; i >= 1; i--) {
    var itemsParsed = [];
    try { itemsParsed = JSON.parse(rows[i][3]); } catch(e) {}

    orders.push({
      orderId:     rows[i][0],
      phone:       rows[i][1],
      name:        rows[i][2],
      items:       itemsParsed,
      itemsRaw:    rows[i][3],
      total:       rows[i][4],
      fulfillment: rows[i][5],
      status:      rows[i][6],
      source:      rows[i][7],
      note:        rows[i][8],
      timestamp:   rows[i][9]
    });
  }

  return jsonResponse({ success: true, orders: orders });
}

function handleUpdateOrderStatus(data, userRole) {
  requireRole(userRole, ["admin", "staff"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.ORDERS, []);
  var row = findRowByCol(sheet, 0, data.orderId);
  if (row < 0) return jsonResponse({ success: false, error: "Đơn hàng không tồn tại" });

  sheet.getRange(row, 7).setValue(data.status); // Cột Status (G)
  return jsonResponse({ success: true, message: "Cập nhật trạng thái → " + data.status });
}

// ════════════════════════════════════════════════════════════════
//  STOCK — REALTIME CALCULATION
//  Stock = Σ(Restock qty) − Σ(Orders qty sold)
// ════════════════════════════════════════════════════════════════

function handleGetStock() {
  var menuSheet = getOrCreateSheet(CONFIG.SHEETS.MENU, []);
  var restockSheet = getOrCreateSheet(CONFIG.SHEETS.RESTOCK, [
    "Restock_ID", "Menu_ID", "Quantity", "Supplier_ID", "Note", "Created_By", "Timestamp"
  ]);
  var orderSheet = getOrCreateSheet(CONFIG.SHEETS.ORDERS, []);

  var menuRows = menuSheet.getDataRange().getValues();
  var restockRows = restockSheet.getDataRange().getValues();
  var orderRows = orderSheet.getDataRange().getValues();

  // 1. Tính tổng nhập (Restock)
  var restockMap = {};
  for (var r = 1; r < restockRows.length; r++) {
    var rid = String(restockRows[r][1]).toLowerCase().trim();
    restockMap[rid] = (restockMap[rid] || 0) + Number(restockRows[r][2] || 0);
  }

  // 2. Tính tổng xuất (Orders sold)
  var soldMap = {};
  for (var o = 1; o < orderRows.length; o++) {
    var status = String(orderRows[o][6]).toLowerCase();
    if (status === "cancelled") continue; // Đơn bị hủy không tính

    try {
      var items = JSON.parse(orderRows[o][3]);
      for (var j = 0; j < items.length; j++) {
        // Tìm menuId từ item — có thể nằm ở item.menuId hoặc cần normalize từ item.id
        var mId = String(items[j].menuId || items[j].id || "").toLowerCase().replace(/-[SML]-\d+$/, "");
        if (mId) {
          soldMap[mId] = (soldMap[mId] || 0) + Number(items[j].quantity || 1);
        }
      }
    } catch(e) {}
  }

  // 3. Tính stock cho từng menu item
  var stockList = [];
  for (var m = 1; m < menuRows.length; m++) {
    var menuId = String(menuRows[m][0]).toLowerCase().trim();
    var totalIn  = restockMap[menuId] || 0;
    var totalOut = soldMap[menuId] || 0;
    var currentStock = totalIn - totalOut;
    var minStock = Number(menuRows[m][5] || 0);

    var stockStatus = "ok";
    if (currentStock <= 0) stockStatus = "out_of_stock";
    else if (currentStock <= minStock) stockStatus = "critical";
    else if (currentStock <= minStock * 1.5) stockStatus = "low";

    stockList.push({
      menuId:       menuId,
      name:         menuRows[m][1],
      currentStock: currentStock,
      minStock:     minStock,
      totalIn:      totalIn,
      totalOut:     totalOut,
      status:       stockStatus
    });
  }

  return jsonResponse({ success: true, stock: stockList });
}

/**
 * Check stock cho 1 item cụ thể — gọi bởi AI Chatbot trước khi suggest
 */
function handleCheckItemStock(data) {
  var menuId = String(data.menuId || "").toLowerCase().trim();
  if (!menuId) return jsonResponse({ success: false, error: "menuId is required" });

  var stockResult = JSON.parse(handleGetStock().getContent());
  var item = null;

  for (var i = 0; i < stockResult.stock.length; i++) {
    if (stockResult.stock[i].menuId === menuId) {
      item = stockResult.stock[i];
      break;
    }
  }

  if (!item) return jsonResponse({ success: true, available: true, stock: 999, message: "Không theo dõi tồn kho" });

  return jsonResponse({
    success: true,
    available: item.currentStock > 0,
    stock: item.currentStock,
    status: item.status,
    message: item.currentStock <= 0
      ? item.name + " hiện tạm hết hàng"
      : item.name + " còn " + item.currentStock + " phần"
  });
}

function handleRestock(data, userRole) {
  requireRole(userRole, ["admin", "staff"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.RESTOCK, [
    "Restock_ID", "Menu_ID", "Quantity", "Supplier_ID", "Note", "Created_By", "Timestamp"
  ]);

  var restockId = "RS-" + Date.now().toString(36).toUpperCase();
  var timestamp = formatTimestamp();

  sheet.appendRow([
    restockId,
    data.menuId,
    Number(data.quantity),
    data.supplierId || "",
    data.note || "",
    data.createdBy || "staff",
    timestamp
  ]);

  return jsonResponse({ success: true, restockId: restockId, message: "Nhập kho thành công" });
}

// ════════════════════════════════════════════════════════════════
//  LEADS (Upsert by Phone)
// ════════════════════════════════════════════════════════════════

function handleSaveLead(data) {
  // Reuse existing Customers sheet if it exists, or create as part of Orders workflow
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Customers");

  if (!sheet) {
    sheet = ss.insertSheet("Customers");
    sheet.appendRow(["SĐT", "Tên", "Địa chỉ", "SessionID", "Lịch sử chat", "Timestamp", "Món quan tâm", "Mức độ Hot"]);
    formatHeader(sheet, 8);
  }

  var phone = String(data.phone || "").trim();
  if (!phone) return jsonResponse({ success: false, error: "Phone is required" });

  var timestamp = formatTimestamp();
  var existingRow = findRowByCol(sheet, 0, phone);

  if (existingRow > 0) {
    if (data.name)     sheet.getRange(existingRow, 2).setValue(data.name);
    if (data.address)  sheet.getRange(existingRow, 3).setValue(data.address);
    if (data.sessionId) sheet.getRange(existingRow, 4).setValue(data.sessionId);

    var oldHistory = sheet.getRange(existingRow, 5).getValue() || "";
    var sep = oldHistory ? "\n---\n" : "";
    sheet.getRange(existingRow, 5).setValue(oldHistory + sep + (data.chatHistory || "") + " [" + timestamp + "]");
    sheet.getRange(existingRow, 6).setValue(timestamp);

    if (data.favorite_item) sheet.getRange(existingRow, 7).setValue(data.favorite_item);
    if (data.intent_level)  sheet.getRange(existingRow, 8).setValue(data.intent_level);
  } else {
    sheet.appendRow([
      phone, data.name || "", data.address || "", data.sessionId || "",
      (data.chatHistory || "") + " [" + timestamp + "]", timestamp,
      data.favorite_item || "", data.intent_level || ""
    ]);
  }

  if (data.intent_level === "hot") {
    sendHotLeadEmail(data, timestamp);
  }

  return jsonResponse({ success: true, message: "Lead saved" });
}

// ════════════════════════════════════════════════════════════════
//  USERS (Admin CRUD)
// ════════════════════════════════════════════════════════════════

function handleGetUsers(userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.USERS, []);
  var rows = sheet.getDataRange().getValues();
  var users = [];

  for (var i = 1; i < rows.length; i++) {
    users.push({
      userId: rows[i][0], email: rows[i][1], fullName: rows[i][3],
      role: rows[i][4], active: rows[i][5] === true || String(rows[i][5]).toUpperCase() === "TRUE"
    });
  }

  return jsonResponse({ success: true, users: users });
}

function handleAddUser(data, userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.USERS, []);
  var userId = "U" + String(sheet.getLastRow()).padStart(3, "0");

  sheet.appendRow([
    userId,
    data.email,
    data.password || "123456",
    data.fullName || "",
    data.role || "staff",
    true
  ]);

  return jsonResponse({ success: true, userId: userId });
}

function handleUpdateUser(data, userRole) {
  requireRole(userRole, ["admin"]);

  var sheet = getOrCreateSheet(CONFIG.SHEETS.USERS, []);
  var row = findRowByCol(sheet, 0, data.userId);
  if (row < 0) return jsonResponse({ success: false, error: "User không tồn tại" });

  if (data.fullName !== undefined) sheet.getRange(row, 4).setValue(data.fullName);
  if (data.role !== undefined)     sheet.getRange(row, 5).setValue(data.role);
  if (data.active !== undefined)   sheet.getRange(row, 6).setValue(data.active);
  if (data.password !== undefined) sheet.getRange(row, 3).setValue(data.password);

  return jsonResponse({ success: true, message: "Cập nhật user thành công" });
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD (Aggregated Stats)
// ════════════════════════════════════════════════════════════════

function handleGetDashboard(userRole) {
  requireRole(userRole, ["admin", "staff"]);

  var orderSheet = getOrCreateSheet(CONFIG.SHEETS.ORDERS, []);
  var orderRows = orderSheet.getDataRange().getValues();

  var today = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
  var ordersToday = 0;
  var revenueToday = 0;
  var totalOrders = orderRows.length - 1;
  var totalRevenue = 0;
  var categoryRevenue = {};
  var itemSales = {};

  for (var i = 1; i < orderRows.length; i++) {
    var status = String(orderRows[i][6]).toLowerCase();
    if (status === "cancelled") continue;

    var orderTotal = Number(orderRows[i][4] || 0);
    totalRevenue += orderTotal;

    // Check nếu là hôm nay
    var orderDate = String(orderRows[i][9] || "");
    if (orderDate.indexOf(today) === 0) {
      ordersToday++;
      revenueToday += orderTotal;
    }

    // Parse items cho biểu đồ
    try {
      var items = JSON.parse(orderRows[i][3]);
      for (var j = 0; j < items.length; j++) {
        var itemName = items[j].name || "Unknown";
        var qty = Number(items[j].quantity || 1);
        itemSales[itemName] = (itemSales[itemName] || 0) + qty;
      }
    } catch(e) {}
  }

  // Stock alerts count
  var stockResult = JSON.parse(handleGetStock().getContent());
  var lowStockCount = 0;
  for (var s = 0; s < stockResult.stock.length; s++) {
    if (stockResult.stock[s].status === "critical" || stockResult.stock[s].status === "out_of_stock") {
      lowStockCount++;
    }
  }

  // Top 5 items
  var sortedItems = Object.keys(itemSales).map(function(k) {
    return { name: k, sold: itemSales[k] };
  }).sort(function(a, b) { return b.sold - a.sold; }).slice(0, 5);

  // Dữ liệu chỉ admin thấy
  var adminData = {};
  if (userRole === "admin") {
    adminData = {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders
    };
  }

  return jsonResponse({
    success: true,
    dashboard: {
      ordersToday: ordersToday,
      revenueToday: revenueToday,
      lowStockCount: lowStockCount,
      topItems: sortedItems,
      stockAlerts: stockResult.stock.filter(function(s) {
        return s.status === "critical" || s.status === "out_of_stock";
      }),
      admin: adminData
    }
  });
}

// ════════════════════════════════════════════════════════════════
//  TELEGRAM ALERTS (Mandatory: New Order)
// ════════════════════════════════════════════════════════════════

function sendNewOrderTelegram(orderId, name, phone, items, total, timestamp) {
  if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.TELEGRAM_CHAT_ID) return;

  try {
    var totalFormatted = Number(total || 0).toLocaleString("vi-VN");
    var message = [
      "🔔 *ĐƠN HÀNG MỚI*",
      "",
      "📋 Mã: `" + orderId + "`",
      "👤 " + (name || "Khách") + " — " + (phone || "N/A"),
      "🧾 " + items,
      "💰 *" + totalFormatted + " VND*",
      "⏰ " + timestamp,
      "",
      "→ Mở Dashboard để xác nhận đơn!"
    ].join("\n");

    var url = "https://api.telegram.org/bot" + CONFIG.TELEGRAM_BOT_TOKEN + "/sendMessage";

    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: CONFIG.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      }),
      muteHttpExceptions: true
    });
  } catch (err) {
    console.error("Telegram alert failed:", err);
  }
}

// ════════════════════════════════════════════════════════════════
//  EMAIL ALERTS
// ════════════════════════════════════════════════════════════════

function sendNewOrderEmail(orderId, name, phone, items, total, timestamp) {
  try {
    if (!CONFIG.ALERT_EMAIL) return;
    var totalFormatted = Number(total || 0).toLocaleString("vi-VN");

    var subject = "🔔 [Cof fi] Đơn hàng mới: " + orderId;
    var body = [
      "═══════════════════════════════════════",
      "  🔔 ĐƠN HÀNG MỚI — Cof fi",
      "═══════════════════════════════════════",
      "",
      "📋 Mã đơn:     " + orderId,
      "👤 Khách:       " + (name || "Khách") + " — " + (phone || "N/A"),
      "🧾 Món:         " + items,
      "💰 Tổng tiền:   " + totalFormatted + " VND",
      "⏰ Thời gian:   " + timestamp,
      "",
      "→ Mở Dashboard để xác nhận đơn!",
      "",
      "Email tự động từ hệ thống Cof fi AI."
    ].join("\n");

    MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
  } catch (err) {
    console.error("Order email failed:", err);
  }
}

function sendHotLeadEmail(data, timestamp) {
  try {
    if (!CONFIG.ALERT_EMAIL) return;

    var subject = "🔥 [Cof fi] Hot Lead: " + (data.name || "Khách") + " - " + data.phone;
    var body = [
      "═══════════════════════════════════════",
      "  🔥 HOT LEAD ALERT — Cof fi",
      "═══════════════════════════════════════",
      "",
      "📞 SĐT:          " + data.phone,
      "👤 Tên:           " + (data.name || "Chưa rõ"),
      "📍 Địa chỉ:       " + (data.address || "Chưa có"),
      "☕ Món quan tâm:   " + (data.favorite_item || "Chưa xác định"),
      "🔥 Mức độ:        HOT",
      "⏰ Thời gian:     " + timestamp,
      "",
      "→ Liên hệ NGAY để chốt đơn!",
      "",
      "Email tự động từ hệ thống Cof fi AI."
    ].join("\n");

    MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
  } catch (err) {
    console.error("Hot lead email failed:", err);
  }
}

// ════════════════════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════════════════════

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet && headers && headers.length > 0) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    formatHeader(sheet, headers.length);
  }

  return sheet || ss.insertSheet(name);
}

function formatHeader(sheet, colCount) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1a1a2e");
  headerRange.setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}

function findRowByCol(sheet, colIndex, value) {
  var data = sheet.getDataRange().getValues();
  var target = String(value).toLowerCase().trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colIndex]).toLowerCase().trim() === target) {
      return i + 1;
    }
  }
  return -1;
}

function buildLookupMap(sheet, keyCol, valueCol) {
  var data = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < data.length; i++) {
    map[data[i][keyCol]] = data[i][valueCol];
  }
  return map;
}

function formatTimestamp() {
  return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
