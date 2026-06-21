'use client';

import { useState, useRef, useEffect } from 'react';

// Updated Icon to accept custom colors and sizes!
const MagicLampIcon = ({ className = "w-5 h-5 text-[#8f3546] fill-[#8f3546]" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 12c.3 0 .5-.2.5-.5V10c0-1.7-1.3-3-3-3h-2.3c-.6-1.2-1.7-2-3-2s-2.4.8-3 2H6.5C4.8 7 3.5 8.3 3.5 10v1.5c0 .3.2.5.5.5s.5-.2.5-.5V10c0-.8.7-1.5 1.5-1.5h11c.8 0 1.5.7 1.5 1.5v1.5c0 .3.2.5.5.5zm-8.8-9.5C10.7 2.2 11.3 2 12 2s1.3.2 1.3.5c0 .3-.3.5-.7.5-.4 0-.6.3-.6.6 0 .3.2.5.5.5h1.5c.3 0 .5.2.5.5s-.2.5-.5.5h-1.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5.2.5.5s-.2.5-.5.5H12c-1.7 0-3-1.3-3-3 0-.3.2-.5.5-.5s.7.2.7.5zm-5 11c-.3 0-.5-.2-.5-.5V12c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3-.2.5-.5.5zm12.5 0c-.3 0-.5-.2-.5-.5V12c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3-.2.5-.5.5zM12 22c-4.4 0-8-3.6-8-8 0-.3.2-.5.5-.5s.5.2.5.5c0 3.3 2.7 6 6 6s6-2.7 6-6c0-.3.2-.5.5-.5s.5.2.5.5c0 4.4-3.6 8-8 8z" />
    <path d="M12 16.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zm0-8c-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5-1.6-3.5-3.5-3.5zm7 5.5h-1c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h1c.3 0 .5.2.5.5s-.2.5-.5.5zm-13 0H5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h1c.3 0 .5.2.5.5s-.2.5-.5.5z" />
  </svg>
);

export default function BeautyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: "Namaste! I'm DC Genie, your personal AI bridal coordinator. Looking for a specialized artist inside Delhi NCR? Ask me anything!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply || "I'm having trouble connecting right now." }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "I'm having trouble connecting to my AI brain right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-y-0 right-0 w-[420px] max-w-full bg-white border-l border-gray-150 shadow-2xl z-50 flex flex-col transition-transform duration-500 font-sans-custom ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-[#8f3546] p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center p-1.5 shadow-inner shrink-0">
            {/* Dark red icon inside the white circle */}
            <MagicLampIcon className="w-6 h-6 text-[#8f3546] fill-[#8f3546]" />
          </div>
          <div>
            <h4 className="font-display-custom text-lg font-bold">DC Genie</h4>
            <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">Interactive AI Coordinator</p>
          </div>
          <button className="ml-auto text-white/70 hover:text-white" onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50 flex flex-col">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} gap-1`}>
              <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-sans-custom ${msg.sender === 'user' ? 'bg-[#8f3546] text-white rounded-tr-none shadow-md' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest px-1">
                {msg.sender === 'user' ? 'You' : 'DC Genie'}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col items-start gap-1">
              <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1 text-xs">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{animationDelay: '100ms'}}>●</span>
                <span className="animate-bounce" style={{animationDelay: '200ms'}}>●</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5">
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 text-gray-800 outline-none" 
              placeholder="Type your bridal query here..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" disabled={isTyping} className="material-symbols-outlined text-[#8f3546] font-bold hover:scale-110 transition-transform disabled:opacity-50">send</button>
          </div>
        </form>
      </div>

      {!isOpen && (
        <button 
          className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-[#8f3546] border-2 border-white shadow-2xl overflow-hidden hover:scale-105 transition-transform flex items-center justify-center p-3"
          onClick={() => setIsOpen(true)}
        >
          {/* White icon on the dark red button */}
          <MagicLampIcon className="w-8 h-8 text-white fill-white" />
        </button>
      )}
    </>
  );
}