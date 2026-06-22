'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#8f3546] text-white w-full font-sans-custom">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-16 py-20 w-full">
        <div className="md:col-span-1 mb-8 md:mb-0">
          <Link href="/" className="font-display-custom text-2xl text-white block mb-6 font-bold leading-none tracking-tighter hover:opacity-80 transition-opacity">
            DULHAN<br/>CENTRAL
          </Link>
          <p className="text-sm text-pink-100 mb-6 max-w-xs leading-relaxed opacity-90">
            Curating India's finest bridal artists and luxury services for the modern bride.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-pink-200 mb-6">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">About Us</Link></li>
            <li><Link href="/register" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">Vendor Registration</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-pink-200 mb-6">Services</h4>
          <ul className="space-y-4">
            <li><Link href="/search" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">Bridal Makeup</Link></li>
            <li><Link href="/mehendi" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">Mehendi Artists</Link></li>
            <li><Link href="/#inspiration-gallery" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">Inspiration Gallery</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-pink-200 mb-6">Support</h4>
          <ul className="space-y-4">
            <li><Link href="/contact" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">Contact Support</Link></li>
            <li><Link href="/privacy" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-sm text-pink-50 hover:text-white hover:underline transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 md:px-16 py-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-pink-200/70">
        <p>© {new Date().getFullYear()} DULHAN CENTRAL. PREMIER BRIDAL MARKETPLACE.</p>
        <div className="mt-4 md:mt-0">
          <span>Designed for AI Startup Buildathon 2026</span>
        </div>
      </div>
    </footer>
  );
}