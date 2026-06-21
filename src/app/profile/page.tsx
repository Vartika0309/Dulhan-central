/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';


export default function ProfilePage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no user is logged in, kick them back to the login page
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    }
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-[#fff8f7] flex items-center justify-center">Loading...</div>;
  if (!user) return null; // Prevents flashing before redirect

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-body-custom { font-family: 'Libre Caslon Text', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
      `}} />

      <NavBar />

      <main className="max-w-5xl mx-auto px-6 md:px-16 pt-32 pb-20">
        
        {}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="w-24 h-24 bg-[#8f3546]/10 text-[#8f3546] rounded-full flex items-center justify-center text-4xl font-display-custom font-bold shrink-0">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="font-display-custom text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-500 font-medium">{user.email}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="border border-gray-200 text-gray-600 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {}
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'border-b-2 border-[#8f3546] text-[#8f3546]' : 'text-gray-400 hover:text-gray-800'}`}
          >
            My Bookings
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'saved' ? 'border-b-2 border-[#8f3546] text-[#8f3546]' : 'text-gray-400 hover:text-gray-800'}`}
          >
            Saved Vendors
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-[#8f3546] text-[#8f3546]' : 'text-gray-400 hover:text-gray-800'}`}
          >
            Settings
          </button>
        </div>

        {}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h3 className="font-display-custom text-2xl font-bold mb-4">Upcoming Appointments</h3>
            
            {/* Mock Booking Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">
              <div className="w-full md:w-32 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1512496015851-a1fb82e75bc7?w=500&q=80" className="w-full h-full object-cover" alt="Vendor" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Confirmed</span>
                  <span className="text-gray-400 text-xs font-semibold">Booking #B-8492</span>
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-1">Parul Garg Makeup</h4>
                <p className="text-sm text-gray-500">Bridal HD Makeup • Paid Deposit: ₹5,000</p>
              </div>
              <div className="text-center md:text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Event Date</p>
                <p className="font-bold text-[#8f3546] text-lg">Oct 14, 2026</p>
                <button className="text-xs text-gray-500 underline mt-2 hover:text-[#8f3546]">View Receipt</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">favorite</span>
            <h3 className="font-display-custom text-xl font-bold text-gray-900 mb-2">No saved vendors yet</h3>
            <p className="text-gray-500 text-sm mb-6">Browse our directory and click the heart icon to save your favorite artists.</p>
            <Link href="/search">
              <button className="bg-[#8f3546] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#712030] transition-colors">Browse Artists</button>
            </Link>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-xl">
            <h3 className="font-display-custom text-xl font-bold mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                <input type="email" disabled value={user.email} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-gray-500 cursor-not-allowed" />
              </div>
              <button className="text-sm text-[#8f3546] font-bold hover:underline">Change Password</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}