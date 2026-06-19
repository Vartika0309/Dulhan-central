/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Defining the Vendor type based on your component's usage
export interface Vendor {
  id: string | number;
  name: string;
  location: string;
  starting_price: number;
  services_offered: string[];
  service_mode: string;
  rating: number;
  reviews: number;
  image_url: string;
  featured?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// --- CUSTOM SVG ICONS ---
const MagicLampIcon = () => (
  <svg className="w-5 h-5 text-[#8f3546] fill-[#8f3546]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 12c.3 0 .5-.2.5-.5V10c0-1.7-1.3-3-3-3h-2.3c-.6-1.2-1.7-2-3-2s-2.4.8-3 2H6.5C4.8 7 3.5 8.3 3.5 10v1.5c0 .3.2.5.5.5s.5-.2.5-.5V10c0-.8.7-1.5 1.5-1.5h11c.8 0 1.5.7 1.5 1.5v1.5c0 .3.2.5.5.5zm-8.8-9.5C10.7 2.2 11.3 2 12 2s1.3.2 1.3.5c0 .3-.3.5-.7.5-.4 0-.6.3-.6.6 0 .3.2.5.5.5h1.5c.3 0 .5.2.5.5s-.2.5-.5.5h-1.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5.2.5.5s-.2.5-.5.5H12c-1.7 0-3-1.3-3-3 0-.3.2-.5.5-.5s.7.2.7.5zm-5 11c-.3 0-.5-.2-.5-.5V12c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3-.2.5-.5.5zm12.5 0c-.3 0-.5-.2-.5-.5V12c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3-.2.5-.5.5zM12 22c-4.4 0-8-3.6-8-8 0-.3.2-.5.5-.5s.5.2.5.5c0 3.3 2.7 6 6 6s6-2.7 6-6c0-.3.2-.5.5-.5s.5.2.5.5c0 4.4-3.6 8-8 8z" />
    <path d="M12 16.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zm0-8c-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5-1.6-3.5-3.5-3.5zm7 5.5h-1c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h1c.3 0 .5.2.5.5s-.2.5-.5.5zm-13 0H5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h1c.3 0 .5.2.5.5s-.2.5-.5.5z" />
  </svg>
);

const GridIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-4 h-4 ${active ? 'text-[#8f3546]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
  </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-4 h-4 ${active ? 'text-[#8f3546]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function SearchPage() {
  const router = useRouter();

  // --- VENDORS STATE ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH VENDORS ---
  useEffect(() => {
    async function fetchVendors() {
      try {
        console.log("1. Attempting to fetch from Supabase 'vendor' table...");
        const { data, error } = await supabase
          .from('vendor')
          .select('*');
        
        console.log("2. Supabase Data Received:", data);
        console.log("3. Supabase Errors:", error);
        
        if (error) throw error;
        if (data) setVendors(data as Vendor[]);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  // --- FILTER STATES ---
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [maxBudget, setMaxBudget] = useState(150000);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [travelsToVenue, setTravelsToVenue] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // --- DC GENIE CHAT STATES ---
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: "Namaste! I'm DC Genie, your personal AI bridal coordinator. Looking for a specialized artist inside Delhi NCR? Ask me anything!" }
  ]);
  const [botInputValue, setBotInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBotTyping]);

  // --- DYNAMIC FILTER OPTIONS ---
  const localities = useMemo(() => {
    const locations = vendors.map(v => v.location?.split(',')[0].trim()).filter(Boolean);
    return ['all', ...Array.from(new Set(locations))];
  }, [vendors]);

  const specialties = useMemo(() => {
    const allServices = vendors.flatMap(v => v.services_offered || []);
    return ['all', ...Array.from(new Set(allServices))];
  }, [vendors]);

  // --- FILTERING LOGIC ---
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor: Vendor) => {
      // Inline Search Bar
      const matchesSearch = searchQuery === '' ||
        (vendor.name && vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (vendor.location && vendor.location.toLowerCase().includes(searchQuery.toLowerCase()));

      // Locality Dropdown
      const matchesLocality = selectedLocality === 'all' || 
        (vendor.location && vendor.location.toLowerCase().includes(selectedLocality.toLowerCase()));

      // Unified Budget Slider
      const matchesBudget = vendor.starting_price <= maxBudget;

      // Specialty Filter
      const matchesSpecialty = selectedSpecialty === 'all' || 
        (vendor.services_offered && vendor.services_offered.some(s => s.toLowerCase() === selectedSpecialty.toLowerCase()));

      // Travels to Venue
      const matchesTravels = travelsToVenue === 'all' || 
        (vendor.service_mode && (travelsToVenue === 'yes' ? vendor.service_mode.includes('home') : vendor.service_mode.includes('salon')));

      // Rating Filter
      const matchesRating = selectedRating === 'all' || 
        vendor.rating >= Number(selectedRating);

      return matchesSearch && matchesLocality && matchesBudget && matchesSpecialty && matchesTravels && matchesRating;
    });
  }, [vendors, searchQuery, selectedLocality, maxBudget, selectedSpecialty, travelsToVenue, selectedRating]);

  // --- DYNAMIC LEAFLET MAP ---
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersGroupRef = useRef<any>(null);

  // --- UNIFIED MAP & MARKER EFFECT ---
  useEffect(() => {
    if (!showMap) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;

    const setupMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapContainerRef.current) return;

      // 1. Initialize
      map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.2090],
        zoom: 11,
        zoomControl: false
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.featureGroup().addTo(map);

      // 2. Initial Size Correction
      map.invalidateSize();

      // 3. Render Markers
      renderMarkers(map, L);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderMarkers = (mapInstance: any, L: any) => {
      if (!markersGroupRef.current) return;
      markersGroupRef.current.clearLayers();

      filteredVendors.forEach((vendor) => {
        const lat = vendor.coordinates?.lat || 28.6139 + (Math.random() - 0.5) * 0.1;
        const lng = vendor.coordinates?.lng || 77.2090 + (Math.random() - 0.5) * 0.1;

        const pulsingIcon = L.divIcon({
          className: 'bg-transparent border-none',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
              <span class="animate-ping" style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: #8f3546; opacity: 0.4;"></span>
              <span style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #8f3546; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div style="padding: 8px; min-width: 200px; font-family: sans-serif;">
            <img style="width: 100%; height: 96px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" src="${vendor.image_url}" alt="${vendor.name}" />
            <h4 style="font-weight: bold; font-size: 14px; color: #8f3546; margin: 0;">${vendor.name}</h4>
            <p style="font-size: 12px; color: #6b7280; margin: 2px 0 8px 0;">${vendor.location}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px solid #f3f4f6;">
              <span style="font-size: 12px; font-weight: bold; color: #111827;">₹${vendor.starting_price.toLocaleString()}</span>
              <span style="font-size: 12px; font-weight: bold; color: #8f3546;">★ ${vendor.rating}</span>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: pulsingIcon }).bindPopup(popupContent);
        markersGroupRef.current.addLayer(marker);
      });

      if (filteredVendors.length > 0) {
        const bounds = markersGroupRef.current.getBounds();
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    };

    setupMap();

    // Re-render markers if filters change while map is open
    if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        renderMarkers(mapInstanceRef.current, require('leaflet'));
    }

  }, [showMap, filteredVendors]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSendChatMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!botInputValue.trim()) return;

    const userMsg = botInputValue.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setBotInputValue('');
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply || "I'm having trouble connecting right now." }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "I'm having trouble connecting to my AI brain right now." }]);
    } finally {
      setIsBotTyping(false);
    }
  }, [botInputValue]);

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen">
      {/* Font & Utility Setup */}
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

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-100 flex justify-between items-center w-full px-6 md:px-16 py-4 fixed top-0 z-50 shadow-sm">
        <Link href="/" className="font-display-custom text-2xl font-bold text-[#8f3546] tracking-tighter hover:opacity-80 transition-opacity">
          DULHAN CENTRAL
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <span className="text-[#8f3546] font-bold border-b-2 border-[#8f3546] pb-1 text-[11px] uppercase tracking-widest cursor-pointer">Makeup</span>
          <span className="text-gray-500 hover:text-[#8f3546] transition-colors text-[11px] uppercase tracking-widest cursor-pointer">Mehendi</span>
          <span className="text-gray-500 hover:text-[#8f3546] transition-colors text-[11px] uppercase tracking-widest cursor-pointer">Couture</span>
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[11px] uppercase tracking-widest text-gray-500 hover:text-[#8f3546] transition-colors hidden sm:block">
            Login
          </Link>
          <button className="text-[11px] uppercase tracking-widest text-white bg-[#8f3546] px-5 py-2 hover:bg-[#712030] transition-colors font-semibold">
            Register
          </button>
        </div>
      </header>

      {/* Sticky Filters */}
      <section className="bg-white border-b border-gray-100 pt-24 sticky top-0 z-40 shadow-sm">
        <div className="max-w-full px-6 md:px-16 py-3 flex flex-wrap gap-4 items-center">
          
          {/* 1. Locality Filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'locality' ? null : 'locality')}
              className="text-gray-700 text-sm hover:text-[#8f3546] font-medium flex items-center gap-1 transition-colors py-1 px-3 border border-gray-200 rounded-full"
            >
              Locality {selectedLocality !== 'all' ? `(${selectedLocality})` : ''} ▾
            </button>
            {activeDropdown === 'locality' && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto p-2">
                <button onClick={() => { setSelectedLocality('all'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">All Localities</button>
                {localities.filter(l => l !== 'all').map(loc => (
                  <button key={loc} onClick={() => { setSelectedLocality(loc); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">{loc}</button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Unified Budget Slider */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
              className="text-gray-700 text-sm hover:text-[#8f3546] font-medium flex items-center gap-1 transition-colors py-1 px-3 border border-gray-200 rounded-full"
            >
              Budget ▾
            </button>
            {activeDropdown === 'budget' && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-4">
                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Max Budget</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-[#8f3546]">Up to ₹{maxBudget.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="150000" 
                  step="5000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[#8f3546] cursor-pointer"
                />
                <button onClick={() => setActiveDropdown(null)} className="w-full mt-4 bg-gray-100 text-gray-700 text-xs py-2 rounded-lg font-bold hover:bg-gray-200">Apply Filter</button>
              </div>
            )}
          </div>

          {/* 3. Specialty Filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'specialty' ? null : 'specialty')}
              className="text-gray-700 text-sm hover:text-[#8f3546] font-medium flex items-center gap-1 transition-colors py-1 px-3 border border-gray-200 rounded-full"
            >
              Specialty {selectedSpecialty !== 'all' ? `(${selectedSpecialty})` : ''} ▾
            </button>
            {activeDropdown === 'specialty' && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto p-2">
                <button onClick={() => { setSelectedSpecialty('all'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">All Specialties</button>
                {specialties.filter(s => s !== 'all').map(spec => (
                  <button key={spec} onClick={() => { setSelectedSpecialty(spec); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">{spec}</button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Travels to Venue Filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'travels' ? null : 'travels')}
              className="text-gray-700 text-sm hover:text-[#8f3546] font-medium flex items-center gap-1 transition-colors py-1 px-3 border border-gray-200 rounded-full"
            >
              Travels to Venue ▾
            </button>
            {activeDropdown === 'travels' && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2">
                <button onClick={() => { setTravelsToVenue('all'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">Any Option</button>
                <button onClick={() => { setTravelsToVenue('yes'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">Yes (Home Service)</button>
                <button onClick={() => { setTravelsToVenue('no'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">Salon/Studio Only</button>
              </div>
            )}
          </div>

          {/* 5. Rating Filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')}
              className="text-gray-700 text-sm hover:text-[#8f3546] font-medium flex items-center gap-1 transition-colors py-1 px-3 border border-gray-200 rounded-full"
            >
              Rating {selectedRating !== 'all' ? `(${selectedRating}+)` : ''} ▾
            </button>
            {activeDropdown === 'rating' && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2">
                <button onClick={() => { setSelectedRating('all'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">All Ratings</button>
                <button onClick={() => { setSelectedRating('4.8'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">★ 4.8 &amp; above</button>
                <button onClick={() => { setSelectedRating('4.9'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">★ 4.9 &amp; above</button>
              </div>
            )}
          </div>

          {/* Reset Filters */}
          {(selectedLocality !== 'all' || maxBudget < 150000 || selectedSpecialty !== 'all' || travelsToVenue !== 'all' || selectedRating !== 'all') && (
            <button 
              onClick={() => {
                setSelectedLocality('all');
                setMaxBudget(150000);
                setSelectedSpecialty('all');
                setTravelsToVenue('all');
                setSelectedRating('all');
              }}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Main Arena */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 pt-8 pb-20">
        
        {/* Breadcrumb & Hero Title */}
        <div className="mb-6">
          <nav className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <span>Home</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Vendors</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-gray-800 font-semibold">Bridal Makeup Artists</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
            <div>
              <h1 className="font-display-custom text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Bridal Makeup Artists in Delhi NCR
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                Showing <strong className="text-gray-900">{filteredVendors.length} results</strong> as per your search criteria
              </p>
            </div>

            {/* WMG GENIE CALLOUT BANNER */}
            <div 
              onClick={() => setIsBotOpen(true)}
              className="bg-white border border-[#8f3546]/20 rounded-xl px-5 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#8f3546] transition-all"
            >
              <MagicLampIcon />
              <div className="text-sm">
                Need Help? <strong className="text-[#8f3546]">DC Genie</strong> can help out!
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Search & Views) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-gray-200/60 mb-8">
          
          {/* Inline Search */}
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Search Bridal Makeup Artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#8f3546]"
              suppressHydrationWarning
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">search</span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            {/* Map Toggle */}
            <button 
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${showMap ? 'bg-[#8f3546] text-white border-[#8f3546]' : 'bg-white border-gray-200 text-[#8f3546] hover:bg-[#fff8f7]'}`}
            >
              <span className="material-symbols-outlined text-[16px]">{showMap ? 'grid_view' : 'map'}</span> 
              {showMap ? 'Grid View' : 'Map View'}
            </button>

            {/* View Selectors */}
            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button 
                onClick={() => { setLayoutMode('list'); setShowMap(false); }}
                className={`p-2 hover:bg-[#fff8f7] transition-colors ${layoutMode === 'list' && !showMap ? 'bg-[#fff8f7]' : ''}`}
                title="List View"
              >
                <ListIcon active={layoutMode === 'list' && !showMap} />
              </button>
              <button 
                onClick={() => { setLayoutMode('grid'); setShowMap(false); }}
                className={`p-2 hover:bg-[#fff8f7] transition-colors ${layoutMode === 'grid' && !showMap ? 'bg-[#fff8f7]' : ''}`}
                title="Grid View"
              >
                <GridIcon active={layoutMode === 'grid' && !showMap} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Render */}
        {showMap ? (
          <div className="w-full h-[650px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative">
            <div ref={mapContainerRef} className="w-full h-full z-10" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg z-20 border border-gray-100/50 max-w-xs hidden md:block">
              <h4 className="font-bold text-[#8f3546]">Dynamic Mapping</h4>
              <p className="text-xs text-gray-500 mt-1">Showing {filteredVendors.length} matches dynamically plotted.</p>
            </div>
          </div>
        ) : (
          layoutMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8f3546]/20 transition-all flex flex-col group">
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    <img 
                      src={vendor.image_url} 
                      alt={vendor.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512496015851-a1fb82e75bc7?w=500&q=80';
                      }}
                    />
                    {vendor.featured && (
                      <div className="absolute top-4 left-4 bg-[#8f3546] text-white px-3 py-1 rounded-md text-[9px] uppercase tracking-[0.15em] font-bold shadow-md">
                        Elite
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Link href={`/vendor/${vendor.id}`}>
                        <button className="w-full py-2.5 bg-[#8f3546] hover:bg-[#712030] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                          View Portfolio &rarr;
                        </button>
                      </Link>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#8f3546] transition-colors truncate">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs font-bold text-[#8f3546] shrink-0">
                          <span className="material-symbols-outlined icon-fill text-sm">star</span>
                          <span>{vendor.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-gray-400">location_on</span>
                        <span>{vendor.location}</span>
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 block">Starting price</span>
                        <strong className="text-base text-gray-900">₹{vendor.starting_price.toLocaleString()}</strong>
                      </div>
                      <div className="flex gap-1">
                        {vendor.services_offered && vendor.services_offered.slice(0, 2).map((s) => (
                          <span key={s} className="bg-[#fff8f7] border border-[#8f3546]/10 text-[#8f3546] text-[9px] font-bold px-2 py-1 rounded truncate max-w-[60px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8f3546]/20 transition-all p-4 flex flex-col sm:flex-row gap-6 group">
                  <div className="relative w-full sm:w-56 h-48 bg-gray-100 overflow-hidden rounded-xl shrink-0">
                    <img 
                      src={vendor.image_url} 
                      alt={vendor.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512496015851-a1fb82e75bc7?w=500&q=80';
                      }}
                    />
                    {vendor.featured && (
                      <div className="absolute top-3 left-3 bg-[#8f3546] text-white px-2 py-0.5 rounded-md text-[8px] uppercase tracking-wider font-bold">
                        Elite
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#8f3546] transition-colors">
                            {vendor.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-gray-400">location_on</span>
                            <span>{vendor.location}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#fff8f7] border border-[#8f3546]/20 px-3 py-1 rounded-full text-xs font-bold text-[#8f3546]">
                          <span className="material-symbols-outlined icon-fill text-sm">star</span>
                          <span>{vendor.rating}</span>
                          <span className="text-gray-400 font-normal">({vendor.reviews})</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {vendor.services_offered && vendor.services_offered.map((s) => (
                          <span key={s} className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">Starting Price</span>
                        <div className="text-xl font-bold text-gray-900">₹{vendor.starting_price.toLocaleString()}</div>
                      </div>
                      <Link href={`/vendor/${vendor.id}`}>
                        <button className="w-full py-2.5 bg-[#8f3546] hover:bg-[#712030] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                          View Portfolio &rarr;
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {filteredVendors.length === 0 && (
          <div className="w-full py-32 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 animate-bounce">search_off</span>
            <h3 className="font-display-custom text-2xl text-gray-900 font-bold mb-2">No Matching Artists Found</h3>
            <p className="font-body-custom text-gray-500 max-w-md">We couldn't find any artists fitting your parameters. Try resetting some filters or searching for local keywords.</p>
          </div>
        )}
      </main>

      {/* The DC Genie AI Slide-out Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 w-[420px] max-w-full bg-white border-l border-gray-150 shadow-2xl z-50 flex flex-col transition-transform duration-500 ${isBotOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-[#8f3546] p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center p-1.5 shadow-inner shrink-0">
            <MagicLampIcon />
          </div>
          <div>
            <h4 className="font-display-custom text-lg font-bold">DC Genie</h4>
            <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">Interactive AI Coordinator</p>
          </div>
          <button className="ml-auto text-white/70 hover:text-white" onClick={() => setIsBotOpen(false)}>
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50 flex flex-col">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} gap-1`}>
              <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-sans-custom ${msg.sender === 'user' ? 'bg-[#8f3546] text-white rounded-tr-none shadow-md' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest px-1">
                {msg.sender === 'user' ? 'You' : 'DC Genie'}
              </span>
            </div>
          ))}
          {isBotTyping && (
            <div className="flex flex-col items-start gap-1">
              <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1 text-xs">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{animationDelay: '100ms'}}>●</span>
                <span className="animate-bounce" style={{animationDelay: '200ms'}}>●</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5">
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 text-gray-800 outline-none" 
              placeholder="Type your bridal query here..." 
              value={botInputValue}
              onChange={(e) => setBotInputValue(e.target.value)}
            />
            <button type="submit" disabled={isBotTyping} className="material-symbols-outlined text-[#8f3546] font-bold hover:scale-110 transition-transform disabled:opacity-50">send</button>
          </div>
        </form>
      </div>

      {/* Floating DC Genie FAB Button */}
      {!isBotOpen && (
        <button 
          className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-[#8f3546] border-2 border-white shadow-2xl overflow-hidden hover:scale-105 transition-transform flex items-center justify-center p-3"
          onClick={() => setIsBotOpen(true)}
        >
          <MagicLampIcon />
        </button>
      )}

    </div>
  );
}