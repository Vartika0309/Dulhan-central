'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close the mobile menu automatically when the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  // Determine the correct link and text based on the user's role
  const isVendor = user?.user_metadata?.role === 'vendor';
  const profileRoute = isVendor ? '/dashboard/vendor' : '/profile';
  const profileText = isVendor ? 'Dashboard' : 'Profile';

  return (
    <header className="bg-white border-b border-gray-100 w-full fixed top-0 z-50 shadow-sm font-sans-custom">
      <div className="flex justify-between items-center px-6 md:px-16 py-4">
        
        {/* Logo (Left) */}
        <div className="z-50">
          <Link href="/" className="font-display-custom text-2xl md:text-[32px] font-bold text-[#8f3546] tracking-tighter hover:opacity-80 transition-opacity">
            DULHAN CENTRAL
          </Link>
        </div>
        
        {/* Desktop Navigation Links (Center) */}
        <nav className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
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
            <span className={`text-[15px] uppercase tracking-widest cursor-pointer transition-colors ${pathname === '/ai-scan' ? 'text-[#8f3546] font-bold' : 'text-gray-500 hover:text-[#8f3546]'}`}>Beauty Scan</span>
          </Link>
        </nav>

        {/* Desktop Actions (Right) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
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

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#8f3546] hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 top-[full] flex flex-col px-6 py-6 gap-5 animate-in slide-in-from-top-2 duration-200">
          <Link href="/" className={`text-base uppercase tracking-widest ${pathname === '/' ? 'text-[#8f3546] font-bold' : 'text-gray-600'}`}>
            Home
          </Link>
          <Link href="/search" className={`text-base uppercase tracking-widest ${pathname === '/search' ? 'text-[#8f3546] font-bold' : 'text-gray-600'}`}>
            Makeup
          </Link>
          <Link href="/mehendi" className={`text-base uppercase tracking-widest ${pathname === '/mehendi' ? 'text-[#8f3546] font-bold' : 'text-gray-600'}`}>
            Mehendi
          </Link>
          <Link href="/ai-scan" className={`text-base uppercase tracking-widest ${pathname === '/ai-scan' ? 'text-[#8f3546] font-bold' : 'text-gray-600'}`}>
            Beauty Scan
          </Link>
          
          <hr className="border-gray-100 my-1" />
          
          {user ? (
            <div className="flex flex-col gap-3">
              <Link href={profileRoute} className="text-base uppercase tracking-widest text-[#8f3546] font-bold">
                {profileText}
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-sm uppercase tracking-wider text-white bg-gray-800 px-5 py-3 hover:bg-black transition-colors font-semibold shadow-sm rounded-lg text-center w-full mt-2"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/login" className="text-sm uppercase tracking-wider text-[#8f3546] border border-[#8f3546] px-6 py-3 hover:bg-[#fff8f7] transition-colors font-semibold rounded-lg text-center">
                Login
              </Link>
              <Link href="/register" className="text-sm uppercase tracking-wider text-white bg-[#8f3546] px-6 py-3 hover:bg-[#712030] transition-colors font-semibold shadow-sm rounded-lg text-center">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}