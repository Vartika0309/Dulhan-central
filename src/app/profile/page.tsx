'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBar';

// Dummy booking data based on your screenshot
const dummyBookings = [
  {
    id: 'B-8492',
    vendorName: 'Parul Garg Makeup',
    service: 'Bridal HD Makeup',
    deposit: 5000,
    date: 'Oct 14',
    year: '2026',
    status: 'CONFIRMED',
    imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&q=80',
  }
];

export default function BrideProfile() {
  // --- STATES ---
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const router = useRouter();

  // Settings States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | '', msg: string }>({ type: '', msg: '' });
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);

  // --- LIFECYCLE ---
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    }
    getUser();
  }, [router]);

  // --- HANDLERS ---
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: '', msg: '' });

    if (newPassword !== confirmPassword) {
      return setPasswordStatus({ type: 'error', msg: 'Passwords do not match.' });
    }
    if (newPassword.length < 6) {
      return setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters.' });
    }

    setIsUpdatingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPwd(false);

    if (error) {
      setPasswordStatus({ type: 'error', msg: error.message });
    } else {
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handlePfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPfp(true);
    // Note: To make this work fully, ensure you have a public 'avatars' bucket in Supabase
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      /* UNCOMMENT THIS ONCE YOUR BUCKET IS READY
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update user metadata with the new image
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      setUser({ ...user, user_metadata: { ...user.user_metadata, avatar_url: publicUrl } });
      */
      
      // Temporary simulation for UI feedback
      setTimeout(() => {
        alert("Image upload UI ready! Uncomment the Supabase storage code in handlePfpUpload to enable saving.");
        setIsUploadingPfp(false);
      }, 1000);

    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
      setIsUploadingPfp(false);
    }
  };

  // --- RENDER HELPERS ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#8f3546]/20 border-t-[#8f3546] rounded-full animate-spin mb-4"></div>
          <h2 className="text-[#8f3546] font-bold tracking-widest uppercase text-sm">Loading Profile...</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const emailName = user.email?.split('@')[0] || 'Bride';
  const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[0-9]/g, '');
  const initials = firstName.charAt(0).toUpperCase();
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
      `}} />

      <Navbar />

      <main className="max-w-5xl mx-auto px-6 md:px-12 pt-32">
        
        {/* --- PREMIUM HERO HEADER --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#8f3546]/10 p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8f3546]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#d67b8c]/5 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10 text-center md:text-left">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#8f3546] to-[#d67b8c] p-1 shadow-md relative overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full border-2 border-white" />
              ) : (
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-3xl md:text-4xl font-display-custom font-bold text-[#8f3546]">
                  {initials}
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Your Bridal Profile</p>
              <h1 className="text-3xl md:text-4xl font-display-custom font-bold text-gray-900 mb-2">
                Welcome, {firstName}
              </h1>
              <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
                <span className="material-symbols-outlined text-[18px] text-gray-400">mail</span>
                {user.email}
              </p>
            </div>
          </div>

          <button 
            onClick={handleSignOut} 
            className="z-10 bg-white border border-gray-200 hover:border-[#8f3546] hover:text-[#8f3546] text-gray-600 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>

        {/* --- STICKY TABS --- */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 sticky top-[72px] bg-[#fff8f7] z-30 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'bookings', label: 'My Bookings', icon: 'calendar_month' },
            { id: 'saved', label: 'Saved Vendors', icon: 'favorite' },
            { id: 'settings', label: 'Settings', icon: 'settings' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-[#8f3546] text-[#8f3546]' : 'text-gray-400 hover:text-gray-800'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="min-h-[400px]">
          
          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-display-custom font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
              <div className="space-y-6">
                {dummyBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row group">
                    <div className="w-full md:w-56 h-56 md:h-auto bg-gray-100 relative overflow-hidden">
                      <img src={booking.imageUrl} alt={booking.vendorName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-green-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span> {booking.status}
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center bg-white">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Booking #{booking.id}</p>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{booking.vendorName}</h3>
                      <p className="text-gray-600 mb-6 font-medium">{booking.service}</p>
                      <div className="inline-flex items-center gap-2 bg-[#fff8f7] text-[#8f3546] px-4 py-2 rounded-xl text-sm font-bold w-fit border border-[#8f3546]/10">
                        <span className="material-symbols-outlined text-[20px]">payments</span> Paid Deposit: ₹{booking.deposit.toLocaleString()}
                      </div>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-dashed border-gray-200 p-6 md:p-8 md:w-64 flex flex-col items-center justify-center bg-gray-50/50 relative">
                      <div className="hidden md:block absolute -left-3 top-[-12px] w-6 h-6 bg-[#fff8f7] rounded-full border-b border-gray-100"></div>
                      <div className="hidden md:block absolute -left-3 bottom-[-12px] w-6 h-6 bg-[#fff8f7] rounded-full border-t border-gray-100"></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Event Date</p>
                      <p className="text-4xl font-display-custom font-bold text-[#8f3546] mb-1">{booking.date}</p>
                      <p className="text-sm text-gray-500 font-bold mb-6">{booking.year}</p>
                      <button className="text-xs font-bold uppercase tracking-widest text-[#8f3546] hover:text-gray-900 transition-colors flex items-center gap-1 group/btn">
                        View Receipt <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAVED VENDORS TAB */}
          {activeTab === 'saved' && (
            <div className="animate-fade-in bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-[#fff8f7] rounded-full flex items-center justify-center mx-auto mb-6 text-[#8f3546]">
                <span className="material-symbols-outlined text-4xl">favorite</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Vendors Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">Explore our curated list of makeup artists and mehendi designers to start building your dream team.</p>
              <button onClick={() => router.push('/search')} className="bg-[#8f3546] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#712030] transition-colors shadow-sm">
                Explore Vendors
              </button>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm space-y-12">
              
              {/* 1. Profile Picture Update */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8f3546]">account_circle</span>
                  Profile Picture
                </h3>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-[#8f3546] font-display-custom text-3xl font-bold">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div>
                    <label className="bg-white border border-gray-300 hover:border-[#8f3546] text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm flex items-center gap-2 w-fit">
                      {isUploadingPfp ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                      )}
                      {isUploadingPfp ? 'Uploading...' : 'Upload New Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePfpUpload} disabled={isUploadingPfp} />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 2. Password Management */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8f3546]">lock</span>
                  Security & Password
                </h3>
                <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#8f3546] focus:border-[#8f3546] outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#8f3546] focus:border-[#8f3546] outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  {passwordStatus.msg && (
                    <p className={`text-sm ${passwordStatus.type === 'error' ? 'text-red-500' : 'text-green-600'} flex items-center gap-1 font-medium`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {passwordStatus.type === 'error' ? 'error' : 'check_circle'}
                      </span>
                      {passwordStatus.msg}
                    </p>
                  )}

                  <button 
                    type="submit" 
                    disabled={isUpdatingPwd}
                    className="bg-[#22191a] hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm mt-2 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    {isUpdatingPwd && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    Update Password
                  </button>
                </form>
              </section>

              <hr className="border-gray-100" />

              {/* 3. Notification Preferences */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8f3546]">notifications</span>
                  Notification Preferences
                </h3>
                <div className="space-y-6 max-w-lg">
                  
                  {/* Email Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Email Notifications</p>
                      <p className="text-xs text-gray-500 mt-0.5">Receive booking confirmations and receipts via email.</p>
                    </div>
                    <button 
                      onClick={() => setEmailNotifs(!emailNotifs)}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${emailNotifs ? 'bg-[#8f3546]' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${emailNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </button>
                  </div>

                  {/* SMS Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">SMS Reminders</p>
                      <p className="text-xs text-gray-500 mt-0.5">Get text alerts 24 hours before your scheduled event.</p>
                    </div>
                    <button 
                      onClick={() => setSmsNotifs(!smsNotifs)}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${smsNotifs ? 'bg-[#8f3546]' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${smsNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </button>
                  </div>

                </div>
              </section>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}