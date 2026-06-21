'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';
import BeautyBot from '@/components/BeautyBot';
import MapView from '@/components/MapView';
import Footer from '@/components/footer';


const MagicLampIcon = () => (
  <svg className="w-5 h-5 text-[#8f3546] fill-[#8f3546]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 12c.3 0 .5-.2.5-.5V10c0-1.7-1.3-3-3-3h-2.3c-.6-1.2-1.7-2-3-2s-2.4.8-3 2H6.5C4.8 7 3.5 8.3 3.5 10v1.5c0 .3.2.5.5.5s.5-.2.5-.5V10c0-.8.7-1.5 1.5-1.5h11c.8 0 1.5.7 1.5 1.5v1.5c0 .3.2.5.5.5zm-8.8-9.5C10.7 2.2 11.3 2 12 2s1.3.2 1.3.5c0 .3-.3.5-.7.5-.4 0-.6.3-.6.6 0 .3.2.5.5.5h1.5c.3 0 .5.2.5.5s-.2.5-.5.5h-1.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5.2.5.5s-.2.5-.5.5H12c-1.7 0-3-1.3-3-3 0-.3.2-.5.5-.5s.7.2.7.5zm-5 11c-.3 0-.5-.2-.5-.5V12c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3-.2.5-.5.5zm12.5 0c-.3 0-.5-.2-.5-.5V12c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3-.2.5-.5.5zM12 22c-4.4 0-8-3.6-8-8 0-.3.2-.5.5-.5s.5.2.5.5c0 3.3 2.7 6 6 6s6-2.7 6-6c0-.3.2-.5.5-.5s.5.2.5.5c0 4.4-3.6 8-8 8z" />
    <path d="M12 16.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zm0-8c-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5-1.6-3.5-3.5-3.5zm7 5.5h-1c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h1c.3 0 .5.2.5.5s-.2.5-.5.5zm-13 0H5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h1c.3 0 .5.2.5.5s-.2.5-.5.5z" />
  </svg>
);

export interface MehendiArtist {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviews: number;
  starting_price: number;
  service_mode: string[];
  services_offered: string[];
  image_url: string;
  featured: boolean;
}

