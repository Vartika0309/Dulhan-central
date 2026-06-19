'use client';

import { useState, useRef, useEffect } from 'react';

export default function BeautyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hi! I am your personal AI bridal consultant. Looking for a specific style, budget, or location in Delhi?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for auto-scrolling to the bottom of the chat (Typed for TypeScript)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Trigger scroll whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply || data.error }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Oops! Connection error. Try again.' }]);
    }
    
    setIsLoading(false);
  };

  // --- RENDER CLOSED STATE ---
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-4 shadow-2xl transition-transform hover:scale-110 z-50 flex items-center justify-center group"
      >
        <span className="text-2xl mr-2 group-hover:animate-pulse">✨</span>
        <span className="font-bold tracking-wide">Ask BeautyBot</span>
      </button>
    );
  }

  // --- RENDER OPEN STATE ---
  return (
    <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className="bg-rose-600 text-white p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <div>
            <h3 className="font-bold font-serif text-lg leading-tight">Dulhan BeautyBot</h3>
            <p className="text-rose-200 text-xs">AI Bridal Consultant</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-rose-200 hover:text-white font-bold p-1 rounded hover:bg-rose-700 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-[400px] overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gray-900 text-white self-end rounded-br-none' 
                : 'bg-white border border-rose-100 text-gray-800 self-start rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
        
        {/* Animated Typing Indicator */}
        {isLoading && (
          <div className="bg-white border border-rose-100 text-gray-400 self-start rounded-2xl rounded-bl-none p-4 shadow-sm text-sm flex gap-1 items-center">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
          </div>
        )}
        {/* Invisible div to scroll down to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="e.g. Find artists under ₹30k..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-gray-50"
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-rose-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
      
    </div>
  );
}