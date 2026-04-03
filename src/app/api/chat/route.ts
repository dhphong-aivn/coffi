import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Khởi tạo SDK OpenAI chính thức với Base URL tùy chỉnh và API Key của người dùng cung cấp
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || "",
  baseURL: process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1",
});

// Cache nội dung System Prompt để không đọc file IO trên mỗi request
let cachedSystemPrompt: string | null = null;

function getSystemPrompt() {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  let kb = "";
  try {
    const filePath = join(process.cwd(), "src", "data", "chatbot_data.txt");
    if (existsSync(filePath)) {
      kb = readFileSync(filePath, "utf-8");
    }
  } catch (err) {
    console.error("Lỗi khi đọc file chatbot_data.txt", err);
  }

  // Tách biệt cấu trúc và dữ liệu động (áp dụng nguyên tắc tương tự RAG sau này dễ thay đổi)
  cachedSystemPrompt = `Vai trò: Bạn là AI trợ lý độc quyền cho chuyên gia và khách hàng tại Cof fi.
Chỉ được trả lời dựa trên Knowledge Base bên dưới. Không bịa đặt (hallucinate).
Luôn tuân thủ nguyên tắc:
1. Chào hỏi thân thiện (tự nhiên).
2. Trả lời rõ ràng, đúng vào trọng tâm câu hỏi. Định dạng bằng Markdown (in đậm, gạch đầu dòng) để giao diện hiển thị đẹp.
3. Kết thúc bằng lời mời/hỏi xem khách cần hỗ trợ thêm gì không.
4. [QUAN TRỌNG] Nếu câu hỏi ngoài phạm vi (xin code, chính trị, chuyện phiếm không liên quan), từ chối nhẹ nhàng và hướng dẫn khách liên hệ Hotline/Zalo.
5. ĐỂ LƯU KHÁCH HÀNG: Khi khách cung cấp Số Điện Thoại (bắt buộc) và Tên, hãy đánh giá khả năng chốt đơn (intent_level: "hot" nếu muốn chốt gấp/hỏi sâu, "warm" nếu đang xem, "cold" nếu chỉ xem mập mờ) và món ăn đồ uống khách quan tâm nhất (favorite_item). Sau đó chèn thẻ sau vào cuối câu: \`||LEAD_DATA: {"name":"Tên khách", "phone":"SĐT khách", "address":"Địa chỉ nếu có", "intent_level":"hot/warm/cold", "favorite_item":"Tên món"}||\`
6. ĐỂ THÊM VÀO GIỎ HÀNG: Khi khách muốn gọi món, hãy chèn thẻ sau vào cuối câu: \`||ADD_TO_CART: {"menuId":"<slug>", "size":"S/M/L", "qty": 1}||\`
   DANH SÁCH menuId HỢP LỆ (BẮT BUỘC dùng chính xác, KHÔNG bịa): macchiato, cappuccino, espresso, single-origin-pour-over, vietnamese-iced-coffee, iced-chocolate, matcha-latte, peach-tea, butter-croissant, cheesecake, mixed-nuts, potato-wedges.
7. ĐỂ CHỐT ĐƠN: Khi khách đồng ý đặt hàng, hãy chèn thẻ sau vào cuối câu: \`||CHECKOUT_DATA||\`

[Knowledge Base Context]:
${kb}`;

  return cachedSystemPrompt;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array", status: 400 });
    }

    const systemMessage = {
      role: "system" as const,
      content: getSystemPrompt()
    };

    // Chuẩn bị payload: System Prompt -> Lịch sử Chat -> Câu hỏi hiện tại
    const payloadMessages = [
      systemMessage,
      ...messages.map((m: any) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: String(m.text || "")
      }))
    ];

    // Khởi tạo streaming với OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.LLM_MODEL_NAME || process.env.LLM_MODEL || "google/gemini-2.5-flash", // Hỗ trợ Model động từ OpenRouter
      messages: payloadMessages,
      stream: true,
    });

    // Parse stream chunks thủ công bằng Web Streams API để trả dần về Frontend
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}
