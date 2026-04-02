"use client";

import { Phone, MessageCircle, MessageSquare } from "lucide-react";

export function SupportView() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h2 className="font-headline text-4xl text-primary-container mb-8">Customer Support</h2>
      
      <div className="space-y-6 pb-4">
        <a href="tel:19001234" className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm flex items-center gap-6 hover:shadow-lg transition-shadow cursor-pointer block group">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Phone className="text-emerald-700" size={28} />
          </div>
          <div>
            <h3 className="font-headline text-xl text-primary-container">Call Hotline directly</h3>
            <p className="text-secondary text-sm mt-1">1900 1234 — Toll-free call</p>
          </div>
        </a>

        <a href="https://zalo.me/0901234567" target="_blank" rel="noreferrer" className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm flex items-center gap-6 hover:shadow-lg transition-shadow cursor-pointer block group">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <MessageCircle className="text-blue-700" size={28} />
          </div>
          <div>
            <h3 className="font-headline text-xl text-primary-container">Message via Zalo</h3>
            <p className="text-secondary text-sm mt-1">Detailed advice, send proof images</p>
          </div>
        </a>

        <a href="https://m.me/coffi" target="_blank" rel="noreferrer" className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm flex items-center gap-6 hover:shadow-lg transition-shadow cursor-pointer block group">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
             <MessageSquare className="text-purple-700" size={28} />
          </div>
          <div>
            <h3 className="font-headline text-xl text-primary-container">Chat via Messenger</h3>
            <p className="text-secondary text-sm mt-1">Connect with Facebook Messenger</p>
          </div>
        </a>
      </div>
      
      <p className="text-center text-secondary/50 text-sm mt-4">Support every day from 07:00 - 22:00</p>
    </div>
  );
}
