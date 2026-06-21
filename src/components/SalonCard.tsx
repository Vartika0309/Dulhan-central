import Link from 'next/link';

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
}

export default function SalonCard({ vendor, mode }: { vendor: Vendor, mode: 'grid' | 'list' }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1512496015851-a1fb82e75bc7?w=500&q=80';

  if (mode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8f3546]/20 transition-all p-4 flex flex-col sm:flex-row gap-6 group">
        <div className="relative w-full sm:w-56 h-48 bg-gray-100 overflow-hidden rounded-xl shrink-0">
          <img 
            src={vendor.image_url} 
            alt={vendor.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
          />
          {vendor.featured && (
            <div className="absolute top-3 left-3 bg-[#8f3546] text-white px-2 py-0.5 rounded-md text-[8px] uppercase tracking-wider font-bold">Elite</div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#8f3546] transition-colors">{vendor.name}</h3>
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
              {vendor.services_offered?.map((s) => (
                <span key={s} className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg">{s}</span>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Starting Price</span>
              <div className="text-xl font-bold text-gray-900">₹{vendor.starting_price.toLocaleString()}</div>
            </div>
            <Link href={`/vendor/${vendor.id}`}>
              <button className="w-full py-2.5 px-6 bg-[#8f3546] hover:bg-[#712030] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                View Portfolio &rarr;
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8f3546]/20 transition-all flex flex-col group">
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        <img 
          src={vendor.image_url} 
          alt={vendor.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
        />
        {vendor.featured && (
          <div className="absolute top-4 left-4 bg-[#8f3546] text-white px-3 py-1 rounded-md text-[9px] uppercase tracking-[0.15em] font-bold shadow-md">Elite</div>
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
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#8f3546] transition-colors truncate">{vendor.name}</h3>
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
            {vendor.services_offered?.slice(0, 2).map((s) => (
              <span key={s} className="bg-[#fff8f7] border border-[#8f3546]/10 text-[#8f3546] text-[9px] font-bold px-2 py-1 rounded truncate max-w-[60px]">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}