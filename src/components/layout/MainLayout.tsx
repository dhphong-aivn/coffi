"use client";

import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { ViewManager } from "./ViewManager";
import { ChatWindow } from "./ChatWindow";
import { useAppStore } from "@/store/useAppStore";
import { MessageCircle } from "lucide-react";

export function MainLayout() {
  const { isCartCollapsed, isChatOpen, toggleChat } = useAppStore();

  return (
    <div className="bg-background text-on-surface min-h-screen flex overflow-hidden relative">
      <LeftSidebar />
      <main className="flex-1 overflow-y-auto px-12 py-10 bg-background relative transition-all duration-500">
        <ViewManager />
      </main>
      <RightSidebar />

      {/* Chat Window */}
      <ChatWindow />

      {/* Floating Chatbot Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-8 z-[60] w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-500 flex items-center justify-center cursor-pointer group ${
          isCartCollapsed ? "right-8" : "right-[450px]"
        } ${
          isChatOpen
            ? "bg-error text-white rotate-0"
            : "bg-primary text-on-primary"
        }`}
      >
        {isChatOpen ? (
          <span className="text-xl font-bold group-hover:scale-110 transition-transform duration-300">✕</span>
        ) : (
          <MessageCircle size={28} className="group-hover:scale-110 transition-transform duration-300" />
        )}
      </button>
    </div>
  );
}
