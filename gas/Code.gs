/**
 * ============================================================
 *  Cof fi — Google Apps Script Backend
 *  Version: 2.0 (Lead + Order + Hot Email Alert)
 * ============================================================
 *
 *  HƯỚNG DẪN TRIỂN KHAI:
 *  1. Mở Google Sheets → Extensions → Apps Script
 *  2. Xóa nội dung mặc định, dán toàn bộ file này
 *  3. Đổi CONFIG.ALERT_EMAIL thành email thật
 *  4. Deploy → New Deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy URL → dán vào file .env.local:
 *     NEXT_PUBLIC_GOOGLE_SHEETS_URL=<URL>
 *
 *  SHEETS TỰ ĐỘNG TẠO:
 *  - "Customers": Lưu Lead, gộp theo SĐT (Primary Key)
 *  - "Orders": Lưu đơn hàng
 * ============================================================
 */

// ─── CONFIG ─────────────────────────────────────────────────
var CONFIG = {
  API_SECRET: "coffi-2026-xyz",
  CUSTOMER_SHEET: "Customers",
  ORDER_SHEET: "Orders",
  ALERT_EMAIL: "your-email@gmail.com" // ← THAY BẰNG EMAIL THẬT
};

// ─── MAIN ENTRY ─────────────────────────────────────────────

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Xác thực API Secret
    if (payload.apiSecret !== CONFIG.API_SECRET) {
      return jsonResponse({ success: false, error: "Unauthorized" });
    }

    switch (payload.action) {
      case "SAVE_LEAD":
        return handleSaveLead(payload.data);
      case "SUBMIT_ORDER":
        return handleSubmitOrder(payload.data);
      default:
        return jsonResponse({ success: false, error: "Unknown action: " + payload.action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ status: "ok", service: "Cof fi Backend v2.0" });
}

// ─── SAVE LEAD (Upsert by Phone) ───────────────────────────

function handleSaveLead(data) {
  var sheet = getOrCreateSheet(CONFIG.CUSTOMER_SHEET, [
    "SĐT", "Tên", "Địa chỉ", "SessionID",
    "Lịch sử chat", "Timestamp", "Món quan tâm", "Mức độ Hot"
  ]);

  var phone = String(data.phone || "").trim();
  if (!phone) {
    return jsonResponse({ success: false, error: "Phone is required" });
  }

  var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

  // Tìm dòng có SĐT trùng (deduplication)
  var existingRow = findRowByPhone(sheet, phone);

  if (existingRow > 0) {
    // ── MERGE: Cập nhật dòng cũ ──
    if (data.name) sheet.getRange(existingRow, 2).setValue(data.name);
    if (data.address) sheet.getRange(existingRow, 3).setValue(data.address);
    if (data.sessionId) sheet.getRange(existingRow, 4).setValue(data.sessionId);

    // Gộp lịch sử chat (append, không ghi đè)
    var oldHistory = sheet.getRange(existingRow, 5).getValue() || "";
    var separator = oldHistory ? "\n---\n" : "";
    var newEntry = (data.chatHistory || "") + " [" + timestamp + "]";
    sheet.getRange(existingRow, 5).setValue(oldHistory + separator + newEntry);

    sheet.getRange(existingRow, 6).setValue(timestamp);
    if (data.favorite_item) sheet.getRange(existingRow, 7).setValue(data.favorite_item);
    if (data.intent_level) sheet.getRange(existingRow, 8).setValue(data.intent_level);
  } else {
    // ── INSERT: Dòng mới ──
    sheet.appendRow([
      phone,
      data.name || "",
      data.address || "",
      data.sessionId || "",
      (data.chatHistory || "") + " [" + timestamp + "]",
      timestamp,
      data.favorite_item || "",
      data.intent_level || ""
    ]);
  }

  // Gửi Email cảnh báo nếu Lead HOT
  if (data.intent_level === "hot") {
    sendHotLeadAlert(data, timestamp);
  }

  return jsonResponse({ success: true, message: "Lead saved", phone: phone });
}

// ─── SUBMIT ORDER ───────────────────────────────────────────

function handleSubmitOrder(data) {
  var sheet = getOrCreateSheet(CONFIG.ORDER_SHEET, [
    "Mã đơn", "SĐT", "Tên khách", "Tổng tiền",
    "Hình thức", "Trạng thái", "Ghi chú", "Nguồn",
    "Chi tiết món", "Timestamp"
  ]);

  var orderId = "CF-" + Date.now().toString(36).toUpperCase();
  var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

  // Chuỗi chi tiết món: "Cappuccino x2, Cheesecake x1"
  var itemsStr = (data.items || []).map(function(item) {
    return (item.name || "?") + " x" + (item.quantity || 1);
  }).join(", ");

  // Format tiền VND
  var totalFormatted = Number(data.totalAmount || 0).toLocaleString("vi-VN");

  sheet.appendRow([
    orderId,
    data.phone || "",
    data.name || "Khách",
    data.totalAmount || 0,
    data.fulfillment || "Unknown",
    data.status || "Pending",
    data.note || "",
    data.source || "Unknown",
    itemsStr,
    timestamp
  ]);

  return jsonResponse({
    success: true,
    orderId: orderId,
    message: "Order submitted",
    total: totalFormatted + " VND"
  });
}

// ─── HOT LEAD EMAIL ALERT ───────────────────────────────────

function sendHotLeadAlert(data, timestamp) {
  try {
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
      "───────────────────────────────────────",
      "→ Liên hệ NGAY để chốt đơn!",
      "───────────────────────────────────────",
      "",
      "Email tự động từ hệ thống Cof fi AI."
    ].join("\n");

    MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
  } catch (err) {
    console.error("sendHotLeadAlert failed:", err);
  }
}

// ─── UTILITIES ──────────────────────────────────────────────

/**
 * Tìm dòng theo SĐT (cột A). Trả về row number (1-indexed) hoặc -1 nếu không tìm thấy.
 */
function findRowByPhone(sheet, phone) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === phone) {
      return i + 1; // Sheet row = array index + 1
    }
  }
  return -1;
}

/**
 * Lấy hoặc tạo sheet với header mặc định.
 */
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);

    // Format header: Bold + freeze
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#F3F4F6");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Trả JSON response cho client.
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
