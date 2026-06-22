'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';
import BeautyBot from '@/components/BeautyBot';
import Navbar from '@/components/NavBar';
import { supabase } from '@/lib/supabase'; 

export interface Vendor {
  id: string | number;
  name: string;
  location: string;
  starting_price: number;
  rating: number;
  reviews: number;
  image_url: string;
  featured?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [spotlightVendors, setSpotlightVendors] = useState<Vendor[]>([]);
  
  // Search state management
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Inspiration Gallery view state
  const [showAllInspiration, setShowAllInspiration] = useState(false);

  useEffect(() => {
    async function fetchSpotlights() {
      try {
        const { data, error } = await supabase
          .from('vendor')
          .select('*')
          .order('rating', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        if (data) setSpotlightVendors(data as Vendor[]);
      } catch (error) {
        console.error('Error fetching spotlight vendors:', error);
      }
    }
    fetchSpotlights();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchService) params.append('service', searchService);
    if (searchLocation) params.append('location', searchLocation);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleSpotlightScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('spotlight-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
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

      {/* Global Auth-Aware Navbar */}
      <Navbar />

      <main className="pt-[72px]">
        {/* Hero Section */}
        <section className="relative w-full h-[calc(100vh-72px)] bg-surface-container flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img 
              alt="High-fashion bridal portrait." 
              className="w-full h-full object-cover object-top" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGLmpdG9bc0W9EGkHPYjU8KjCjFTo8bcGnfRZj3cGZBG6kIwOIEX_KF0muKE7XUOz6IRj4tH81cgoBEjUh51MBxDlHHd-2jeTnat8ywYAwyzJJlzJPvKBqLOVsIHMNmzdCD9TEsKAEqRDvCZiMek_DmbVyFmEUDg-xLayawr-LyixxOE_JhZz2AFKLpkWQcEm8crzctN6LNOu7yDt7pzdHsCovHcq8xMoODKI0s76bOlqSJnQan1RiIFpRvbGm1jp4IXLHZDi_LwcI"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full px-6 md:px-20 flex flex-col md:w-2/3 lg:w-1/2 mr-auto items-start text-on-primary">
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary-container">Curated Excellence</span>
            <h1 className="font-display-custom text-4xl md:text-[64px] font-bold mb-6 leading-tight">
              Your Radiance.<br/>
              <span className="italic font-light">Our Artistry.</span>
            </h1>
            <p className="font-sans-custom text-lg md:text-xl mb-8 max-w-md opacity-90 leading-relaxed text-surface-bright">
              Discover India's most sought-after bridal artists, luxury couture, and fine jewelry. The premier destination for the modern bride.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-lg bg-surface/95 backdrop-blur-sm p-2 flex flex-col sm:flex-row gap-2 border border-outline-variant/30 rounded-sm shadow-xl">
              <div className="flex-1 flex items-center border-b sm:border-b-0 sm:border-r border-outline-variant/50 px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant mr-2">brush</span>
                <input 
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  required 
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant p-0 outline-none" 
                  placeholder="Service (e.g. Bridal Makeup)" 
                  type="text"
                />
              </div>
              <div className="flex-1 flex items-center px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant mr-2">location_on</span>
                <input 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant p-0 outline-none" 
                  placeholder="Delhi NCR" 
                  type="text"
                />
              </div>
              <button type="submit" className="bg-primary text-on-primary px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-surface-tint transition-colors flex items-center justify-center sm:w-auto w-full mt-2 sm:mt-0">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Bridal Services - Curated to Makeup and Mehendi */}
        <section className="py-20 md:py-24 px-6 md:px-20 bg-background">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display-custom text-3xl md:text-[40px] font-semibold text-primary uppercase tracking-widest">Bridal Services</h2>
            <div className="w-12 h-0.5 bg-primary mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Link href="/search?service=Makeup" className="group relative aspect-[4/5] md:aspect-square overflow-hidden bg-surface-container-high block rounded-sm shadow-sm hover:shadow-xl transition-shadow">
              <img alt="Bridal makeup" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1594140700520-8afea3283e2c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-10">
                <h3 className="font-display-custom text-3xl text-white mb-2">Makeup</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Explore Artists <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            <Link href="/search?service=Mehendi" className="group relative aspect-[4/5] md:aspect-square overflow-hidden bg-surface-container-high block rounded-sm shadow-sm hover:shadow-xl transition-shadow">
              <img alt="Bridal Mehendi" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1613665667184-81bb9b8605e2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-10">
                <h3 className="font-display-custom text-3xl text-white mb-2">Mehendi</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Find Experts <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Inspiration Gallery */}
        <section id="inspiration-gallery" className="py-20 md:py-24 px-6 md:px-20 bg-[#faf8f7]">          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display-custom text-3xl md:text-[40px] font-semibold text-primary uppercase tracking-widest">Inspiration Gallery</h2>
            <div className="w-12 h-0.5 bg-primary mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Makeup Card */}
            <Link href="/inspiration/makeup" className="group relative aspect-[4/5] overflow-hidden bg-white block rounded-sm shadow-sm hover:shadow-xl transition-all duration-300">
              <img alt="Makeup Inspiration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="font-display-custom text-2xl text-white mb-1">Makeup</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  View Moodboard <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            {/* Hairstyle Card */}
            <Link href="/inspiration/hairstyles" className="group relative aspect-[4/5] overflow-hidden bg-white block rounded-sm shadow-sm hover:shadow-xl transition-all duration-300">
              <img alt="Hairstyle Inspiration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1746649236126-96c903680c0d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="font-display-custom text-2xl text-white mb-1">Hairstyle</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  View Moodboard <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            {/* Mehendi Card */}
            <Link href="/inspiration/mehendi" className="group relative aspect-[4/5] overflow-hidden bg-white block rounded-sm shadow-sm hover:shadow-xl transition-all duration-300">
              <img alt="Mehendi Inspiration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1730003873829-09b4b16444c1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="font-display-custom text-2xl text-white mb-1">Mehendi</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  View Moodboard <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            {/* Jewellery Card */}
            <Link href="/inspiration/jwellery" className="group relative aspect-[4/5] overflow-hidden bg-white block rounded-sm shadow-sm hover:shadow-xl transition-all duration-300">
              <img alt="Jewellery Inspiration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaUueq6qwKUKraDAgIi5NpqJF3FASC5y28lpNejK6Fw2Li1Qw8fTwjk6HpH4Eo2KD7oQZ7guyMAlFxPuQb6yCP7bOOIO9EeFz0Hz6zWIzjtoNzTp2tRhih8WBuFQfbIGTSPcTdAlww4vxrzzKKUZOG-KDFr87YU15OE4OjOjX-tJdp-sjDGsobv-EDlcdBAJQidAJ2hvxcUMx7AqoVYUOd68K23zH7qsCtZ3Nxf0_5b0irTM6C4aQqhdjx9rS_c6JTjkXkiMJ2Bw5W"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="font-display-custom text-2xl text-white mb-1">Jewellery</h3>
                <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  View Moodboard <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            {/* Hidden Leftover Cards (Revealed when showAllInspiration is true) */}
            {showAllInspiration && (
              <>
                {/* Lehenga Card */}
                <Link href="/inspiration/lehenga" className="group relative aspect-[4/5] overflow-hidden bg-white block rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
                  <img alt="Lehenga Inspiration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1735052713120-2323c8ac72e9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="font-display-custom text-2xl text-white mb-1">Lehenga</h3>
                    <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      View Moodboard <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                    </span>
                  </div>
                </Link>

                {/* Decorations Card */}
                <Link href="/inspiration/decorations" className="group relative aspect-[4/5] overflow-hidden bg-white block rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
                  <img alt="Decorations Inspiration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="font-display-custom text-2xl text-white mb-1">Decorations</h3>
                    <span className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      View Moodboard <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Toggle Button */}
          <div className="text-center mt-12 md:mt-16">
            <button 
              onClick={() => setShowAllInspiration(!showAllInspiration)}
              className="inline-flex items-center px-8 py-3 border border-primary text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
            >
              {showAllInspiration ? 'Show Less Categories' : 'View All Categories'}
            </button>
          </div>
        </section>

        {/* Database Driven Spotlight Artists */}
        <section className="py-20 md:py-24 px-6 md:px-20 bg-[#fff8f7] border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-14">
            <div>
              <h2 className="font-display-custom text-3xl md:text-[40px] font-bold text-[#8f3546] mb-2">Spotlight Artists</h2>
              <p className="font-sans-custom text-gray-500">The most highly rated vendors this season.</p>
            </div>
            <div className="hidden md:flex space-x-4">
              <button onClick={() => handleSpotlightScroll('left')} className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-white hover:text-[#8f3546] transition-colors text-gray-500 bg-transparent">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button onClick={() => handleSpotlightScroll('right')} className="w-12 h-12 border border-[#8f3546] bg-[#8f3546] text-white rounded-full flex items-center justify-center hover:bg-[#712030] transition-colors">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div id="spotlight-container" className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-8 md:pb-0 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {spotlightVendors.map((vendor) => (
              <div 
                key={vendor.id} 
                onClick={() => router.push(`/vendor/${vendor.id}`)} 
                className="flex-none w-[280px] md:w-auto bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8f3546]/20 transition-all flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img 
                    alt={vendor.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={vendor.image_url || 'https://images.unsplash.com/photo-1512496015851-a1fb82e75bc7?w=500&q=80'}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512496015851-a1fb82e75bc7?w=500&q=80'; }}
                  />
                  {vendor.rating >= 4.8 && (
                    <div className="absolute top-4 left-4 bg-[#8f3546] text-white px-3 py-1 rounded-md text-[9px] uppercase tracking-[0.15em] font-bold shadow-md">
                      Elite
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="w-full py-2.5 bg-[#8f3546] hover:bg-[#712030] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                      View Portfolio →
                    </button>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display-custom font-bold text-lg text-gray-900 group-hover:text-[#8f3546] transition-colors truncate">
                        {vendor.name}
                      </h3>
                      <div className="flex items-center gap-0.5 text-xs font-bold text-[#8f3546] shrink-0">
                        <span className="material-symbols-outlined icon-fill text-sm">star</span>
                        <span>{vendor.rating}</span>
                      </div>
                    </div>
                    <p className="font-sans-custom text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-gray-400">location_on</span>
                      <span>{vendor.location}</span>
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-gray-400 block">Starting price</span>
                      <strong className="font-sans-custom text-base font-bold text-gray-900">₹{vendor.starting_price?.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="relative w-full py-24 bg-primary text-on-primary overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#e4e2e2,_transparent)] bg-[length:20px_20px]"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-container mb-6 block">The Bridal Edit</span>
            <h2 className="font-display-custom text-3xl md:text-[40px] font-bold mb-6">Expertise Delivered.</h2>
            <p className="font-sans-custom text-lg text-surface-bright mb-10 max-w-2xl mx-auto">
              Subscribe to our editorial newsletter for exclusive bridal trends, artist interviews, and early access to luxury vendor bookings.
            </p>
            <form 
              onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} 
              className="flex flex-col sm:flex-row max-w-md mx-auto border-b border-surface-bright focus-within:border-primary-container transition-colors"
            >
              <input required className="flex-1 bg-transparent border-none text-center sm:text-left focus:ring-0 text-on-primary placeholder:text-surface-bright py-3 px-0 text-xs font-bold tracking-wider outline-none" placeholder="YOUR EMAIL ADDRESS" type="email"/>
              <button className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-primary-container hover:text-on-primary transition-colors flex items-center justify-center" type="submit">
                Subscribe <span className="material-symbols-outlined ml-2">arrow_right_alt</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global AI Assistant */}
      <BeautyBot />
    </div>
  );
}