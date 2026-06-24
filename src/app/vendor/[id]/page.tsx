//eslint-disable @next/next/no-img-element
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviews: number;
  starting_price: number;
  service_mode: ('salon' | 'home')[];
  services_offered: string[];
  image_url: string;
  featured: boolean;
  portfolio_images?: string[];
}

export interface ReviewData {
  id: number;
  client_name: string;
  rating: number;
  review_text: string;
  liked?: string;
  disliked?: string;
  created_at: string;
}

export default function VendorProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isMehendiService, setIsMehendiService] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  
  // Booking States
  const [selectedDate, setSelectedDate] = useState('');
  const [headcount, setHeadcount] = useState(1); 
  const extraPersonFee = 5000; 

  const [isSaved, setIsSaved] = useState(false); 
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Review States
  const [reviewsList, setReviewsList] = useState<ReviewData[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newLiked, setNewLiked] = useState('');
  const [newDisliked, setNewDisliked] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiProfile, setAiProfile] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Fetch Core Data
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          if (user.user_metadata?.ai_analysis) setAiProfile(user.user_metadata.ai_analysis);
        }

        let isMehendi = false;
        let { data, error } = await supabase.from('vendor').select('*').eq('id', id).single();

        if (error || !data) {
          const mehendiResponse = await supabase.from('mehendi').select('*').eq('id', id).single();
          data = mehendiResponse.data;
          isMehendi = true;
          if (mehendiResponse.error) throw mehendiResponse.error;
        }

        setVendor(data as Vendor);
        setIsMehendiService(isMehendi);

        const idColumn = isMehendi ? 'mehendi_id' : 'vendor_id';
        const { data: reviewsData } = await supabase.from('reviews').select('*').eq(idColumn, id).order('created_at', { ascending: false });
        if (reviewsData) setReviewsList(reviewsData);

      } catch (error) {
        console.error('Error fetching artist profile:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Set up Chat Realtime Subscription
  useEffect(() => {
    if (!currentUserId || !id) return;
    
    const chatRoomId = `${currentUserId}_${id}`;
    
    supabase.from('messages').select('*').eq('chat_room_id', chatRoomId).order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data); });

    const channel = supabase.channel(`chat_${chatRoomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_room_id=eq.${chatRoomId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, id]);

  const isOwner = currentUserId !== null && currentUserId === vendor?.user_id;

  // --- CHAT HANDLERS ---
  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !vendor) return;

    const msgText = newMessage;
    setNewMessage(''); 
    
    // Add .select() here too
    const { data, error } = await supabase.from('messages').insert({ 
      chat_room_id: `${currentUserId}_${vendor.id}`, 
      sender_id: currentUserId, 
      message_text: msgText, 
      message_type: 'text' 
    }).select();

    // Immediately push to UI
    if (!error && data && data.length > 0) {
      setMessages(prev => {
        if (prev.find(m => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
      scrollToBottom();
    }
  };

  const handleShareAI = async () => {
    if (!currentUserId || !vendor || !aiProfile) return;
    
    try {
      // Added .select() to return the newly created row
      const { data, error } = await supabase.from('messages').insert({
        chat_room_id: `${currentUserId}_${vendor.id}`, 
        sender_id: currentUserId,
        message_text: 'I wanted to share my AI Beauty Scan results with you to help with our consultation!',
        message_type: 'ai_scan', 
        ai_data: aiProfile
      }).select();

      if (error) throw error;

      // Immediately push the new message into the chat window
      if (data && data.length > 0) {
        setMessages(prev => {
          // Prevent duplicates just in case Realtime catches up
          if (prev.find(m => m.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
        scrollToBottom();
      }

    } catch (err: any) {
      console.error("AI Share Error:", err);
      alert(`Failed to share scan: ${err.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || !vendor) return;

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('chat_images').upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage.from('chat_images').getPublicUrl(fileName);

      // 3. Insert into database AND .select() it so we can push it to the UI instantly
      const { data, error: msgError } = await supabase.from('messages').insert({
        chat_room_id: `${currentUserId}_${vendor.id}`,
        sender_id: currentUserId,
        message_text: publicUrl,
        message_type: 'image'
      }).select();

      if (msgError) throw msgError;

      // 4. Instantly push the image bubble to the chat window!
      if (data && data.length > 0) {
        setMessages(prev => {
          if (prev.find(m => m.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
        scrollToBottom();
      }

    } catch (err: any) {
      console.error("Image Upload Error:", err);
      alert(`Failed to upload image: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
      // 5. Reset the file input so you can upload another image right away
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- STANDARD HANDLERS ---
  const handleSaveToggle = async () => {
    if (!currentUserId) return router.push('/login');
    const idColumn = isMehendiService ? 'mehendi_id' : 'vendor_id';
    try {
      if (isSaved) {
        await supabase.from('saved_vendors').delete().eq('user_id', currentUserId).eq(idColumn, id);
        setIsSaved(false);
      } else {
        await supabase.from('saved_vendors').insert([{ user_id: currentUserId, [idColumn]: id }]);
        setIsSaved(true);
      }
    } catch (error) { alert("Could not save vendor."); }
  };

  const handleSubmitReview = async () => {
    if (isOwner) return alert("You cannot review your own profile.");
    if (!newReviewText.trim()) return alert("Please write something about your experience.");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');

    setIsSubmittingReview(true);
    const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Verified Bride';
    
    const payload = {
      client_name: userName, rating: newRating, review_text: newReviewText,
      liked: newLiked.trim() || null, disliked: newDisliked.trim() || null,
      ...(isMehendiService ? { mehendi_id: id } : { vendor_id: id })
    };

    try {
      const { data: insertedReview, error } = await supabase.from('reviews').insert([payload]).select().single();
      if (error) throw error;
      setReviewsList([insertedReview, ...reviewsList]);
      setNewReviewText(''); setNewLiked(''); setNewDisliked(''); setNewRating(5); setShowReviewForm(false);
      alert("Review published.");
    } catch (error) { alert("Error submitting review."); } 
    finally { setIsSubmittingReview(false); }
  };

  const finalPrice = (vendor?.starting_price || 0) + ((headcount - 1) * extraPersonFee);

  const handleCheckout = async () => {
    if (isOwner) return alert("You cannot book your own services.");
    if (!selectedDate) return alert("Please select your event date.");
    setIsCheckoutLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve) => { script.onload = resolve; script.onerror = resolve; });

      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: vendor?.id, vendorName: vendor?.name, amount: 5000 }), // 5k deposit
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.id) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: orderData.amount, currency: orderData.currency,
        name: 'Dulhan Central', description: `Deposit for ${vendor?.name}`, order_id: orderData.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            const bookingPayload = {
              user_id: session.user.id, vendor_name: vendor?.name, event_date: selectedDate,
              amount: 5000, total_amount: finalPrice, headcount: headcount, // Saved to DB
              payment_id: response.razorpay_payment_id, status: 'confirmed',
              ...(isMehendiService ? { mehendi_id: vendor?.id } : { vendor_id: vendor?.id })
            };
            const { error: bookingError } = await supabase.from('bookings').insert([bookingPayload]);
            if (bookingError) throw bookingError;
            alert(`🎉 Booking Confirmed! Date Locked: ${selectedDate}`);
            router.push('/profile');
} catch (err: any) { 
  console.error("Database Insert Error:", err);
  alert(`Payment succeeded, but DB failed: ${err?.message || err?.details || JSON.stringify(err)}`); 
}        },
        prefill: { name: session.user.email?.split('@')[0], email: session.user.email, contact: '9999999999' },
        theme: { color: '#8f3546' },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { alert(`Error: ${error?.message || 'Failed'}`); } 
    finally { setIsCheckoutLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]"><div className="w-12 h-12 border-4 border-[#8f3546]/20 border-t-[#8f3546] rounded-full animate-spin"></div></div>;
  if (!vendor) return <div className="min-h-screen flex items-center justify-center">Artist Not Found</div>;

  const totalReviews = reviewsList.length;
  const averageRating = totalReviews > 0 ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '0.0';

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-body-custom { font-family: 'Libre Caslon Text', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        .icon-fill { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
      `}} />

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-16 pt-28">
        <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6">
          <span className="cursor-pointer hover:text-[#8f3546]" onClick={() => router.push('/')}>Home</span><span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="cursor-pointer hover:text-[#8f3546]" onClick={() => router.push('/search')}>Vendors</span><span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-gray-800 font-semibold">{vendor.name}</span>
        </nav>

        {/* Hero Image */}
        <div className="relative h-64 md:h-150 w-full rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
          <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover object-top" />
        </div>
        
        {/* Profile Header */}
        <div className="bg-white p-6 md:p-8 -mt-12 mx-4 md:mx-12 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1"><h1 className="text-3xl md:text-4xl font-bold text-gray-900">{vendor.name}</h1>{vendor.featured && <span className="bg-[#8f3546] text-white px-2 py-1 rounded text-[10px] uppercase font-bold">Elite</span>}</div>
            <p className="text-gray-500 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{vendor.location}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {!isOwner && (
              <button onClick={handleSaveToggle} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-bold shadow-sm ${isSaved ? 'bg-[#fff8f7] border-[#8f3546] text-[#8f3546]' : 'bg-white border-gray-200 text-gray-700'}`}>
                <span className={`material-symbols-outlined text-lg ${isSaved ? 'icon-fill text-[#8f3546]' : 'text-gray-400'}`}>favorite</span>{isSaved ? 'Saved to Favorites' : 'Save Vendor'}
              </button>
            )}
            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
              <div className="flex flex-col items-end"><span className="text-xs text-gray-400 font-bold uppercase">Rating</span><span className="text-sm text-gray-600 font-medium">{totalReviews} Reviews</span></div>
              <div className="bg-[#8f3546] text-white px-4 py-2 rounded-lg font-bold text-lg flex items-center gap-1 shadow-sm"><span className="material-symbols-outlined icon-fill text-lg">star</span> {averageRating}</div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-2">
            
            {/* Sticky Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-8 sticky top-[72px] bg-[#fff8f7] z-30 pt-4">
              {['portfolio', 'about', 'reviews'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold uppercase tracking-wider ${activeTab === tab ? 'border-b-2 border-[#8f3546] text-[#8f3546]' : 'text-gray-500 hover:text-gray-900'}`}>
                  {tab === 'reviews' ? `Reviews (${totalReviews})` : tab}
                </button>
              ))}
            </div>

            {/* Content Tabs */}
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.portfolio_images && vendor.portfolio_images.length > 0 ? (
                  vendor.portfolio_images.map((imgUrl, idx) => (
                    <div key={idx} className="aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm group">
                      <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Portfolio" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">photo_library</span><p className="font-medium text-sm">No portfolio images uploaded yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div><h2 className="text-xl font-bold text-gray-900 mb-3">About {vendor.name}</h2><p className="text-gray-600 leading-relaxed text-sm">Known for exquisite attention to detail and a flawless finish, {vendor.name} is highly sought-after. They specialize in enhancing natural beauty.</p></div>
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">{vendor.services_offered?.map((service, idx) => (<span key={idx} className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold">{service}</span>))}</div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold text-gray-900">Bride Experiences</h3>
                  {!isOwner ? (
                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-white border border-[#8f3546] text-[#8f3546] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#8f3546] hover:text-white transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">edit_square</span> Write a Review
                    </button>
                  ) : (<span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-lg border">Cannot review own profile</span>)}
                </div>

                {showReviewForm && !isOwner && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-[#8f3546]/20 shadow-md mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Rate your experience</h4>
                    <div className="flex gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} onClick={() => setNewRating(star)} className={`material-symbols-outlined text-3xl cursor-pointer ${star <= newRating ? 'icon-fill text-[#8f3546]' : 'text-gray-200'}`}>star</span>
                      ))}
                    </div>
                    <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Share details..." className="w-full bg-gray-50 border rounded-xl p-4 text-sm outline-none focus:ring-[#8f3546] mb-4 min-h-[120px]" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div><label className="text-[10px] font-bold text-green-700 uppercase mb-2 block">What you loved</label><input type="text" value={newLiked} onChange={(e) => setNewLiked(e.target.value)} className="w-full bg-green-50/30 border border-green-100 rounded-xl p-3 text-sm" /></div>
                      <div><label className="text-[10px] font-bold text-red-700 uppercase mb-2 block">Room for improvement</label><input type="text" value={newDisliked} onChange={(e) => setNewDisliked(e.target.value)} className="w-full bg-red-50/30 border border-red-100 rounded-xl p-3 text-sm" /></div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSubmitReview} disabled={isSubmittingReview} className="bg-[#8f3546] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase shadow-sm">{isSubmittingReview ? 'Publishing...' : 'Publish'}</button>
                      <button onClick={() => setShowReviewForm(false)} className="text-gray-500 hover:text-gray-800 text-xs font-bold uppercase">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {reviewsList.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#fff8f7] text-[#8f3546] flex items-center justify-center font-bold">{review.client_name.charAt(0)}</div>
                          <div><h4 className="font-bold text-sm">{review.client_name}</h4><p className="text-[10px] uppercase text-gray-400">{formatDate(review.created_at)}</p></div>
                        </div>
                        <div className="flex items-center text-[#8f3546]">{[1,2,3,4,5].map(s => <span key={s} className={`material-symbols-outlined text-sm ${s <= review.rating ? 'icon-fill' : 'text-gray-200'}`}>star</span>)}</div>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{review.review_text}</p>
                      {(review.liked || review.disliked) && (
                        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-50">
                          {review.liked && <div className="bg-green-50/50 p-4 rounded-xl"><p className="text-[10px] font-bold text-green-800 uppercase mb-2">Loved</p><p className="text-sm text-green-900">{review.liked}</p></div>}
                          {review.disliked && <div className="bg-red-50/50 p-4 rounded-xl"><p className="text-[10px] font-bold text-red-800 uppercase mb-2">Improvement</p><p className="text-sm text-red-900">{review.disliked}</p></div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Sticky Booking Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">Customize Package</h3>

              <div className="mb-6">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">Event Date</label>
                <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <input type="date" min={today} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} disabled={isOwner} className="w-full px-4 py-3 text-sm bg-transparent outline-none cursor-pointer" required />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bridal Party Size</label>
                  <span className="text-[10px] text-[#8f3546] font-bold">+₹{(extraPersonFee).toLocaleString()}/person</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-2">
                  <button onClick={() => setHeadcount(Math.max(1, headcount - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-lg text-[#8f3546]">-</button>
                  <div className="text-center">
                    <span className="font-bold text-gray-900 block">{headcount}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{headcount === 1 ? 'Bride Only' : 'Bride + Guests'}</span>
                  </div>
                  <button onClick={() => setHeadcount(headcount + 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-lg text-[#8f3546]">+</button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-xs text-gray-500"><span>Base Service</span><span>₹{vendor.starting_price.toLocaleString()}</span></div>
                {headcount > 1 && <div className="flex justify-between text-xs text-gray-500"><span>Extra Guests ({headcount - 1})</span><span>+₹{((headcount - 1) * extraPersonFee).toLocaleString()}</span></div>}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2"><span>Total</span><span>₹{finalPrice.toLocaleString()}</span></div>
              </div>

              <div className="bg-[#fff8f7] rounded-xl p-3 mb-4 text-center border border-[#8f3546]/10">
                <p className="text-[9px] text-[#8f3546] font-bold uppercase tracking-wider mb-0.5">Token Deposit Due Now</p>
                <p className="text-lg font-bold text-[#8f3546]">₹5,000</p>
              </div>

              {isOwner ? (
                <div className="w-full bg-gray-100 text-gray-500 py-3.5 rounded-xl font-bold uppercase text-xs flex justify-center cursor-not-allowed">Profile View</div>
              ) : (
                <button onClick={handleCheckout} disabled={isCheckoutLoading} className="w-full bg-[#8f3546] hover:bg-[#712030] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex justify-center gap-2 shadow-md">
                  {isCheckoutLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-lg">lock</span>}
                  {isCheckoutLoading ? 'Opening Gateway...' : 'Pay Deposit'}
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (!currentUserId) return router.push('/login');
                  setIsChatOpen(true);
                  scrollToBottom();
                }}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all mt-3 flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg text-[#8f3546]">chat</span> Chat with Artist
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- REAL-TIME CHAT SLIDE-OVER --- */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 flex flex-col animate-fade-in border-l border-gray-100">
          
          <div className="p-5 bg-[#fff8f7] border-b border-[#8f3546]/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={vendor.image_url} className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
              <div><h3 className="font-bold text-sm leading-tight text-gray-900">{vendor.name}</h3><p className="text-[9px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p></div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-800"><span className="material-symbols-outlined">close</span></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">End-to-End Encrypted</div>
            
            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === currentUserId;
              
              if (msg.message_type === 'ai_scan') {
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="bg-white border border-[#8f3546] p-4 rounded-2xl max-w-[85%] shadow-sm">
                      <div className="flex items-center gap-2 text-[#8f3546] mb-2 border-b border-[#8f3546]/10 pb-2"><span className="material-symbols-outlined text-[16px]">face_retouching_natural</span><span className="text-[10px] font-bold uppercase tracking-wider">AI Beauty Profile</span></div>
                      <p className="text-xs text-gray-600 mb-3 italic">"{msg.message_text}"</p>
                      <div className="bg-[#fff8f7] p-3 rounded-xl grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400 font-bold uppercase block text-[8px]">Face Shape</span><span className="font-bold">{msg.ai_data?.shape}</span></div>
                        <div><span className="text-gray-400 font-bold uppercase block text-[8px]">Undertone</span><span className="font-bold">{msg.ai_data?.tone}</span></div>
                        <div className="col-span-2"><span className="text-gray-400 font-bold uppercase block text-[8px]">Color Palette</span><span className="font-bold text-[#8f3546]">{msg.ai_data?.palette}</span></div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.message_type === 'image') {
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-1.5 rounded-2xl max-w-[250px] shadow-sm ${isMe ? 'bg-[#8f3546] rounded-br-none' : 'bg-white border border-gray-100 rounded-bl-none'}`}>
                      <img src={msg.message_text} alt="Shared Moodboard" className="w-full rounded-xl object-cover" />
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${isMe ? 'bg-[#8f3546] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {msg.message_text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            {aiProfile && (
              <button onClick={handleShareAI} className="w-full mb-3 bg-[#fff8f7] border border-[#8f3546]/20 text-[#8f3546] py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-[#8f3546] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[14px]">share</span> Share My AI Scan Results
              </button>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              {/* IMAGE UPLOAD BUTTON */}
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#8f3546] transition-colors"
                disabled={isUploadingImage}
              >
                {isUploadingImage ? <div className="w-4 h-4 border-2 border-gray-300 border-t-[#8f3546] rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[24px]">image</span>}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Message artist..." className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-[#8f3546]" />
              <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 bg-[#8f3546] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px] ml-1">send</span></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}