'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';
import Footer from '@/components/footer';

// Define TypeScript Interfaces
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

export default function VendorDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Get the currently logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        let currentProfile = null;
        let isVendor = true; // Flag to track which table we found them in

        // 2. Try fetching from the 'vendor' table first
        const { data: vendorData } = await supabase
          .from('vendor')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (vendorData) {
          currentProfile = vendorData;
        } else {
          // 3. If not found in vendor, try the 'mehendi' table
          const { data: mehendiData } = await supabase
            .from('mehendi')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (mehendiData) {
            currentProfile = mehendiData;
            isVendor = false;
          }
        }

        // 4. If a profile was found, fetch their specific reviews
        if (currentProfile) {
          setProfile(currentProfile);

          // Determine which ID column to check in the reviews table
          const idColumn = isVendor ? 'vendor_id' : 'mehendi_id';

          const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .select('*')
            .eq(idColumn, currentProfile.id)
            .order('created_at', { ascending: false });

          if (reviewError) throw reviewError;
          if (reviewData) setReviews(reviewData);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', JSON.stringify(error, null, 2));
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Format dates securely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // --- DYNAMIC MATH CALCULATION ---
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
        <div className="w-10 h-10 border-4 border-[#8f3546] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}} />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-16 pt-28 pb-20">
        
        {!profile ? (
          <div className="text-center bg-white p-10 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">No profile found.</h2>
            <p className="text-gray-500 mt-2">Please ensure you have registered your business details.</p>
          </div>
        ) : (
          <>
            {/* 1. Profile Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              
              {/* Profile Image */}
              {profile.image_url ? (
                <img 
                  src={profile.image_url} 
                  alt={profile.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#8f3546]/10 shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#fff8f7] flex items-center justify-center border-4 border-[#8f3546]/10">
                  <span className="material-symbols-outlined text-4xl text-[#8f3546]/50">storefront</span>
                </div>
              )}
              
              {/* Greeting & Details */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-display-custom mb-2">
                  Welcome back, <span className="text-[#8f3546]">{profile.name}</span>
                </h1>
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-gray-600 mt-3">
                  <p className="flex justify-center md:justify-start items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    ID: {profile.id}
                  </p>
                  <p className="flex justify-center md:justify-start items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {profile.location}
                  </p>
                  <p className="flex justify-center md:justify-start items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    Starts at ₹{profile.starting_price}
                  </p>
                </div>

                {/* Services Tags */}
                {profile.services_offered && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                    {profile.services_offered.map((s: string) => (
                      <span key={s} className="bg-[#8f3546]/10 text-[#8f3546] px-3 py-1 rounded-full text-xs font-semibold border border-[#8f3546]/20">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. STATS BLOCK (Updated with Dynamic Math) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center">
                    <span className="material-symbols-outlined icon-fill">star</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{averageRating}</h3>
                  <p className="text-sm font-semibold text-gray-700">Average Rating</p>
                  <p className="text-xs text-gray-400 mt-1">Across all bookings</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center">
                    <span className="material-symbols-outlined icon-fill">forum</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalReviews}</h3>
                  <p className="text-sm font-semibold text-gray-700">Total Reviews</p>
                  <p className="text-xs text-gray-400 mt-1">Lifetime feedback</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center">
                    <span className="material-symbols-outlined icon-fill">favorite</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">45</h3>
                  <p className="text-sm font-semibold text-gray-700">Total Leads</p>
                  <p className="text-xs text-gray-400 mt-1">+5 this month</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fff8f7] text-[#8f3546] flex items-center justify-center">
                    <span className="material-symbols-outlined icon-fill">visibility</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">1,248</h3>
                  <p className="text-sm font-semibold text-gray-700">Profile Views</p>
                  <p className="text-xs text-gray-400 mt-1">+12% this week</p>
                </div>
              </div>
            </div>

            {/* 3. REVIEWS COLUMN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="font-display-custom text-2xl font-bold text-gray-900">Client Feedback</h2>
                  <p className="text-sm text-gray-500 mt-1">See what your recent brides are saying about your services.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filter
                </button>
              </div>

              <div className="space-y-8">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews found for this profile yet.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{review.client_name}</h4>
                          <p className="text-xs text-gray-400">Reviewed on {formatDate(review.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#fff8f7] border border-[#8f3546]/20 px-3 py-1 rounded-full text-xs font-bold text-[#8f3546]">
                          <span className="material-symbols-outlined icon-fill text-sm">star</span>
                          <span>{review.rating}.0</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                        "{review.review_text}"
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {review.liked && (
                          <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-green-800 font-bold text-xs uppercase tracking-wider mb-2">
                              <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                              What they loved
                            </div>
                            <p className="text-sm text-green-900">{review.liked}</p>
                          </div>
                        )}
                        
                        {review.disliked && (
                          <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider mb-2">
                              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                              Room for improvement
                            </div>
                            <p className="text-sm text-red-900">{review.disliked}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {reviews.length > 0 && (
                <div className="mt-8 text-center pt-8 border-t border-gray-50">
                  <button className="text-[#8f3546] text-sm font-bold hover:underline">
                    Load More Reviews ↓
                  </button>
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