export default function MehendiSearchPage() {
  const router = useRouter();

  // Data States
  const [vendors, setVendors] = useState<MehendiArtist[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  // Filter States
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  // UI States
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BeautyBotComponent = BeautyBot as any;

  // Fetch Mehendi Artists from Supabase
  useEffect(() => {
    async function fetchMehendi() {
      try {
        const { data, error } = await supabase.from('mehendi').select('*');
        if (error) throw error;
        if (data) setVendors(data as MehendiArtist[]);
      } catch (error) {
        console.error('Error fetching mehendi artists:', error);
      } finally {
        setIsLoadingDB(false);
      }
    }
    fetchMehendi();
  }, []);

  // Dynamic filter options
  const localities = useMemo(() => {
    const locs = vendors.map(v => v.location?.split(',')[0].trim()).filter(Boolean);
    return ['all', ...Array.from(new Set(locs))];
  }, [vendors]);

  // Apply filters
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchLocality = selectedLocality === 'all' ||
        (vendor.location && vendor.location.toLowerCase().includes(selectedLocality.toLowerCase()));

      let matchPrice = true;
      if (priceRange === 'under_3k') matchPrice = vendor.starting_price < 3000;
      if (priceRange === '3k_to_6k') matchPrice = vendor.starting_price >= 3000 && vendor.starting_price <= 6000;
      if (priceRange === 'above_6k') matchPrice = vendor.starting_price > 6000;

      return matchLocality && matchPrice;
    });
  }, [vendors, selectedLocality, priceRange]);

  return (
    <div suppressHydrationWarning className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-body-custom { font-family: 'Libre Caslon Text', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
      `}} />

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-16 pt-28 pb-20">
        
        {/* Header & DC Genie Caller */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-200 pb-8">
          <div>
            <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
              <span className="cursor-pointer hover:text-[#8f3546]" onClick={() => router.push('/')}>Home</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-gray-800 font-semibold">Mehendi Artists</span>
            </nav>
            <h1 className="font-display-custom text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Bridal Mehendi Designers
            </h1>
            <p className="text-xs text-gray-500 mt-2">
              Showing <strong className="text-gray-900">{filteredVendors.length} results</strong> as per your search criteria
            </p>
          </div>

          <div className="bg-white border border-[#8f3546]/20 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
              <MagicLampIcon />
              <div className="text-sm">Need Help? <strong className="text-[#8f3546]">Click the DC Genie</strong> icon below!</div>
            </div>
          </div>

        {/* Filters and Layout Controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Locality Filter */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'locality' ? null : 'locality')}
                className={`px-4 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${selectedLocality !== 'all' ? 'bg-[#8f3546] text-white border-[#8f3546]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                {selectedLocality === 'all' ? 'Locality' : selectedLocality}
                <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
              </button>
              {activeDropdown === 'locality' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
                  {localities.map(loc => (
                    <div 
                      key={loc}
                      onClick={() => { setSelectedLocality(loc); setActiveDropdown(null); }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer capitalize"
                    >
                      {loc === 'all' ? 'All Localities' : loc}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                className={`px-4 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${priceRange !== 'all' ? 'bg-[#8f3546] text-white border-[#8f3546]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                {priceRange === 'all' ? 'Price Range' : priceRange.replace('_', ' ').replace('k', ',000')}
                <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
              </button>
              {activeDropdown === 'price' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
                  <div onClick={() => { setPriceRange('all'); setActiveDropdown(null); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Any Price</div>
                  <div onClick={() => { setPriceRange('under_3k'); setActiveDropdown(null); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Under ₹3,000</div>
                  <div onClick={() => { setPriceRange('3k_to_6k'); setActiveDropdown(null); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">₹3,000 - ₹6,000</div>
                  <div onClick={() => { setPriceRange('above_6k'); setActiveDropdown(null); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Above ₹6,000</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 w-full lg:w-auto justify-end">
            <button 
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${showMap ? 'bg-[#8f3546] text-white border-[#8f3546]' : 'bg-white border-gray-200 text-[#8f3546] hover:bg-[#fff8f7]'}`}
            >
              <span className="material-symbols-outlined text-[16px]">{showMap ? 'grid_view' : 'map'}</span> 
              {showMap ? 'Grid View' : 'Map View'}
            </button>

            <div className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 p-1">
              <button 
                onClick={() => { setLayoutMode('grid'); setShowMap(false); }}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${layoutMode === 'grid' && !showMap ? 'bg-[#8f3546] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
              </button>
              <button 
                onClick={() => { setLayoutMode('list'); setShowMap(false); }}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${layoutMode === 'list' && !showMap ? 'bg-[#8f3546] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                <span className="material-symbols-outlined text-sm">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Displaying the Mehendi artist grid/list... */}
        {isLoadingDB ? (
          <div className="w-full py-32 text-center flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#8f3546]/20 border-t-[#8f3546] rounded-full animate-spin mb-4"></div>
            <h3 className="font-display-custom text-2xl text-gray-900 font-bold mb-2">Loading Elite Mehendi Artists...</h3>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="w-full py-32 text-center flex flex-col items-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 animate-bounce">search_off</span>
            <h3 className="font-display-custom text-2xl text-gray-900 font-bold mb-2">No Matching Artists Found</h3>
            <p className="font-body-custom text-gray-500 max-w-md">We couldn't find any mehendi designers fitting your parameters. Try resetting some filters.</p>
          </div>
        ) : showMap ? (
          <MapView vendors={filteredVendors as any} />
        ) : (
          <div className={`grid gap-6 ${layoutMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredVendors.map((vendor) => (
              <div 
                key={vendor.id} 
                onClick={() => router.push(`/vendor/${vendor.id}`)}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex cursor-pointer ${layoutMode === 'list' ? 'flex-row h-64' : 'flex-col'}`}
              >
                {/* Image Section */}
                <div className={`relative overflow-hidden bg-gray-100 ${layoutMode === 'list' ? 'w-2/5 h-full' : 'w-full h-56'}`}>
                  <img 
                    src={vendor.image_url} 
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {vendor.featured && (
                    <div className="absolute top-3 left-3 bg-[#8f3546] text-white px-3 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold shadow-md z-10">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={`p-5 flex flex-col flex-1 ${layoutMode === 'list' ? 'justify-center' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 font-display-custom group-hover:text-[#8f3546] transition-colors">{vendor.name}</h3>
                    <div className="bg-gray-50 px-2 py-1 rounded flex items-center gap-1 border border-gray-100">
                      <span className="material-symbols-outlined text-[14px] text-[#8f3546]">star</span>
                      <span className="text-sm font-bold text-gray-700">{vendor.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {vendor.location}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {vendor.services_offered?.slice(0, 2).map((service, idx) => (
                      <span key={idx} className="bg-[#fff8f7] text-[#8f3546] border border-[#8f3546]/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Starting Price</p>
                      <p className="text-lg font-bold text-gray-900">₹{vendor.starting_price.toLocaleString()}</p>
                    </div>
                    <button className="text-[#8f3546] text-sm font-bold flex items-center gap-1 group-hover:underline">
                      View Profile <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BeautyBotComponent isOpen={isBotOpen} setIsOpen={setIsBotOpen} />
      <Footer />
    </div>
  );
}