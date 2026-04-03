import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbwXj-jGVVjYQyTED2I-gSiV5fMGfDHIs5-fOEqn-ALOAQqSQ2NmXnIWklBZhlpMK1mEAw/exec";
const GAS_SECRET = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SECRET || "coffi-2026-xyz";

/**
 * Generic proxy cho tất cả GAS admin actions.
 * Frontend gửi { action, data, userRole } → route proxy → GAS
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data, userRole } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    const payload = JSON.stringify({
      apiSecret: GAS_SECRET,
      action: action,
      data: data || {},
      userRole: userRole || ""
    });

    const gasResponse = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: payload
    });

    const rawText = await gasResponse.text();
    let result;
    try {
      result = JSON.parse(rawText);

      // Fix legacy Orders data where Items_JSON column was missing, causing a left-shift
      if (action === "GET_ORDERS" && result.success && Array.isArray(result.orders)) {
        result.orders = result.orders.map((order: any) => {
          if (typeof order.itemsRaw === "number" || (typeof order.total === "string" && isNaN(Number(order.total)))) {
            // Data is shifted.
            return {
              ...order,
              items: [],
              itemsRaw: "[]",
              total: typeof order.itemsRaw === "number" ? order.itemsRaw : Number(order.itemsRaw),
              fulfillment: String(order.total),
              status: String(order.fulfillment),
              source: order.status ? String(order.status) : (order.source ? String(order.source) : "Manual"),
              note: "", // Note usually lost in this shift
              timestamp: order.note ? String(order.note) : String(order.timestamp || "")
            };
          }
          return order;
        });
      }

    } catch {
      console.error("[ADMIN API] Invalid JSON from GAS:", rawText.slice(0, 300));
      return NextResponse.json({ success: false, error: "Backend trả về dữ liệu không hợp lệ" }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
