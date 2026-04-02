export const GAS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbwXj-jGVVjYQyTED2I-gSiV5fMGfDHIs5-fOEqn-ALOAQqSQ2NmXnIWklBZhlpMK1mEAw/exec";
export const GAS_SECRET = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SECRET || "coffi-2026-xyz";

export interface LeadData {
  phone: string;
  name?: string;
  address?: string;
  sessionId?: string;
  chatHistory?: string;
  intent_level?: string;
  favorite_item?: string;
}

export interface OrderData {
  phone: string;
  name: string;
  totalAmount: number;
  fulfillment: string;
  status: string;
  note: string;
  source: string;
  items: any[];
}

export const orderService = {
  async saveLead(data: LeadData) {
    try {
      const response = await fetch(GAS_URL, {
        method: "POST",
        // Chú ý: Trình duyệt có thể yêu cầu mode 'no-cors' nhưng như vậy không lấy được response JSON.
        // Google Apps Script hỗ trợ POST trực tiếp nếu ko có header phức tạp, nên ta thử 'text/plain' 
        headers: {
          "Content-Type": "text/plain", // GAS thường yêu cầu cái này để tránh lỗi preflight CORS OPTIONS
        },
        body: JSON.stringify({
          apiSecret: GAS_SECRET,
          action: "SAVE_LEAD",
          data: data
        })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error saving lead:", error);
      throw error;
    }
  },

  async submitOrder(data: OrderData) {
    try {
      const response = await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          apiSecret: GAS_SECRET,
          action: "SUBMIT_ORDER",
          data: data
        })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error submitting order:", error);
      throw error;
    }
  }
};
