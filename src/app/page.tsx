'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BeautyBot from '../components/BeautyBot';

export default function HomePage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/search');
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans-custom">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-body-custom { font-family: 'Libre Caslon Text', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        .icon-fill { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header */}
      <header 
        className={`border-b border-outline-variant sticky top-0 z-50 transition-all duration-300 w-full ${
          isScrolled ? 'shadow-sm bg-background/95 backdrop-blur-md' : 'bg-background'
        }`}
      >
        <div className="flex justify-between items-center w-full px-6 md:px-20 py-4 max-w-full">
          <button aria-label="Menu" className="md:hidden p-2 -ml-2 text-primary focus:outline-none">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <Link href="/" className="font-serif-custom text-2xl md:text-[32px] font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">
            DULHAN CENTRAL
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="font-sans-custom uppercase tracking-wider text-primary font-bold border-b-2 border-primary pb-1 scale-95 duration-200">Makeup</Link>
            <Link href="/search" className="font-sans-custom uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors scale-95 duration-200">Mehendi</Link>
            <Link href="/search" className="font-sans-custom uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors scale-95 duration-200">Couture</Link>
            <Link href="/search" className="font-sans-custom uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors scale-95 duration-200">Jewelry</Link>
            <Link href="/search" className="font-sans-custom uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors scale-95 duration-200">Vendors</Link>
          </nav>

          <div className="flex items-center space-x-4 md:space-x-6">
            <button aria-label="Search" onClick={() => router.push('/search')} className="hidden md:flex p-2 text-primary hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </button>
            <Link href="/login" className="hidden lg:block font-sans-custom text-sm uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors">Login</Link>
            <Link href="/register" className="hidden md:flex items-center justify-center px-6 py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-surface-tint transition-colors">
              Register as Vendor
            </Link>
            <button aria-label="Search" onClick={() => router.push('/search')} className="md:hidden p-2 text-primary">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative w-full h-[80vh] min-h-[600px] bg-surface-container flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img 
              alt="High-fashion bridal portrait." 
              className="w-full h-full object-cover object-top" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGLmpdG9bc0W9EGkHPYjU8KjCjFTo8bcGnfRZj3cGZBG6kIwOIEX_KF0muKE7XUOz6IRj4tH81cgoBEjUh51MBxDlHHd-2jeTnat8ywYAwyzJJlzJPvKBqLOVsIHMNmzdCD9TEsKAEqRDvCZiMek_DmbVyFmEUDg-xLayawr-LyixxOE_JhZz2AFKLpkWQcEm8crzctN6LNOu7yDt7pzdHsCovHcq8xMoODKI0s76bOlqSJnQan1RiIFpRvbGm1jp4IXLHZDi_LwcI"
            />
            {/* Using the Rose tint for the overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full px-6 md:px-20 flex flex-col md:w-2/3 lg:w-1/2 mr-auto items-start text-on-primary">
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary-container">Curated Excellence</span>
            <h1 className="font-serif-custom text-4xl md:text-[64px] font-bold mb-6 leading-tight">
              Your Radiance.<br/>
              <span className="italic font-light">Our Artistry.</span>
            </h1>
            <p className="font-sans-custom text-lg md:text-xl mb-8 max-w-md opacity-90 leading-relaxed text-surface-bright">
              Discover India's most sought-after bridal artists, luxury couture, and fine jewelry. The premier destination for the modern bride.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-lg bg-surface/95 backdrop-blur-sm p-2 flex flex-col sm:flex-row gap-2 border border-outline-variant/30 rounded-sm shadow-xl">
              <div className="flex-1 flex items-center border-b sm:border-b-0 sm:border-r border-outline-variant/50 px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant mr-2">brush</span>
                <input required className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant p-0 outline-none" placeholder="Service (e.g. Bridal Makeup)" type="text"/>
              </div>
              <div className="flex-1 flex items-center px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant mr-2">location_on</span>
                <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant p-0 outline-none" placeholder="Delhi NCR" type="text"/>
              </div>
              <button type="submit" className="bg-primary text-on-primary px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-surface-tint transition-colors flex items-center justify-center sm:w-auto w-full mt-2 sm:mt-0">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20 md:py-24 px-6 md:px-20 bg-background">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif-custom text-3xl md:text-[40px] font-semibold text-primary uppercase tracking-widest">Bridal Services</h2>
            <div className="w-12 h-0.5 bg-primary mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/search" className="group relative aspect-[4/5] overflow-hidden bg-surface-container-high block">
              <img alt="Bridal makeup" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQS-PNQSSvx6nwW5f4GLfVtQGbbX2nphWaYZw2c2TDJnJONlOejqBrDTD2xrTUQInuMy_m81510j_ZW6vxvFVAdaV1UPJu3POTZwvSK-pLzenTFriHxCtP1HBDFTBTiyvGM-sp456ZHmUHL6h5mdDrU0nuwQLm28TBvs26bHOMNwmUSthy85Els3n75Dl_32HW5WE1EaTtfNAWbwJAis8STRjeENxQfpVbUibgBO5gv0IW6UIjoaZYPxuZzbANwMEvKeemoPf7Q3w8"/>
              <div className="absolute inset-0 editorial-overlay flex flex-col justify-end p-6 md:p-8">
                <h3 className="font-serif-custom text-2xl text-on-primary mb-2">Makeup Artistry</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Explore Artists <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            <Link href="/search" className="group relative aspect-[4/5] overflow-hidden bg-surface-container-high block md:mt-8">
              <img alt="Bridal Mehendi" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1598463878148-5221b068da6c?w=500&q=80"/>
              <div className="absolute inset-0 editorial-overlay flex flex-col justify-end p-6 md:p-8">
                <h3 className="font-serif-custom text-2xl text-on-primary mb-2">Mehendi Design</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Find Experts <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            <Link href="/search" className="group relative aspect-[4/5] overflow-hidden bg-surface-container-high block">
              <img alt="Bridal Couture" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1583391733958-d25e07fac04f?w=500&q=80"/>
              <div className="absolute inset-0 editorial-overlay flex flex-col justify-end p-6 md:p-8">
                <h3 className="font-serif-custom text-2xl text-on-primary mb-2">Bridal Couture</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Shop Boutiques <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            <Link href="/search" className="group relative aspect-[4/5] overflow-hidden bg-surface-container-high block md:mt-8">
              <img alt="Fine Jewelry" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaUueq6qwKUKraDAgIi5NpqJF3FASC5y28lpNejK6Fw2Li1Qw8fTwjk6HpH4Eo2KD7oQZ7guyMAlFxPuQb6yCP7bOOIO9EeFz0Hz6zWIzjtoNzTp2tRhih8WBuFQfbIGTSPcTdAlww4vxrzzKKUZOG-KDFr87YU15OE4OjOjX-tJdp-sjDGsobv-EDlcdBAJQidAJ2hvxcUMx7AqoVYUOd68K23zH7qsCtZ3Nxf0_5b0irTM6C4aQqhdjx9rS_c6JTjkXkiMJ2Bw5W"/>
              <div className="absolute inset-0 editorial-overlay flex flex-col justify-end p-6 md:p-8">
                <h3 className="font-serif-custom text-2xl text-on-primary mb-2">Fine Jewelry</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  View Collections <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12 md:mt-16">
            <Link href="/search" className="inline-flex items-center px-8 py-3 border border-primary text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors">
              View All Categories
            </Link>
          </div>
        </section>

        {/* Spotlight Artists */}
        <section className="py-20 md:py-24 px-6 md:px-20 bg-surface border-t border-outline-variant/30">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-14">
            <div>
              <h2 className="font-serif-custom text-3xl md:text-[40px] font-semibold text-primary uppercase tracking-widest mb-2">Spotlight Artists</h2>
              <p className="font-sans-custom text-on-surface-variant">The most requested vendors this season.</p>
            </div>
            <div className="hidden md:flex space-x-4">
              <button className="w-12 h-12 border border-outline-variant rounded-full flex items-center justify-center hover:bg-surface-container hover:text-primary transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button className="w-12 h-12 border border-primary bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-surface-tint transition-colors">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-8 md:pb-0 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {/* Artist 1 */}
            <div onClick={() => router.push('/search')} className="flex-none w-[280px] md:w-auto group cursor-pointer">
              <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-variant">
                <img alt="Makeup Artist" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPQpso-8lr5fzBDlqhCgbmBFsQXdD0w5GJPfT4O6TSFdCuOpo6J_hRkPEzDJ9k5uwkzl9g7NX81UT5RpFafeuBYaNxA_sIa_ZkhDSagJRkU9XcVyrKi6z2Z36XlvufDFrrYQqwM5H9yxPu5qLUPA09jlZUszUA51rLR3GOCCCkWeJSlzV8PLwkFzDeoJ-KWFB54A7NPX0aBIAJft1i0rho5y8TIMm2LoJ_fhvbnYrsJ_V_JkRawzD3_SLctAFRLbiYinjFRCDyJkAl"/>
                <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                  Top Rated
                </div>
                <button className="absolute top-4 right-4 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[18px]">favorite_border</span>
                </button>
              </div>
              <h4 className="font-serif-custom text-xl font-bold text-primary mb-1">Aisha Khan Studios</h4>
              <p className="font-sans-custom text-on-surface-variant text-sm mb-3">Master Makeup Artist • Delhi</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-primary">
                  <span className="material-symbols-outlined icon-fill text-[16px]">star</span>
                  <span className="text-xs font-bold ml-1 text-primary">4.9 (120)</span>
                </div>
                <span className="font-sans-custom font-semibold text-primary">₹35k onwards</span>
              </div>
            </div>

            {/* Artist 2 */}
            <div onClick={() => router.push('/search')} className="flex-none w-[280px] md:w-auto group cursor-pointer">
              <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-variant">
                <img alt="Mehendi Artist" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBv-Zf5tzf74sa7eRdZSjOJszgelhWlLrexiC9-vY1KpGqkd5EUEN2Ax9cJBJ7ZIaRONsmmusCXzm-fsqyBsO2z-NSmSKYu1wtt5LW6RHV5K6PsNxPYSuAdMCCiRRu7_kZPAFduYkbziUVOGyrwEw27XDqS8vydHMNLE7DOLV-YLJhY1n72eBzTXqXGGD62roB-iYbX8MNc-BSYFP1zpfecwz86qeHbr76AHx6kAoqgJTh2fmvN1P68akG6xLW2vaOF6c3WmxR1gVd"/>
                <button className="absolute top-4 right-4 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[18px]">favorite_border</span>
                </button>
              </div>
              <h4 className="font-serif-custom text-xl font-bold text-primary mb-1">The Henna Story</h4>
              <p className="font-sans-custom text-on-surface-variant text-sm mb-3">Bridal Mehendi • South Ex</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-primary">
                  <span className="material-symbols-outlined icon-fill text-[16px]">star</span>
                  <span className="text-xs font-bold ml-1 text-primary">4.8 (85)</span>
                </div>
                <span className="font-sans-custom font-semibold text-primary">₹15k onwards</span>
              </div>
            </div>

            {/* Artist 3 */}
            <div onClick={() => router.push('/search')} className="flex-none w-[280px] md:w-auto group cursor-pointer">
              <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-variant">
                <img alt="Hair Stylist" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80"/>
                <button className="absolute top-4 right-4 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[18px]">favorite_border</span>
                </button>
              </div>
              <h4 className="font-serif-custom text-xl font-bold text-primary mb-1">Elegance Hair</h4>
              <p className="font-sans-custom text-on-surface-variant text-sm mb-3">Hair Styling • Gurgaon</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-primary">
                  <span className="material-symbols-outlined icon-fill text-[16px]">star</span>
                  <span className="text-xs font-bold ml-1 text-primary">5.0 (42)</span>
                </div>
                <span className="font-sans-custom font-semibold text-primary">₹12k onwards</span>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="relative w-full py-24 bg-primary text-on-primary overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#e4e2e2,_transparent)] bg-[length:20px_20px]"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-container mb-6 block">The Bridal Edit</span>
            <h2 className="font-serif-custom text-3xl md:text-[40px] font-bold mb-6">Expertise Delivered.</h2>
            <p className="font-sans-custom text-lg text-surface-bright mb-10 max-w-2xl mx-auto">
              Subscribe to our editorial newsletter for exclusive bridal trends, artist interviews, and early access to luxury vendor bookings.
            </p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto border-b border-surface-bright focus-within:border-primary-container transition-colors">
              <input required className="flex-1 bg-transparent border-none text-center sm:text-left focus:ring-0 text-on-primary placeholder:text-surface-bright py-3 px-0 text-xs font-bold tracking-wider outline-none" placeholder="YOUR EMAIL ADDRESS" type="email"/>
              <button className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-primary-container hover:text-on-primary transition-colors flex items-center justify-center" type="button">
                Subscribe <span className="material-symbols-outlined ml-2">arrow_right_alt</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-on-primary w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 md:px-20 py-20 w-full">
          {/* Brand Column */}
          <div className="md:col-span-1 mb-8 md:mb-0">
            <Link href="/" className="font-serif-custom text-2xl text-on-primary block mb-6 font-bold leading-none">
              DULHAN<br/>CENTRAL
            </Link>
            <p className="font-sans-custom text-sm text-surface-bright mb-6 max-w-xs leading-relaxed">
              Curating India's finest bridal artists and luxury services for the modern bride.
            </p>
            <div className="flex space-x-4 opacity-80 hover:opacity-100 transition-opacity">
              <a href="#" className="text-on-primary hover:text-primary-container transition-colors"><span className="material-symbols-outlined">photo_camera</span></a>
              <a href="#" className="text-on-primary hover:text-primary-container transition-colors"><span className="material-symbols-outlined">play_circle</span></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-container mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">About Us</a></li>
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Vendor Registration</a></li>
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-container mb-6">Services</h4>
            <ul className="space-y-4">
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Bridal Concierge</a></li>
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Masterclasses</a></li>
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Inspiration Gallery</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-container mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Contact Support</a></li>
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Privacy Policy</a></li>
              <li><a href="#" className="font-sans-custom text-sm text-surface-bright hover:text-primary-container transition-colors opacity-80 hover:opacity-100">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-bright/30 px-6 md:px-20 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-surface-bright font-sans-custom">
          <p>© 2026 DULHAN CENTRAL. PREMIER BRIDAL MARKETPLACE.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <span>Designed for AI Startup Buildathon 2026</span>
          </div>
        </div>
      </footer>

      <BeautyBot />
    </div>
  );
}