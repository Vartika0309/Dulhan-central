'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Helper function: Increased font size to text-sm (approx 14px) and adjusted padding
  const getNavLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `text-sm uppercase tracking-wider cursor-pointer transition-colors pb-1 ${
      isActive 
        ? 'text-[#8f3546] font-bold border-b-2 border-[#8f3546]' 
        : 'text-gray-600 hover:text-[#8f3546] font-medium'
    }`;
  };

  return (
    <header className="bg-white border-b border-gray-100 flex justify-between items-center w-full px-6 md:px-16 py-4 fixed top-0 z-50 shadow-sm font-sans-custom">
      <Link href="/" className="font-display-custom text-2xl md:text-[32px] font-bold text-[#8f3546] tracking-tighter hover:opacity-80 transition-opacity">
        DULHAN CENTRAL
      </Link>
      
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/">
            <span className="text-gray-500 hover:text-[#8f3546] transition-colors text-[15px] uppercase tracking-widest cursor-pointer">Home</span>
          </Link>
          <Link href="/search">
            <span className="text-gray-500 hover:text-[#8f3546] transition-colors text-[15px] uppercase tracking-widest cursor-pointer">Makeup</span>
          </Link>
          <Link href="/mehendi">
            <span className="text-gray-500 hover:text-[#8f3546] transition-colors text-[15px] uppercase tracking-widest cursor-pointer">Mehendi</span>
          </Link>
        </nav>

      
      <div className="flex items-center gap-4 md:gap-6">
        {user ? (
          <>
            <Link href="/profile" className={getNavLinkClass('/profile')}>
              My Profile
            </Link>
            <button 
              onClick={handleLogout} 
              // Increased button text to text-sm and adjusted padding
              className="text-sm uppercase tracking-wider text-white bg-gray-800 px-5 py-2.5 hover:bg-black transition-colors font-semibold shadow-sm rounded-lg"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/login" 
              // Increased button text to text-sm and adjusted padding
              className="text-sm uppercase tracking-wider text-white bg-[#8f3546] px-6 py-2.5 hover:bg-[#712030] transition-colors font-semibold shadow-sm rounded-lg"
            >
              User Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}