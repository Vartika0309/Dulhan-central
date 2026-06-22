'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';

export default function VendorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check Makeup table
      let { data } = await supabase.from('vendor').select('*').eq('user_id', user.id).single();
      
      // If not found, check Mehendi table
      if (!data) {
        const { data: mData } = await supabase.from('mehendi').select('*').eq('user_id', user.id).single();
        data = mData;
      }
      setProfile(data);
      setLoading(false);
    }
    getProfile();
  }, []);

  if (loading) return <div className="p-20 text-center text-gray-500">Loading your business profile...</div>;

  return (
    <div className="min-h-screen bg-[#fffcfb] font-sans-custom">
      {/* Top Navigation */}
      <NavBar />
      
      {/* Main Content Area 
        Added pt-24 (padding-top) so the fixed NavBar doesn't cover the content 
      */}
      <main className="max-w-5xl mx-auto pt-28 pb-16 px-6 md:px-10">
        
        {!profile ? (
          <div className="text-center bg-white p-10 rounded-xl shadow border">
            <h2 className="text-xl font-semibold text-gray-800">No profile found.</h2>
            <p className="text-gray-500 mt-2">Please ensure you have registered your business details.</p>
          </div>
        ) : (
          <>
            {/* 1. Profile Header Section (Image + Name) */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              
              {/* Profile Image Display */}
              {profile.image_url ? (
                <img 
                  src={profile.image_url} 
                  alt={profile.name} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#8f3546]/10 shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-50">
                  <span className="text-gray-400 text-sm font-medium">No Image</span>
                </div>
              )}
              
              {/* Greeting & ID */}
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-display-custom mb-2">
                  Hello, {profile.name}
                </h1>
                <p className="text-gray-500 font-medium tracking-wide">
                  Business ID: <span className="text-[#8f3546]">{profile.id}</span>
                </p>
              </div>
            </div>
            
            {/* 2. Details Grid Section */}
            <div className="grid md:grid-cols-2 gap-8">
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">Business Details</h2>
                <div className="space-y-4">
                  <p className="flex justify-between text-gray-600">
                    <strong className="text-gray-900">Location:</strong> {profile.location}
                  </p>
                  <p className="flex justify-between text-gray-600">
                    <strong className="text-gray-900">Starting Price:</strong> ₹{profile.starting_price}
                  </p>
                  <p className="flex justify-between text-gray-600">
                    <strong className="text-gray-900">Rating:</strong> 
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded text-sm font-bold">
                      {profile.rating} ★
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">Services Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.services_offered?.map((s: string) => (
                    <span 
                      key={s} 
                      className="bg-[#8f3546]/10 text-[#8f3546] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#8f3546]/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              
            </div>
          </>
        )}
      </main>
    </div>
  );
}