"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface ChatMessage {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    text: "Hello! Welcome to Cof fi ☕ How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

export function ChatWindow() {
  const { isChatOpen, setChatOpen, isCartCollapsed } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isChatOpen) return null;

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Bot auto-reply
    setTimeout(() => {
      const botReplies = [
        "Thanks for your message! Our team will get back to you shortly.",
        "Would you like to see our today's specials? We have a great Matcha Latte!",
        "You can track your order in the 'My Orders' section on the left sidebar.",
        "Our store is open from 7:00 AM to 10:00 PM. Feel free to visit us anytime!",
        "For delivery, we offer free shipping on orders over 200.000 VND!",
      ];
      const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: randomReply,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`fixed bottom-24 z-[70] w-[380px] h-[520px] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
        isCartCollapsed ? "right-8" : "right-[450px]"
      }`}
    >
      {/* Header */}
      <div className="bg-primary-container px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h4 className="font-headline text-white text-base font-bold">Cof fi Assistant</h4>
            <p className="text-white/70 text-xs font-body">Online</p>
          </div>
        </div>
        <button
          onClick={() => setChatOpen(false)}
          className="text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X size={22} />
        </button>
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
              className={`max-w-[75%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                msg.sender === "bot"
                  ? "bg-surface-container text-on-surface rounded-bl-md"
                  : "bg-primary-container text-white rounded-br-md"
              }`}
            >
              {msg.text}
              <p
                className={`text-[10px] mt-1 ${
                  msg.sender === "bot" ? "text-secondary/50" : "text-white/60"
                }`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-surface-container border-t border-outline-variant/10 flex-shrink-0">
        <div className="flex items-center gap-2 bg-surface-container-highest rounded-xl px-4 py-2">
          <input
            className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/50"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              inputValue.trim()
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
