"use client";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am the Alpha AI Assistant. How can I help you today? You can ask me about registration, fees, our location, or our vision.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    const lowerInput = input.toLowerCase();
    setInput("");

    setTimeout(() => {
      let botResponse = "I'm sorry, I didn't quite understand that. You can try asking: 'How do I join?', 'How much is the fee?', 'Where are you located?', or 'Tell me about your vision'.";
      
      // Greetings
      if (/(hi|hello|hey|habari|morning|evening|afternoon)/i.test(lowerInput)) {
        botResponse = "Hello there! Welcome to Alpha Youth Group. Together We Rise and Shine! How can I assist you today?";
      } 
      // Registration / Joining
      else if (/(join|regist|apply|sign up|member|form|start|become)/i.test(lowerInput)) {
        botResponse = "To join, click the 'Apply to Join' button on the homepage. Fill out your details (name, phone, ID), agree to the rules (18+ only), and you will be guided on how to pay the KES 1,000 registration fee.";
      } 
      // Fees / Payments
      else if (/(fee|pay|cost|1000|mpesa|pesa|shilling|money|price|deposit)/i.test(lowerInput)) {
        botResponse = "The one-time registration fee is KES 1,000. You can pay this via M-Pesa Send Money to 0704785116. Once paid, an admin will verify it and send you your unique Member Code.";
      } 
      // Location
      else if (/(where|location|voi|taita|kenya|address|office|based|county)/i.test(lowerInput)) {
        botResponse = "We are proudly based in Voi, Taita Taveta County, Kenya. Our vision reaches across the Coast Region and eventually throughout Kenya!";
      } 
      // Vision / Future
      else if (/(vision|goal|500|future|plan|mission|purpose|dream)/i.test(lowerInput)) {
        botResponse = "Our vision is to connect and empower youth across Kenya. We are currently building a strong community of 500 members to create sustainable opportunities and community impact.";
      } 
      // Contact / Support
      else if (/(contact|phone|whatsapp|call|number|reach|help|support|talk)/i.test(lowerInput)) {
        botResponse = "You can reach our team (Joy) via WhatsApp or Call at 0704785116. We are always happy to help you on your journey!";
      }

      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      {isOpen && (
        <div className="bg-[#18181B] border border-[#9333EA]/50 rounded-2xl w-[320px] sm:w-[350px] shadow-[0_0_30px_rgba(147,51,234,0.2)] mb-4 overflow-hidden flex flex-col" style={{ height: "450px" }}>
          <div className="bg-[#9333EA] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-bold text-sm">Alpha AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200"><X size={20} /></button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.isBot ? "justify-start" : "justify-end"}`}>
                {msg.isBot && <div className="w-6 h-6 rounded-full bg-[#9333EA]/20 flex items-center justify-center shrink-0"><Bot size={14} className="text-[#D946EF]"/></div>}
                <div className={`p-3 rounded-xl max-w-[80%] text-xs leading-relaxed ${msg.isBot ? "bg-black/40 text-gray-200 rounded-tl-none" : "bg-[#9333EA] text-white rounded-tr-none"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/20 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#9333EA]"
            />
            <button type="submit" className="bg-[#9333EA] p-2 rounded-xl text-white"><Send size={16} /></button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-[#9333EA] text-white p-4 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-110 transition-transform flex items-center justify-center relative">
          <MessageSquare size={28} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white text-[#9333EA] text-[10px] font-bold items-center justify-center">1</span>
          </span>
        </button>
      )}
    </div>
  );
}
