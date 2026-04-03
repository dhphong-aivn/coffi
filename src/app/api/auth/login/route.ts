import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbwXj-jGVVjYQyTED2I-gSiV5fMGfDHIs5-fOEqn-ALOAQqSQ2NmXnIWklBZhlpMK1mEAw/exec";
const GAS_SECRET = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SECRET || "coffi-2026-xyz";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      apiSecret: GAS_SECRET,
      action: "CHECK_LOGIN",
      data: { email, password }
    });

    // Native fetch tự động xử lý redirect đúng cách (chuyển 302 sang GET để lấy kết quả)
    // Đây là behavior chuẩn của Google Apps Script Web App
    const gasResponse = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: payload
    });

    const rawText = await gasResponse.text();
    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error("[LOGIN] Invalid JSON from GAS:", rawText.slice(0, 300));
      return NextResponse.json(
        { success: false, error: "Backend trả về dữ liệu không hợp lệ" },
        { status: 502 }
      );
    }

    if (result.success && result.user) {
      return NextResponse.json({ success: true, user: result.user });
    }

    return NextResponse.json(
      { success: false, error: result.error || "Đăng nhập thất bại" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("[LOGIN] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}
