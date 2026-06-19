/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

// Define Vendor Interface
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

export default function VendorProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Fetch specific vendor data from Supabase
  useEffect(() => {
    async function fetchVendorDetails() {
      try {
        const { data, error } = await supabase
          .from('vendor')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setVendor(data as Vendor);
      } catch (error) {
        console.error('Error fetching vendor:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  // Dynamically load the Razorpay checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Razorpay Checkout Trigger
  const handleCheckout = async () => {
    setIsCheckoutLoading(true);

    try {
      // 1. Load the script overlay
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Failed to load Razorpay SDK. Check your internet connection.');
        setIsCheckoutLoading(false);
        return;
      }

      // 2. Call your backend API route to build the order
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor?.id,
          vendorName: vendor?.name,
          amount: 5000, // Fixed Booking deposit of ₹5,000
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.id) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 3. Configure Razorpay overlay properties
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Dulhan Central',
        description: `Securing Deposit for ${vendor?.name}`,
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80',
        order_id: orderData.id,
        handler: function (response: any) {
          alert(`🎉 Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}`);
          router.push('/search');
        },
        prefill: {
          name: 'Bridal Client',
          email: 'bride@example.com',
          contact: '9999999999',
        },
        notes: {
          vendor_id: vendor?.id,
        },
        theme: {
          color: '#8f3546', // Custom corporate brand color
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'An error occurred during checkout setup.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#8f3546]/20 border-t-[#8f3546] rounded-full animate-spin mb-4"></div>
          <h2 className="text-[#8f3546] font-bold tracking-widest uppercase text-sm">Loading Portfolio</h2>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f7]">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Artist Not Found</h1>
        <button onClick={() => router.push('/search')} className="text-[#8f3546] font-bold hover:underline">
          &larr; Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen pb-20">
      {/* Font & Icons Setup */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-body-custom { font-family: 'Libre Caslon Text', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
      `}} />

      {/* Top Header Navbar */}
      <header className="bg-white border-b border-gray-100 flex justify-between items-center w-full px-6 md:px-16 py-4 fixed top-0 z-50 shadow-sm">
        <Link href="/" className="font-display-custom text-2xl font-bold text-[#8f3546] tracking-tighter">
          DULHAN CENTRAL
        </Link>
        <button onClick={() => router.push('/search')} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#8f3546] flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Search
        </button>
      </header>

      {/* Hero Header Area */}
      <div className="w-full h-[40vh] md:h-[55vh] mt-[68px] relative bg-gray-900">
        <img 
          src={vendor.image_url} 
          alt={vendor.name} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-16 pb-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-white">
              {vendor.featured && (
                <span className="bg-[#8f3546] text-white px-3 py-1 rounded-md text-[10px] uppercase tracking-[0.2em] font-bold shadow-md mb-4 inline-block">
                  Elite Artist
                </span>
              )}
              <h1 className="font-display-custom text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
                {vendor.name}
              </h1>
              <p className="flex items-center gap-2 text-white/90 mt-2 text-sm md:text-base font-medium">
                <span className="material-symbols-outlined text-lg">location_on</span>
                {vendor.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Structural Breakdown Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Layout Content Frame */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Structural Overview Meta Block */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-wrap gap-8 items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  <span className="bg-[#8f3546] text-white px-2 py-1 rounded flex items-center gap-1 text-sm font-bold shadow-sm">
                    <span className="material-symbols-outlined text-sm">star</span>
                    {vendor.rating}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">({vendor.reviews} Reviews)</span>
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Service Mode</p>
                <div className="flex gap-2">
                  {vendor.service_mode?.map(mode => (
                    <span key={mode} className="text-sm text-gray-800 font-medium capitalize bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanatory Context Content Block */}
            <div>
              <h2 className="font-display-custom text-2xl font-bold text-gray-900 mb-4">About the Artist</h2>
              <p className="text-gray-600 font-body-custom leading-relaxed text-lg">
                Known for their exquisite attention to detail and flawless finish, {vendor.name} is one of the most sought-after bridal makeup artists in {vendor.location.split(',')[0]}. With years of experience catering to high-profile weddings, they specialize in enhancing natural beauty while delivering a picture-perfect look that lasts from the ceremony to the reception. 
              </p>
            </div>

            {/* Specialization Scope Block */}
            <div>
              <h2 className="font-display-custom text-2xl font-bold text-gray-900 mb-4">Services Offered</h2>
              <div className="flex flex-wrap gap-3">
                {vendor.services_offered?.map((service, idx) => (
                  <span key={idx} className="bg-white border border-[#8f3546]/20 text-[#8f3546] px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Static Visual Demonstration Container */}
            <div>
              <h2 className="font-display-custom text-2xl font-bold text-gray-900 mb-4">Recent Brides</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Bride 1"/>
                </div>
                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Bride 2"/>
                </div>
                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden hidden md:block">
                  <img src="https://images.unsplash.com/photo-1549416878-b9ca95e1e4cb?w=500&q=80" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Bride 3"/>
                </div>
              </div>
            </div>
          </div>

          {/* Right Layout Sticky Transaction Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Starting Price</p>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                ₹{vendor.starting_price.toLocaleString()}
                <span className="text-sm text-gray-500 font-normal ml-2">/ event</span>
              </h3>
              
              <div className="bg-[#fff8f7] border border-[#8f3546]/10 rounded-xl p-4 mb-6">
                <p className="text-xs text-[#8f3546] font-bold uppercase tracking-wider mb-1">Securing Deposit</p>
                <p className="text-xl font-bold text-[#8f3546]">₹5,000</p>
                <p className="text-[11px] text-gray-500 mt-1">Pay this flat platform token fee to securely reserve your booking slot today.</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-[#8f3546] text-lg">check_circle</span>
                  Includes Draping & Hair Design
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-[#8f3546] text-lg">check_circle</span>
                  Premium HD Products Ensured
                </li>
              </ul>

              {/* Razorpay Call-To-Action Transaction Trigger Button */}
              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full bg-[#8f3546] hover:bg-[#712030] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isCheckoutLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Opening Razorpay...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">shopping_bag</span>
                    Pay Deposit to Book
                  </>
                )}
              </button>
              
              {/* Context Reveal Action Button */}
              <button 
                onClick={() => setShowPhone(!showPhone)}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all mt-3 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">call</span>
                {showPhone ? '+91 9810X XXXXX (Demo)' : 'View Phone Number'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-6">
                Payments secured natively via Razorpay Test Gateway.
              </p>
            </div>
          </div>
          {/* AI Review Summary Section */}
          <div className="mt-12 bg-gradient-to-r from-[#fff8f7] to-white border border-[#8f3546]/20 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">auto_awesome</span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#8f3546]">auto_awesome</span>
              <h2 className="font-display-custom text-xl font-bold text-gray-900">AI Review Summary</h2>
            </div>
            
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-4">
              Based on {vendor.reviews} verified bridal reviews
            </p>
            
            <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base">
              <b className="text-[#8f3546]">What brides loved:</b> {vendor.name} is consistently praised for punctuality, a calm demeanor during wedding chaos, and delivering a flawless, "dewy but natural" base that lasts over 12 hours without creasing. 
              <br/><br/>
              <b className="text-[#8f3546]">Good to know:</b> Books out 6-8 months in advance for peak winter dates. Brides highly recommend requesting a paid trial session.
            </p>
          </div>
                
          {/* Verified Bride Reviews Section */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display-custom text-2xl font-bold text-gray-900">Verified Bride Reviews</h2>
                <button className="text-xs font-bold uppercase tracking-widest text-[#8f3546] hover:underline">
                  Read all {vendor.reviews}
                </button>
              </div>

              <div className="space-y-6">
                {/* Dummy Review 1 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#fff8f7] text-[#8f3546] flex items-center justify-center font-display-custom font-bold text-lg">
                        S
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Sneha Sharma</h4>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Married on Nov 12, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-[#8f3546]">
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "I booked {vendor.name} for my main wedding day and my reception, and it was the best decision! They understood exactly what I meant by 'minimal but glowing.' My makeup didn't budge even after hours of dancing and crying. Highly recommend!"
                  </p>
                </div>

                {/* Dummy Review 2 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#fff8f7] text-[#8f3546] flex items-center justify-center font-display-custom font-bold text-lg">
                        A
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Ananya Verma</h4>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Married on Oct 28, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-[#8f3546]">
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm text-gray-300 icon-fill">star</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "Very professional and punctual. The team arrived right on time despite the Delhi traffic. The draping was secure and the eye makeup was stunning. Took off one star only because the trial session felt a bit rushed, but the final day was perfect."
                  </p>
                </div>

                {/* Dummy Review 3 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#fff8f7] text-[#8f3546] flex items-center justify-center font-display-custom font-bold text-lg">
                        R
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Riya Kapoor</h4>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Married on Sep 05, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-[#8f3546]">
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                      <span className="material-symbols-outlined text-sm icon-fill">star</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "Absolutely magical experience! {vendor.name} is truly an artist. They kept me calm when the venue was chaotic and made me feel like an absolute queen. The HD products used felt completely weightless on my skin."
                  </p>
                </div>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}
