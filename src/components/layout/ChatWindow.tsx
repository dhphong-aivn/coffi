"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, User, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 1,
  text: "Xin chào! Chào mừng đến **Cof fi** ☕\n\nTôi có thể giúp gì cho bạn hôm nay?",
  sender: "bot",
  timestamp: new Date(),
};

export function ChatWindow() {
  const { isChatOpen, setChatOpen, isCartCollapsed } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  if (!isChatOpen) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setMessages([]);

    setTimeout(() => {
      setMessages([{ ...WELCOME_MESSAGE, id: Date.now(), timestamp: new Date() }]);
      setIsRefreshing(false);
    }, 500);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const botMessageId = Date.now() + 1;
    // Thêm một tin nhắn rỗng từ bot để chuẩn bị nhận Streaming
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

    try {
      // Gộp state hiện tại và tin nhắn vừa thêm làm history gửi lên server
      const conversation = [...messages, userMessage];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });

      if (!res.ok) throw new Error("API Error");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let botResponseText = "";

      setIsTyping(false); // Xóa trạng thái typing indicator khi bắt đầu stream

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          botResponseText += chunk;
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: botResponseText }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: "**Lỗi hệ thống.** 9Router hiện không phản hồi, vui lòng thử lại sau." }
            : msg
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`fixed bottom-24 z-[70] w-[380px] h-[520px] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
        isCartCollapsed ? "right-8" : "right-[450px]"
      }`}
    >
      {/* Header */}
      <div className="bg-primary-container px-5 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h4 className="font-headline text-white text-base font-bold">Cof fi Assistant</h4>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-white/70 text-xs font-body">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Reset conversation"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-surface-container-lowest">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === "bot"
                  ? "bg-primary-container/10 text-primary-container"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {msg.sender === "bot" ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "bot"
                  ? "bg-surface-container text-on-surface rounded-bl-md"
                  : "bg-primary-container text-white rounded-br-md"
              }`}
            >
              {msg.sender === "bot" ? (
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <span className="font-body">{msg.text}</span>
              )}
              <p
                className={`text-[10px] mt-1.5 ${
                  msg.sender === "bot" ? "text-secondary/50" : "text-white/60"
                }`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-container/10 text-primary-container">
              <Bot size={14} />
            </div>
            <div className="bg-surface-container px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-secondary/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-surface-container border-t border-outline-variant/10 flex-shrink-0">
        <div className="flex items-center gap-2 bg-surface-container-highest rounded-xl px-4 py-2">
          <input
            className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/50"
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              inputValue.trim() && !isTyping
                ? "bg-primary-container text-white hover:bg-primary active:scale-90"
                : "bg-surface-container text-secondary/40 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
