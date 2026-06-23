'use client';

import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';
import Footer from '@/components/footer';
import FilterBar from '@/components/FilterBar';
import MapView from '@/components/MapView';
import BeautyBot from '@/components/BeautyBot';
import SalonCard, { Vendor } from '@/components/SalonCard';

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
  // --- VENDORS STATE ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  // --- FETCH VENDORS ---
  useEffect(() => {
    async function fetchVendors() {
      try {
        const { data, error } = await supabase.from('vendor').select('*');
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

  // --- GEOLOCATION STATES ---
  const [isNearMe, setIsNearMe] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);

  // --- DYNAMIC FILTER OPTIONS ---
  const localities = useMemo(() => {
    const locations = vendors.map(v => v.location?.split(',')[0].trim()).filter(Boolean);
    return ['all', ...Array.from(new Set(locations))];
  }, [vendors]);

  const specialties = useMemo(() => {
    const allServices = vendors.flatMap(v => v.services_offered || []);
    return ['all', ...Array.from(new Set(allServices))];
  }, [vendors]);

  // --- GEOLOCATION HELPER ---
  const getNearbyVendors = () => {
    if (isNearMe) {
      setIsNearMe(false);
      setUserCoords(null);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsNearMe(true);
        }, (err) => alert("Please enable location access to use 'Near Me'"));
      }
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // --- FILTERING LOGIC ---
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor: Vendor) => {
      const matchesSearch = searchQuery === '' ||
        (vendor.name && vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (vendor.location && vendor.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLocality = selectedLocality === 'all' || 
        (vendor.location && vendor.location.toLowerCase().includes(selectedLocality.toLowerCase()));
      const matchesBudget = vendor.starting_price <= maxBudget;
      const matchesSpecialty = selectedSpecialty === 'all' || 
        (vendor.services_offered && vendor.services_offered.some(s => s.toLowerCase() === selectedSpecialty.toLowerCase()));
      const matchesTravels = travelsToVenue === 'all' || 
        (vendor.service_mode && (travelsToVenue === 'yes' ? vendor.service_mode.includes('home') : vendor.service_mode.includes('salon')));
      const matchesRating = selectedRating === 'all' || vendor.rating >= Number(selectedRating);

      // Distance matching
      let matchesNearMe = true;
        if (isNearMe && userCoords) {
          const coords = (vendor as any).coordinates;
          if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
            const dist = calculateDistance(userCoords.lat, userCoords.lng, coords.lat, coords.lng);
            matchesNearMe = dist <= 10; // 10km radius
          }
      }

      return matchesSearch && matchesLocality && matchesBudget && matchesSpecialty && matchesTravels && matchesRating && matchesNearMe;
    });
  }, [vendors, searchQuery, selectedLocality, maxBudget, selectedSpecialty, travelsToVenue, selectedRating, isNearMe, userCoords]);

  return (
    <div className="bg-[#fff8f7] text-[#22191a] font-sans-custom min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-body-custom { font-family: 'Libre Caslon Text', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        .icon-fill { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
      `}} />

      <Navbar />

      <FilterBar 
        localities={localities}
        specialties={specialties}
        selectedLocality={selectedLocality}
        setSelectedLocality={setSelectedLocality}
        maxBudget={maxBudget}
        setMaxBudget={setMaxBudget}
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        travelsToVenue={travelsToVenue}
        setTravelsToVenue={setTravelsToVenue}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
      />

      {/* Main Arena */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 pt-8 pb-20">
        
        {/* Breadcrumb & Hero Title */}
        <div className="mb-6">
          <nav className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <span>Home</span> <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Vendors</span> <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-gray-800 font-semibold">Bridal Makeup Artists</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-4">
            <div>
              <h1 className="font-display-custom text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Bridal Makeup Artists in Delhi NCR
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                Showing <strong className="text-gray-900">{filteredVendors.length} results</strong> as per your search criteria
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Location Toggle */}
              <button 
                onClick={getNearbyVendors} 
                className={`px-4 py-3 sm:py-2 text-sm sm:text-xs font-bold rounded-xl border transition-all h-full flex items-center justify-center min-w-[140px] shadow-sm hover:shadow-md ${
                  isNearMe 
                  ? 'bg-[#8f3546] text-white border-[#8f3546]' 
                  : 'bg-white border-gray-200 text-[#8f3546]'
                }`}
              >
                {isNearMe ? '✓ Near Me (10km)' : '📍 Find Near Me'}
              </button>

              {/* Visual Callout for the Bot */}
              <div className="bg-white border border-[#8f3546]/20 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
                <MagicLampIcon />
                <div className="text-sm">Need Help? <strong className="text-[#8f3546]">Click the DC Genie</strong> icon below!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Search & Views) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-gray-200/60 mb-8">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" placeholder="Search Bridal Makeup Artists..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#8f3546]"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">search</span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${showMap ? 'bg-[#8f3546] text-white border-[#8f3546]' : 'bg-white border-gray-200 text-[#8f3546] hover:bg-[#fff8f7]'}`}
            >
              <span className="material-symbols-outlined text-[16px]">{showMap ? 'grid_view' : 'map'}</span> 
              {showMap ? 'Grid View' : 'Map View'}
            </button>
            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button onClick={() => { setLayoutMode('list'); setShowMap(false); }} className={`p-2 hover:bg-[#fff8f7] transition-colors ${layoutMode === 'list' && !showMap ? 'bg-[#fff8f7]' : ''}`}>
                <ListIcon active={layoutMode === 'list' && !showMap} />
              </button>
              <button onClick={() => { setLayoutMode('grid'); setShowMap(false); }} className={`p-2 hover:bg-[#fff8f7] transition-colors ${layoutMode === 'grid' && !showMap ? 'bg-[#fff8f7]' : ''}`}>
                <GridIcon active={layoutMode === 'grid' && !showMap} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Render (Components Integrated) */}
        {showMap ? (
          <MapView vendors={filteredVendors} />
        ) : (
          layoutMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVendors.map((vendor) => (
                <SalonCard key={vendor.id} vendor={vendor} mode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVendors.map((vendor) => (
                <SalonCard key={vendor.id} vendor={vendor} mode="list" />
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

      {/* Global AI Assistant */}
      <BeautyBot />
      <Footer />
    </div>
  );
}