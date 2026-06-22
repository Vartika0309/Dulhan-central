'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';
import Footer from '@/components/footer';

interface InspirationImage {
  id: number;
  image_url: string;
  category: string; // Restored to 'category' to match your database column
}

export default function InspirationCategoryPage() {
  const params = useParams();
  const router = useRouter();
  
  // This automatically grabs 'makeup' or 'mehendi' straight from the URL
  const category = typeof params?.category === 'string' ? params.category.toLowerCase() : '';
  
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    async function fetchImages() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inspiration_images')
          .select('*')
          .eq('category', category); // Looks in the 'category' column for the matching word

        if (error) throw error;
        if (data) setImages(data);
      } catch (err) {
        console.error('Error fetching inspiration images:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [category]);

  const displayTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-background text-on-background font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        .font-sans-custom { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}} />
      <Navbar />

      <main className="pt-[100px] pb-24 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="mb-10">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors mb-4 bg-transparent border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
            Back to Home
          </button>
          
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary tracking-wide capitalize">
            {displayTitle} Moodboard
          </h1>
          <p className="text-gray-500 mt-2">Curated luxury lookbooks and design concepts for your special day.</p>
          <div className="w-16 h-0.5 bg-primary mt-6"></div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">collections</span>
            <p className="text-gray-500">No images uploaded for {category} yet.</p>
          </div>
        )}

        {!loading && images.length > 0 && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {images.map((img) => (
              <div 
                key={img.id} 
                className="break-inside-avoid overflow-hidden rounded-md bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative"
              >
                <img 
                  src={img.image_url} 
                  alt={`${category} inspiration`}
                  className="w-full h-auto object-cover display-block"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}