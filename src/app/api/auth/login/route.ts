import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "";
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

    const gasResponse = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        apiSecret: GAS_SECRET,
        action: "CHECK_LOGIN",
        data: { email, password }
      })
    });

    const result = await gasResponse.json();

    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        user: result.user
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || "Đăng nhập thất bại" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
