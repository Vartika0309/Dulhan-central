'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';
import Footer from '@/components/footer';

// --- INTERFACES ---
interface Profile {
  id: string;
  user_id: string;
  name: string;
  location: string;
  starting_price: number;
  rating: number;
  reviews: number;
  image_url?: string;
  services_offered?: string[];
}

interface Review {
  id: number;
  client_name: string;
  rating: number;
  review_text: string;
  liked: string;
  disliked: string;
  created_at: string;
}

interface Booking {
  id: number;
  user_id: string;
  event_date: string;
  amount: number; // Deposit
  total_amount: number;
  headcount: number;
  status: string;
  payment_id: string;
  created_at: string;
}

interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message_text: string;
  message_type: 'text' | 'image' | 'ai_scan';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_data?: any;
  created_at: string;
}

export default function VendorDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'inbox' | 'reviews'>('overview');
  
  // Chat States
  const [activeChatRoom, setActiveChatRoom] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        setCurrentUser(user);

        let currentProfile = null;
        let isVendor = true;

        // Fetch Profile
        const { data: vendorData } = await supabase.from('vendor').select('*').eq('user_id', user.id).single();

        if (vendorData) {
          currentProfile = vendorData;
        } else {
          const { data: mehendiData } = await supabase.from('mehendi').select('*').eq('user_id', user.id).single();
          if (mehendiData) { currentProfile = mehendiData; isVendor = false; }
        }

        if (currentProfile) {
          setProfile(currentProfile);
          const idColumn = isVendor ? 'vendor_id' : 'mehendi_id';

          // Fetch Reviews
          const { data: reviewData } = await supabase.from('reviews').select('*').eq(idColumn, currentProfile.id).order('created_at', { ascending: false });
          if (reviewData) setReviews(reviewData);

          // Fetch Bookings
          const { data: bookingData } = await supabase.from('bookings').select('*').eq(idColumn, currentProfile.id).order('event_date', { ascending: true });
          if (bookingData) setBookings(bookingData);

          // Fetch Messages (Any chat room ending with this vendor's ID)
          const { data: messageData } = await supabase.from('messages').select('*').like('chat_room_id', `%_${currentProfile.id}`).order('created_at', { ascending: true });
          if (messageData) setMessages(messageData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Set up Realtime listener for incoming messages
  useEffect(() => {
    if (!profile) return;
    
    const channel = supabase.channel('vendor_inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        // Only accept messages meant for this vendor
        if (newMsg.chat_room_id.endsWith(`_${profile.id}`)) {
          setMessages((prev) => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser || !activeChatRoom) return;

    const msgText = replyText;
    setReplyText(''); 

    const { data, error } = await supabase.from('messages').insert({ 
      chat_room_id: activeChatRoom, 
      sender_id: currentUser.id, 
      message_text: msgText, 
      message_type: 'text' 
    }).select();

    if (!error && data && data.length > 0) {
      setMessages(prev => {
        if (prev.find(m => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
      scrollToBottom();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) : '0.0';
  
  // Group messages by chat room to create the inbox list
  const chatRooms = Array.from(new Set(messages.map(m => m.chat_room_id)));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]"><div className="w-10 h-10 border-4 border-[#8f3546] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .icon-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}} />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
        {!profile ? (
          <div className="text-center bg-white p-10 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">No profile found.</h2>
            <p className="text-gray-500 mt-2">Please ensure you have registered your business details.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-white p-8 rounded-2xl shadow-sm border border-[#8f3546]/10">
              {profile.image_url ? (
                <img src={profile.image_url} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#8f3546]/10 shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#fff8f7] flex items-center justify-center border-4 border-[#8f3546]/10"><span className="material-symbols-outlined text-4xl text-[#8f3546]/50">storefront</span></div>
              )}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900 font-display-custom mb-2">Welcome back, <span className="text-[#8f3546]">{profile.name}</span></h1>
                <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {profile.location}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: 'dashboard' },
                { id: 'bookings', label: `Bookings (${bookings.length})`, icon: 'calendar_month' },
                { id: 'inbox', label: `Inbox (${chatRooms.length})`, icon: 'mail' },
                { id: 'reviews', label: `Reviews (${totalReviews})`, icon: 'star' }
              ].map(tab => (
                <button 
                  key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-b-2 border-[#8f3546] text-[#8f3546]' : 'text-gray-400 hover:text-gray-800'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="min-h-[500px]">

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">star</span></div><h3 className="text-3xl font-bold mb-1">{averageRating}</h3><p className="text-sm text-gray-500">Average Rating</p></div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">book_online</span></div><h3 className="text-3xl font-bold mb-1">{bookings.length}</h3><p className="text-sm text-gray-500">Total Bookings</p></div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">forum</span></div><h3 className="text-3xl font-bold mb-1">{chatRooms.length}</h3><p className="text-sm text-gray-500">Active Chats</p></div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">payments</span></div><h3 className="text-3xl font-bold mb-1 text-green-700">₹{(bookings.reduce((sum, b) => sum + b.amount, 0)).toLocaleString()}</h3><p className="text-sm text-gray-500">Deposits Secured</p></div>
                </div>
              )}

              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                  <h2 className="text-xl font-bold mb-6">Upcoming & Past Events</h2>
                  {bookings.length === 0 ? (
                    <p className="text-gray-500 py-8 text-center">No bookings received yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                            <th className="p-4 rounded-tl-xl">Event Date</th>
                            <th className="p-4">Client ID</th>
                            <th className="p-4">Party Size</th>
                            <th className="p-4">Total Contract</th>
                            <th className="p-4 rounded-tr-xl">Deposit Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((b) => (
                            <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 font-bold text-gray-900">{formatDate(b.event_date)}</td>
                              <td className="p-4 text-xs text-gray-500">...{b.user_id.slice(-6)}</td>
                              <td className="p-4"><span className="bg-[#fff8f7] text-[#8f3546] px-3 py-1 rounded-full text-xs font-bold">{b.headcount} Guests</span></td>
                              <td className="p-4 font-bold">₹{b.total_amount?.toLocaleString() || b.amount.toLocaleString()}</td>
                              <td className="p-4 text-green-600 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> ₹{b.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* INBOX TAB */}
              {activeTab === 'inbox' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[600px] overflow-hidden">
                  
                  {/* Left Sidebar: Chat List */}
                  <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-white"><h3 className="font-bold text-gray-900">Active Conversations</h3></div>
                    <div className="flex-1 overflow-y-auto">
                      {chatRooms.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center p-6">No messages yet.</p>
                      ) : (
                        chatRooms.map(roomId => {
                          const roomMessages = messages.filter(m => m.chat_room_id === roomId);
                          const lastMsg = roomMessages[roomMessages.length - 1];
                          const brideId = roomId.split('_')[0]; // Extract bride's ID from room string
                          
                          return (
                            <button 
                              key={roomId} onClick={() => { setActiveChatRoom(roomId); scrollToBottom(); }}
                              className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${activeChatRoom === roomId ? 'bg-white border-l-4 border-l-[#8f3546]' : 'hover:bg-white'}`}
                            >
                              <p className="text-xs font-bold text-gray-900 truncate">Client: ...{brideId.slice(-6)}</p>
                              <p className="text-xs text-gray-500 truncate mt-1">{lastMsg.message_type === 'text' ? lastMsg.message_text : `Shared ${lastMsg.message_type}`}</p>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Sidebar: Active Chat */}
                  <div className="flex-1 flex flex-col bg-white">
                    {activeChatRoom ? (
                      <>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[#8f3546]">chat_bubble</span> Client Chat</h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20">
                          {messages.filter(m => m.chat_room_id === activeChatRoom).map((msg, idx) => {
                            const isMe = msg.sender_id === currentUser?.id;
                            
                            // Render AI Scan
                            if (msg.message_type === 'ai_scan') {
                              return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className="bg-[#fff8f7] border border-[#8f3546]/30 p-4 rounded-2xl max-w-[85%] shadow-sm">
                                    <div className="flex items-center gap-2 text-[#8f3546] mb-2 border-b border-[#8f3546]/10 pb-2"><span className="material-symbols-outlined text-[16px]">face_retouching_natural</span><span className="text-[10px] font-bold uppercase tracking-wider">Bride's AI Beauty Profile</span></div>
                                    <div className="bg-white p-3 rounded-xl grid grid-cols-2 gap-2 text-xs">
                                      <div><span className="text-gray-400 font-bold uppercase block text-[8px]">Face Shape</span><span className="font-bold">{msg.ai_data?.shape}</span></div>
                                      <div><span className="text-gray-400 font-bold uppercase block text-[8px]">Undertone</span><span className="font-bold">{msg.ai_data?.tone}</span></div>
                                      <div className="col-span-2"><span className="text-gray-400 font-bold uppercase block text-[8px]">Recommended Palette</span><span className="font-bold text-[#8f3546]">{msg.ai_data?.palette}</span></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            // Render Images
                            if (msg.message_type === 'image') {
                              return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-1.5 rounded-2xl max-w-[50%] shadow-sm ${isMe ? 'bg-[#22191a] rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'}`}>
                                    <img src={msg.message_text} alt="Shared Image" className="w-full rounded-xl object-cover" />
                                  </div>
                                </div>
                              );
                            }

                            // Render Standard Text
                            return (
                              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${isMe ? 'bg-[#22191a] text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                  {msg.message_text}
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                          <form onSubmit={handleSendReply} className="flex gap-2">
                            <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-[#8f3546]" />
                            <button type="submit" disabled={!replyText.trim()} className="w-12 h-12 bg-[#8f3546] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px] ml-1">send</span></button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-6xl mb-4 text-gray-200">forum</span>
                        <p>Select a conversation to start messaging</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB (Retained from your original code) */}
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold mb-6">Client Feedback</h2>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 py-8 text-center">No reviews found.</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{review.client_name}</h4>
                            <div className="flex items-center text-[#8f3546]"><span className="material-symbols-outlined icon-fill text-sm">star</span> <span className="text-xs font-bold ml-1">{review.rating}.0</span></div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">"{review.review_text}"</p>
                          <div className="flex gap-4 text-xs">
                            {review.liked && <span className="text-green-700 bg-green-50 px-2 py-1 rounded">Loved: {review.liked}</span>}
                            {review.disliked && <span className="text-red-700 bg-red-50 px-2 py-1 rounded">Improve: {review.disliked}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}