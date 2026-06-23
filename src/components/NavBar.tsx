'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // 1. Determine the correct link and text based on the user's role
  const isVendor = user?.user_metadata?.role === 'vendor';
  const profileRoute = isVendor ? '/dashboard/vendor' : '/profile';
  const profileText = isVendor ? 'Dashboard' : 'Profile';

  return (
    <header className="bg-white border-b border-gray-100 grid grid-cols-3 items-center w-full px-6 md:px-16 py-4 fixed top-0 z-50 shadow-sm font-sans-custom">
      
      {/* Col 1: Logo (Left) */}
      <div className="justify-self-start">
        <Link href="/" className="font-display-custom text-2xl md:text-[32px] font-bold text-[#8f3546] tracking-tighter hover:opacity-80 transition-opacity">
          DULHAN CENTRAL
        </Link>
      </div>
      
      {/* Col 2: Navigation Links (Center) */}
      <nav className="hidden md:flex gap-8 justify-self-center">
        <Link href="/">
          <span className={`text-[15px] uppercase tracking-widest cursor-pointer transition-colors ${pathname === '/' ? 'text-[#8f3546] font-bold' : 'text-gray-500 hover:text-[#8f3546]'}`}>Home</span>
        </Link>
        <Link href="/search">
          <span className={`text-[15px] uppercase tracking-widest cursor-pointer transition-colors ${pathname === '/search' ? 'text-[#8f3546] font-bold' : 'text-gray-500 hover:text-[#8f3546]'}`}>Makeup</span>
        </Link>
        <Link href="/mehendi">
          <span className={`text-[15px] uppercase tracking-widest cursor-pointer transition-colors ${pathname === '/mehendi' ? 'text-[#8f3546] font-bold' : 'text-gray-500 hover:text-[#8f3546]'}`}>Mehendi</span>
        </Link>
        
        <Link href="/ai-scan">          
        <span className={`text-[15px] uppercase tracking-widest cursor-pointer transition-colors ${pathname === '/ai-scan' ? 'text-[#8f3546] font-bold' : 'text-gray-500 hover:text-[#8f3546]'}`}>
  Beauty Scan</span>
</Link>
      </nav>

      {/* Col 3: Actions (Right) */}
      <div className="flex items-center gap-3 justify-self-end">
        {user ? (
          <>
            {/* 2. Use the dynamic route and text here */}
            <Link href={profileRoute} className="text-sm uppercase tracking-wider text-gray-600 hover:text-[#8f3546] font-medium">
              {profileText}
            </Link>
            <button 
              onClick={handleLogout} 
              className="text-sm uppercase tracking-wider text-white bg-gray-800 px-5 py-2.5 hover:bg-black transition-colors font-semibold shadow-sm rounded-lg"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm uppercase tracking-wider text-[#8f3546] border border-[#8f3546] px-6 py-2.5 hover:bg-[#fff8f7] transition-colors font-semibold rounded-lg">
              Login
            </Link>
            <Link href="/register" className="text-sm uppercase tracking-wider text-white bg-[#8f3546] px-6 py-2.5 hover:bg-[#712030] transition-colors font-semibold shadow-sm rounded-lg">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}