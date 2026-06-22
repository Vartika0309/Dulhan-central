//eslint-disable @next/next/no-img-element
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';

export interface Vendor {
  id: string;
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
}

// Initial dummy reviews to populate the state
const initialReviews = [
  {
    id: 1, author: "Sneha Sharma", initial: "S", date: "Nov 12, 2025", rating: 5, 
    text: "I booked them for my main wedding day and my reception, and it was the best decision! They understood exactly what I meant by 'minimal but glowing.' My makeup didn't budge even after hours of dancing and crying. Highly recommend!"
  },
  {
    id: 2, author: "Ananya Verma", initial: "A", date: "Oct 28, 2025", rating: 4, 
    text: "Very professional and punctual. The team arrived right on time despite the Delhi traffic. The draping was secure and the eye makeup was stunning. Took off one star only because the trial session felt a bit rushed, but the final day was perfect."
  }
];

export default function VendorProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  
  // States
  const [selectedDate, setSelectedDate] = useState('');
  const [isSaved, setIsSaved] = useState(false); // Save Vendor State
  
  // Review States
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Fetch specific vendor data from Supabase
  useEffect(() => {
    async function fetchVendorDetails() {
      try {
        let { data, error } = await supabase.from('vendor').select('*').eq('id', id).single();

        if (error || !data) {
          const mehendiResponse = await supabase.from('mehendi').select('*').eq('id', id).single();
          data = mehendiResponse.data;
          if (mehendiResponse.error) throw mehendiResponse.error;
        }

        setVendor(data as Vendor);
      } catch (error) {
        console.error('Error fetching artist profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchVendorDetails();
  }, [id]);

  // Handle Save Vendor Toggle
  const handleSaveToggle = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please log in to save your favorite artists.");
      router.push('/login');
      return;
    }
    setIsSaved(!isSaved);
    // Note: In the future, this is where you'd write an INSERT to a 'saved_vendors' table in Supabase
  };

  // Handle Review Submission
  const handleSubmitReview = async () => {
    if (!newReviewText.trim()) {
      alert("Please write something about your experience.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please log in to write a review.");
      router.push('/login');
      return;
    }

    const userName = session.user.email?.split('@')[0] || 'Verified Bride';
    
    const newReview = {
      id: Date.now(),
      author: userName,
      initial: userName.charAt(0).toUpperCase(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: newRating,
      text: newReviewText
    };

    // Add to the top of our local state list
    setReviewsList([newReview, ...reviewsList]);
    
    // Reset form
    setNewReviewText('');
    setNewRating(5);
    setShowReviewForm(false);
    
    alert("Thank you! Your review has been published.");
    // Note: In the future, this is where you'd write an INSERT to a 'reviews' table in Supabase
  };

  // --- RAZORPAY CHECKOUT HANDLER ---
  const handleCheckout = async () => {
    if (!selectedDate) {
      alert("Please select your event date from the calendar before booking.");
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please log in or create an account to book an artist.");
        router.push('/login');
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
        script.onerror = resolve;
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CORRECTED: Changed 'Amount' to 'amount' (lowercase 'a')
        body: JSON.stringify({ vendorId: vendor?.id, vendorName: vendor?.name, amount: 5000 }),
      });

      const orderData = await res.json();
      console.log("BACKEND RESPONSE:", orderData);
      
      if (!res.ok || !orderData.id) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Dulhan Central',
        description: `Securing Deposit for ${vendor?.name} on ${selectedDate}`,
        order_id: orderData.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: function (response: any) {
          alert(`🎉 Payment Successful!\nDate Locked: ${selectedDate}\nPayment ID: ${response.razorpay_payment_id}`);
          router.push('/profile');
        },
        prefill: {
          name: session.user.email?.split('@')[0] || 'Bridal Client',
          email: session.user.email || 'bride@example.com',
          contact: '9999999999',
        },
        theme: { color: '#8f3546' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Razorpay Order Error:', error);
      const errorMessage = error?.error?.description || error?.message || 'Failed to create order';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#8f3546]/20 border-t-[#8f3546] rounded-full animate-spin mb-4"></div>
          <h2 className="text-[#8f3546] font-bold tracking-widest uppercase text-sm">Loading Portfolio...</h2>
        </div>
      </div>
    );
  }

  if (!vendor) return <div className="min-h-screen flex flex-col items-center justify-center">Artist Not Found</div>;

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
          <span className="cursor-pointer hover:text-[#8f3546]" onClick={() => router.push('/')}>Home</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="cursor-pointer hover:text-[#8f3546]" onClick={() => router.push('/search')}>Vendors</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-gray-800 font-semibold">{vendor.name}</span>
        </nav>

        {/* Hero Image */}
        <div className="relative h-64 md:h-150 w-full rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
          <img 
            src={vendor.image_url} 
            alt={vendor.name} 
            className="w-full h-full object-cover object-top"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512496015851-a1fb82e75bc7?w=500&q=80'; }}
          />
        </div>
        
        {/* Profile Header Card */}
        <div className="bg-white p-6 md:p-8 -mt-12 mx-4 md:mx-12 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{vendor.name}</h1>
              {vendor.featured && (
                <span className="bg-[#8f3546] text-white px-2 py-1 rounded text-[10px] uppercase tracking-[0.2em] font-bold">Elite</span>
              )}
            </div>
            <p className="text-gray-500 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {vendor.location}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* SAVE VENDOR BUTTON */}
            <button 
              onClick={handleSaveToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-bold transition-all shadow-sm ${isSaved ? 'bg-[#fff8f7] border-[#8f3546] text-[#8f3546]' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
            >
              <span className={`material-symbols-outlined text-lg ${isSaved ? 'icon-fill text-[#8f3546]' : 'text-gray-400'}`}>favorite</span>
              {isSaved ? 'Saved to Favorites' : 'Save Vendor'}
            </button>

            <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rating</span>
                <span className="text-sm text-gray-600 font-medium">{vendor.reviews} Reviews</span>
              </div>
              <div className="bg-[#8f3546] text-white px-4 py-2 rounded-lg font-bold text-lg flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined icon-fill text-lg">star</span> {vendor.rating}
              </div>
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
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'border-b-2 border-[#8f3546] text-[#8f3546]' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {tab === 'reviews' ? `Reviews (${reviewsList.length + vendor.reviews})` : tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Bride"/></div>
                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Bride"/></div>
                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1549416878-b9ca95e1e4cb?w=500&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Bride"/></div>
                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm"><img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Bride"/></div>
              </div>
            )}

            {/* TAB CONTENT: ABOUT */}
            {activeTab === 'about' && (
              <div className="space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About {vendor.name}</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Known for their exquisite attention to detail and flawless finish, {vendor.name} is one of the most sought-after artists in {vendor.location.split(',')[0]}. With years of experience catering to high-profile weddings, they specialize in enhancing natural beauty while delivering a picture-perfect look.
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {vendor.services_offered?.map((service, idx) => (
                      <span key={idx} className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold">{service}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                
                {/* AI Review Summary Section */}
                <div className="bg-gradient-to-r from-[#fff8f7] to-white border border-[#8f3546]/20 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-6xl">auto_awesome</span></div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#8f3546]">auto_awesome</span>
                    <h2 className="text-lg font-bold text-gray-900">AI Review Summary</h2>
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Based on {vendor.reviews} verified bridal reviews</p>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    <b className="text-[#8f3546]">What brides loved:</b> {vendor.name} is consistently praised for punctuality, a calm demeanor during wedding chaos, and delivering a flawless base that lasts over 12 hours without creasing. 
                  </p>
                </div>

                {/* WRITE REVIEW HEADER */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold text-gray-900">Bride Experiences</h3>
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-white border border-[#8f3546] text-[#8f3546] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#8f3546] hover:text-white transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_square</span>
                    Write a Review
                  </button>
                </div>

                {/* REVIEW FORM (Conditionally Rendered) */}
                {showReviewForm && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-[#8f3546]/20 shadow-md mb-8 animate-fade-in">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Rate your experience with {vendor.name}</h4>
                    
                    {/* Star Selector */}
                    <div className="flex gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          onClick={() => setNewRating(star)} 
                          className={`material-symbols-outlined text-3xl cursor-pointer transition-colors ${star <= newRating ? 'icon-fill text-[#8f3546]' : 'text-gray-200 hover:text-gray-300'}`}
                        >
                          star
                        </span>
                      ))}
                    </div>

                    <textarea 
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share details of your experience, the outcome, what you loved, or what could be improved..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#8f3546] focus:border-[#8f3546] mb-4 min-h-[120px]"
                    />

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleSubmitReview}
                        className="bg-[#8f3546] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#712030] transition-colors shadow-sm"
                      >
                        Publish Review
                      </button>
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="text-gray-500 hover:text-gray-800 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* REVIEWS LIST */}
                <div className="space-y-4">
                  {reviewsList.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#fff8f7] text-[#8f3546] border border-[#8f3546]/20 flex items-center justify-center font-bold text-lg">
                            {review.initial}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{review.author}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Reviewed on {review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-[#8f3546]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined text-sm ${star <= review.rating ? 'icon-fill' : 'text-gray-200'}`}>star</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        &quot;{review.text}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Sticky Booking Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Starting Price</p>
              <h3 className="text-3xl font-bold text-[#8f3546] mb-6">
                ₹{vendor.starting_price.toLocaleString()}
                <span className="text-xs text-gray-500 font-normal ml-1">/ function</span>
              </h3>
              
              <ul className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Includes Core Service
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Premium Products Ensured
                </li>
              </ul>

              <div className="mb-6">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">Select Event Date</label>
                <div className="relative border border-gray-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#8f3546] focus-within:border-[#8f3546] transition-all bg-gray-50">
                  <input 
                    type="date" 
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-gray-800 bg-transparent outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Token Advance to Secure Date</p>
                <p className="text-xl font-bold text-gray-900">₹5,000</p>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full bg-[#8f3546] hover:bg-[#712030] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isCheckoutLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-lg">lock</span>
                )}
                {isCheckoutLoading ? 'Opening Gateway...' : 'Pay Deposit to Book'}
              </button>
              
              <button 
                onClick={() => setShowPhone(!showPhone)}
                className="w-full bg-white hover:bg-gray-50 text-[#8f3546] border border-[#8f3546]/30 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all mt-3 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                {showPhone ? '+91 9810X XXXXX (Demo)' : 'View Phone Number'}
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-6 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs">verified_user</span> Payments secured via Razorpay
              </p>
            </div>
          </div>
          
        </div>
      
      </main>
      
    </div>
    
  );
}