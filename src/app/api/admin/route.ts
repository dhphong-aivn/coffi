import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "";
const GAS_SECRET = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SECRET || "coffi-2026-xyz";

/**
 * Generic proxy cho tất cả GAS admin actions.
 * Frontend gửi { action, data, userRole } → route proxy → GAS
 * Đảm bảo GAS_SECRET không lộ ra client.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data, userRole } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    const gasResponse = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        apiSecret: GAS_SECRET,
        action: action,
        data: data || {},
        userRole: userRole || ""
      })
    });

    const result = await gasResponse.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
