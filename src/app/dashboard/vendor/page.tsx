'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';
import Footer from '@/components/footer';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';

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
  
  // Calendar States
  const [bookingView, setBookingView] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

          const { data: reviewData } = await supabase.from('reviews').select('*').eq(idColumn, currentProfile.id).order('created_at', { ascending: false });
          if (reviewData) setReviews(reviewData);

          const { data: bookingData } = await supabase.from('bookings').select('*').eq(idColumn, currentProfile.id).order('event_date', { ascending: true });
          if (bookingData) setBookings(bookingData);

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

  useEffect(() => {
    if (!profile) return;
    
    const channel = supabase.channel('vendor_inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
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

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
      
    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quoted': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'payment pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'booked': return 'bg-red-50 text-red-700 border-red-200'; 
      case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // --- CHART DATA PROCESSING ---
  const generateChartData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(0, i).toLocaleString('en-US', { month: 'short' });
      return { month: monthName, revenue: 0, bookings: 0 };
    });

    bookings.forEach(b => {
      const date = new Date(b.event_date);
      const monthIndex = date.getMonth();
      // Aggregate revenue (use total_amount if available, fallback to deposit amount)
      monthlyData[monthIndex].revenue += (b.total_amount || b.amount);
      monthlyData[monthIndex].bookings += 1;
    });

    // Optionally filter to only show months from the first booking to the last
    return monthlyData;
  };

  const chartData = generateChartData();

  // --- CALENDAR LOGIC ---
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarHeader = weekDays.map(d => (
      <div key={d} className="text-center font-bold text-xs text-gray-400 uppercase tracking-wider py-3 bg-gray-50/50">
        {d}
      </div>
    ));

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50/30 border-r border-b border-gray-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      
      const dayBookings = bookings.filter(b => {
        const bDate = new Date(b.event_date);
        return bDate.getFullYear() === year && bDate.getMonth() === month && bDate.getDate() === day;
      });

      days.push(
        <div key={day} className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors hover:bg-gray-50/50 ${dayBookings.length === 0 ? 'bg-green-50/10' : ''}`}>
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#8f3546] text-white' : 'text-gray-700'}`}>
              {day}
            </span>
            {dayBookings.length === 0 && <span className="text-[10px] text-green-600 font-bold opacity-50">Available</span>}
          </div>
          
          <div className="space-y-1 mt-2">
            {dayBookings.map(b => (
              <div key={b.id} className={`text-[10px] p-1.5 rounded-md border shadow-sm ${getStatusColor(b.status)}`}>
                <div className="font-bold flex items-center justify-between">
                  <span>...{b.user_id.slice(-4)}</span>
                  <span className="opacity-75">{b.headcount}p</span>
                </div>
                <div className="text-[9px] mt-0.5 truncate">{b.status}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {calendarHeader}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) : '0.0';
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
        
        /* Custom Tooltip Styling for Charts */
        .custom-tooltip { background: white; border: 1px solid #f3f4f6; border-radius: 8px; padding: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
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
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">star</span></div><h3 className="text-3xl font-bold mb-1">{averageRating}</h3><p className="text-sm text-gray-500">Average Rating</p></div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">book_online</span></div><h3 className="text-3xl font-bold mb-1">{bookings.length}</h3><p className="text-sm text-gray-500">Total Bookings</p></div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">forum</span></div><h3 className="text-3xl font-bold mb-1">{chatRooms.length}</h3><p className="text-sm text-gray-500">Active Chats</p></div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4"><span className="material-symbols-outlined icon-fill">payments</span></div><h3 className="text-3xl font-bold mb-1 text-green-700">₹{(bookings.reduce((sum, b) => sum + b.amount, 0)).toLocaleString()}</h3><p className="text-sm text-gray-500">Deposits Secured</p></div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8f3546]">bar_chart</span> 
                        Revenue Forecast
                      </h3>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value: number) => `₹${value / 1000}k`} />                            <RechartsTooltip 
                              cursor={{ fill: '#fff8f7' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="custom-tooltip">
                                      <p className="text-xs font-bold text-gray-500 mb-1">{payload[0].payload.month}</p>
                                      <p className="text-sm font-bold text-[#8f3546]">₹{payload[0].value?.toLocaleString()}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="revenue" fill="#8f3546" radius={[4, 4, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bookings Line Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8f3546]">monitoring</span> 
                        Booking Trends
                      </h3>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                            <RechartsTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="custom-tooltip">
                                      <p className="text-xs font-bold text-gray-500 mb-1">{payload[0].payload.month}</p>
                                      <p className="text-sm font-bold text-gray-900">{payload[0].value} Events</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line type="monotone" dataKey="bookings" stroke="#22191a" strokeWidth={3} dot={{ fill: '#8f3546', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                  
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Pipeline & Availability</h2>
                    
                    <div className="flex items-center gap-4">
                      {bookingView === 'calendar' && (
                        <div className="flex items-center gap-2">
                          <button onClick={prevMonth} className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                          <span className="font-bold text-sm w-32 text-center">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <button onClick={nextMonth} className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                        </div>
                      )}

                      <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-semibold">
                        <button 
                          onClick={() => setBookingView('calendar')} 
                          className={`px-4 py-1.5 rounded-md flex items-center gap-1 transition-all ${bookingView === 'calendar' ? 'bg-white shadow-sm text-[#8f3546]' : 'text-gray-500'}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">calendar_view_month</span> Calendar
                        </button>
                        <button 
                          onClick={() => setBookingView('list')} 
                          className={`px-4 py-1.5 rounded-md flex items-center gap-1 transition-all ${bookingView === 'list' ? 'bg-white shadow-sm text-[#8f3546]' : 'text-gray-500'}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">view_list</span> Ledger
                        </button>
                      </div>
                    </div>
                  </div>

                  {bookings.length === 0 && bookingView === 'list' ? (
                    <p className="text-gray-500 py-8 text-center">No inquiries or bookings received yet.</p>
                  ) : (
                    <>
                      {/* LIST VIEW */}
                      {bookingView === 'list' && (
                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                                <th className="p-4">Event Date</th>
                                <th className="p-4">Client ID</th>
                                <th className="p-4">Party Size</th>
                                <th className="p-4">Total Contract</th>
                                <th className="p-4">Deposit Paid</th>
                                <th className="p-4">Status Pipeline</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bookings.map((b) => (
                                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                                  <td className="p-4 font-bold text-gray-900">{formatDate(b.event_date)}</td>
                                  <td className="p-4 text-xs text-gray-500">...{b.user_id.slice(-6)}</td>
                                  <td className="p-4"><span className="bg-[#fff8f7] text-[#8f3546] px-3 py-1 rounded-full text-xs font-bold">{b.headcount} Guests</span></td>
                                  <td className="p-4 font-bold">₹{b.total_amount?.toLocaleString() || b.amount.toLocaleString()}</td>
                                  <td className="p-4 text-green-600 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> ₹{b.amount.toLocaleString()}</td>
                                  <td className="p-4">
                                    <select
                                      value={b.status || 'New'}
                                      onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                                      className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none text-center shadow-sm transition-all w-32 ${getStatusColor(b.status || 'New')}`}
                                    >
                                      <option value="New">New</option>
                                      <option value="Quoted">Quoted</option>
                                      <option value="Payment Pending">Payment Pending</option>
                                      <option value="Booked">Booked</option>
                                      <option value="Completed">Completed</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* CALENDAR VIEW */}
                      {bookingView === 'calendar' && renderCalendar()}
                    </>
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
                          const brideId = roomId.split('_')[0];
                          
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

                            if (msg.message_type === 'image') {
                              return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-1.5 rounded-2xl max-w-[50%] shadow-sm ${isMe ? 'bg-[#22191a] rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'}`}>
                                    <img src={msg.message_text} alt="Shared Image" className="w-full rounded-xl object-cover" />
                                  </div>
                                </div>
                              );
                            }

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

              {/* REVIEWS TAB */}
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