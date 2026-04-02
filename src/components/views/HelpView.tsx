"use client";

import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";

export function HelpView() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (expandedFaq === index) setExpandedFaq(null);
    else setExpandedFaq(index);
  };

  const faqs = [
    {
      title: "📌 What is the refund policy for canceled orders?",
      content: "Refunds will be automatically processed to your wallet/bank account within 24 hours for online payments. For cash payments, please collect your refund directly at the Cashier Counter.",
    },
    {
       title: "📌 How can I change my delivery address?",
       content: "Changes are only supported before the rider picks up the order. You can go to 'My Orders' to cancel the current order and reorder with a new address. Or update your default address in Settings."
    },
    {
       title: "How many addresses can I save in the Address Book?",
       content: "You can save up to 5 different addresses in your Address Book. Remember to set one as 'Default' to auto-fill at Checkout."
    },
    {
       title: "How do I contact customer support?",
       content: "You can call our Hotline at 1900 1234 (toll-free), send a message via Zalo, or Messenger. Support hours: 07:00 - 22:00 every day."
    }
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h2 className="font-headline text-4xl text-primary-container mb-4">Help Center</h2>
      
      <div className="flex items-center bg-surface-container-highest px-6 py-4 rounded-xl gap-4 mb-10">
        <Search className="text-secondary" size={20} />
        <input 
          className="bg-transparent border-none focus:outline-none focus:ring-0 w-full font-body text-sm placeholder:text-secondary/60" 
          placeholder="Search for answers..." 
          type="text"
        />
      </div>

      <div className="space-y-4 pb-12">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-surface-container-lowest rounded-[24px] shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleFaq(idx)} 
              className="w-full p-6 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
            >
              <h4 className="font-headline text-base text-primary-container text-left">{faq.title}</h4>
              <ChevronDown 
                className={`text-secondary transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`} 
                size={20} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                expandedFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 pt-2">
                 <p className="text-secondary text-sm leading-relaxed">{faq.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
