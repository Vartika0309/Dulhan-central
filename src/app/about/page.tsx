'use client';

import Navbar from '@/components/NavBar';
import Footer from '@/components/footer';


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fff8f7] font-sans-custom flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}} />
      
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        {/* Hero Section */}
        <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden mb-20">
          {/* Hero Image */}
          <img 
            src="/aboutus.jpg" 
            alt="About Us Banner" 
            className="absolute inset-0 w-full h-full object-cover object-top"          />
          
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Hero Text */}
          <div className="relative z-10 text-center px-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 mb-4 block">
              Our Narrative
            </span>
            <h1 className="font-display-custom text-4xl md:text-6xl font-bold text-white mb-6">
              The Poetry of Your <br />
              <span className="italic font-light">Wedding Day</span>
            </h1>
            <p className="font-sans-custom text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Every love story is a masterpiece waiting to be visually expressed. At Dulhan Central, we bridge the gap between modern brides and the exceptional artisans who translate emotions into artistry.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-white py-20 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 relative">
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/aboutimage.jpg" 
                  alt="Bridal Artistry" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-[#8f3546] text-white p-8 rounded-2xl shadow-lg hidden md:block max-w-xs">
                <h3 className="font-display-custom text-2xl font-bold mb-2">Empowering Artists</h3>
                <p className="text-sm opacity-90 leading-relaxed">Providing a premier digital canvas for India's finest bridal talent.</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <h2 className="font-display-custom text-3xl md:text-4xl font-bold text-gray-900">
                A Modern Canvas for Traditional Craft
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The journey to the altar is filled with pivotal decisions, yet discovering the right artists shouldn't feel like a leap in the dark. We recognized a need for a curated space that honors the profound skill of makeup artists, mehendi designers, and bridal couturiers.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Dulhan Central was born to replace endless scrolling with confident choices. By combining transparent reviews, verified portfolios, and seamless booking technology, we ensure that the creators shaping your wedding day are as reliable as they are talented.
              </p>
              <div className="pt-6">
                <div className="flex items-center gap-4 text-gray-900 font-semibold">
                  <span className="w-12 h-[1px] bg-[#8f3546]"></span>
                  Designed for the AI Startup Buildathon 2026
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values (Grid Cards Centered) */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 py-20">
          <div className="text-center mb-16">
            <h2 className="font-display-custom text-3xl font-bold text-gray-900 mb-4">Our Core Pillars</h2>
            <div className="w-16 h-0.5 bg-[#8f3546] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-100 p-10 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center justify-center">
              <div className="w-16 h-16 bg-[#fff8f7] text-[#8f3546] rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">diamond</span>
              </div>
              <h3 className="font-display-custom text-xl font-bold text-gray-900 mb-3">Curated Excellence</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We stringently verify every artist's portfolio, ensuring that only top-tier professionals grace our directory. Your trust is our highest priority.
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center justify-center">
              <div className="w-16 h-16 bg-[#fff8f7] text-[#8f3546] rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">favorite</span>
              </div>
              <h3 className="font-display-custom text-xl font-bold text-gray-900 mb-3">Narrative Driven</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We believe your wedding is a story. Our AI tools and intuitive design help you find vendors whose aesthetic perfectly matches your personal vision.
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center justify-center">
              <div className="w-16 h-16 bg-[#fff8f7] text-[#8f3546] rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="font-display-custom text-xl font-bold text-gray-900 mb-3">Secure Bookings</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                From finding an artist to locking in your date, our integrated payment gateways provide a seamless, secure, and stress-free transaction process.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}