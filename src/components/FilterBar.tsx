'use client';

import { useState, useEffect, useRef } from 'react';

interface FilterBarProps {
  localities: string[];
  specialties: string[];
  selectedLocality: string;
  setSelectedLocality: (val: string) => void;
  maxBudget: number;
  setMaxBudget: (val: number) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (val: string) => void;
  travelsToVenue: string;
  setTravelsToVenue: (val: string) => void;
  selectedRating: string;
  setSelectedRating: (val: string) => void;
}

export default function FilterBar({
  localities,
  specialties,
  selectedLocality,
  setSelectedLocality,
  maxBudget,
  setMaxBudget,
  selectedSpecialty,
  setSelectedSpecialty,
  travelsToVenue,
  setTravelsToVenue,
  selectedRating,
  setSelectedRating
}: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const hasActiveFilters = selectedLocality !== 'all' || maxBudget < 150000 || selectedSpecialty !== 'all' || travelsToVenue !== 'all' || selectedRating !== 'all';

  const resetFilters = () => {
    setSelectedLocality('all');
    setMaxBudget(150000);
    setSelectedSpecialty('all');
    setTravelsToVenue('all');
    setSelectedRating('all');
    setActiveDropdown(null);
  };

  return (
    <section className="bg-white border-b border-gray-100 pt-24 sticky top-0 z-40 shadow-sm" ref={filterRef}>
      <div className="max-w-full px-6 md:px-16 py-3 flex flex-wrap gap-4 items-center">
        
        {/* Locality Filter */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'locality' ? null : 'locality'); }}
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

        {/* Budget Filter */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'budget' ? null : 'budget'); }}
            className="text-gray-700 text-sm hover:text-[#8f3546] font-medium flex items-center gap-1 transition-colors py-1 px-3 border border-gray-200 rounded-full"
          >
            Budget ▾
          </button>
          {activeDropdown === 'budget' && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Max Budget</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[#8f3546]">Up to ₹{maxBudget.toLocaleString()}</span>
              </div>
              <input 
                type="range" min="10000" max="150000" step="5000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-[#8f3546] cursor-pointer"
              />
              <button onClick={() => setActiveDropdown(null)} className="w-full mt-4 bg-gray-100 text-gray-700 text-xs py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors">Apply Filter</button>
            </div>
          )}
        </div>

        {/* Specialty Filter */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'specialty' ? null : 'specialty'); }}
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

        {/* Travels to Venue Filter */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'travels' ? null : 'travels'); }}
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

        {/* Rating Filter */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'rating' ? null : 'rating'); }}
            className="text-gray-700 text-sm hover:text-[#8f3546] font-medium flex items-center gap-1 transition-colors py-1 px-3 border border-gray-200 rounded-full"
          >
            Rating {selectedRating !== 'all' ? `(${selectedRating}+)` : ''} ▾
          </button>
          {activeDropdown === 'rating' && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2">
              <button onClick={() => { setSelectedRating('all'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">All Ratings</button>
              <button onClick={() => { setSelectedRating('4.8'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">★ 4.8 & above</button>
              <button onClick={() => { setSelectedRating('4.9'); setActiveDropdown(null); }} className="w-full text-left p-2 text-sm hover:bg-[#fff8f7] rounded-lg">★ 4.9 & above</button>
            </div>
          )}
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button 
            onClick={resetFilters}
            className="text-xs text-red-500 font-bold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </section>
  );
}