'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';
import Footer from '@/components/footer';

export default function LoginPage() {
  const router = useRouter();
  
  // UI State
  const [accountType, setAccountType] = useState<'bride' | 'vendor'>('bride');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // CHECK ROLE AND REDIRECT DYNAMICALLY
      if (data?.user) {
        const isVendor = (data.user.user_metadata as any)?.role === 'vendor';
        if (isVendor) {
          router.push('/dashboard/vendor');
        } else {
          router.push('/profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f7] font-sans-custom flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
      `}} />
      
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-28 mt-8">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="font-display-custom text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-sm text-gray-500">Sign in to manage your bookings and saved artists.</p>
          </div>

          {/* Bride vs Vendor Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-8 relative">
            <button 
              onClick={() => setAccountType('bride')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all z-10 ${accountType === 'bride' ? 'text-[#8f3546] shadow-sm bg-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              I'm a Bride
            </button>
            <button 
              onClick={() => setAccountType('vendor')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all z-10 ${accountType === 'vendor' ? 'text-[#8f3546] shadow-sm bg-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              I'm a Vendor
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f3546] focus:border-transparent transition-all bg-gray-50"
                placeholder={accountType === 'vendor' ? 'vendor@example.com' : 'bride@example.com'}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f3546] focus:border-transparent transition-all bg-gray-50"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8f3546] hover:bg-[#712030] text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-md disabled:opacity-70 flex justify-center mt-2"
            >
              {loading ? 'Authenticating...' : `Secure Login as ${accountType === 'vendor' ? 'Vendor' : 'User'}`}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#8f3546] font-bold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}