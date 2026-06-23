'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/NavBar';

export default function AIScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  const router = useRouter();
  
  // States
  const [vendors, setVendors] = useState<any[]>([]); // Will hold real DB vendors
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Added state for upload

  useEffect(() => {
    async function init() {
      // 1. Fetch real vendors from Supabase
      const { data: dbVendors } = await supabase.from('vendor').select('id, name, rating');
      if (dbVendors) setVendors(dbVendors);

      // 2. Persistence check
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.user_metadata?.ai_analysis) {
        setResult(session.user.user_metadata.ai_analysis);
        setScanComplete(true);
      }
      setLoadingMetadata(false);
    }
    init();
    return () => stopCamera();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera(); // Stop camera if active
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runAIScan = async () => {
    // FIX: Allow scan if camera is active OR an image is selected
    if ((!cameraActive && !selectedImage) || vendors.length === 0) {
      alert("Please initialize the camera or upload a photo first.");
      return;
    }
    
    setIsScanning(true);

    setTimeout(async () => {
      setIsScanning(false);
      setScanComplete(true);
      stopCamera(); // This is safe even if already stopped
      
      // Dynamic selection: Pick 2 random vendors from the database
      const randomMatches = [...vendors]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      const aiProfile = {
        shape: ['Oval', 'Heart', 'Round'][Math.floor(Math.random() * 3)],
        tone: ['Warm Olive', 'Cool Fair', 'Neutral Medium'][Math.floor(Math.random() * 3)],
        style: 'Custom Bridal Glow',
        palette: 'Peachy & Earthy tones',
        matches: randomMatches 
      };

      setResult(aiProfile);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.updateUser({ data: { ai_analysis: aiProfile } });
      }
    }, 3500);
  };

  // ... (Keep the rest of the camera/reset functions the same)

  const startCamera = async () => {
    try {
      setSelectedImage(null); // Clear image if switching to camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setPermissionDenied(false);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setPermissionDenied(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  

  const resetScan = () => {
    setScanComplete(false);
    setResult(null);
    startCamera();
  };

  if (loadingMetadata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#8f3546]/20 border-t-[#8f3546] rounded-full animate-spin mb-4"></div>
          <h2 className="text-gray-300 font-bold tracking-widest uppercase text-sm">Loading Consultant...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] min-h-screen text-white font-sans-custom">
      {/* Custom Styles for the Laser Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .font-display-custom { font-family: 'Playfair Display', serif; }
        
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scanline 2s linear infinite;
        }
      `}} />

      {/* Using a dark navbar variation for the scanner */}
      <div className="absolute top-0 w-full z-50">
        <Navbar />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center min-h-screen">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-display-custom font-bold text-white mb-3">Bridal AI <span className="text-[#d67b8c]">Consultant</span></h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">Allow camera access to analyze your facial structure and skin undertones for personalized makeup vendor recommendations.</p>
        </div>

        {/* --- SCANNER INTERFACE --- */}
        {!scanComplete ? (
        <>
        <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-gray-800">
               <video ref={videoRef} autoPlay playsInline muted className={!cameraActive ? 'hidden' : 'block w-full h-full object-cover'} />
               {selectedImage && <img src={selectedImage} alt="Uploaded" className="w-full h-full object-cover" />}
               {!cameraActive && !selectedImage && <span className="text-gray-600">No Image Selected</span>}
               
               {isScanning && <div className="absolute inset-0 border-t-4 border-[#d67b8c] animate-scan shadow-[0_0_20px_#d67b8c]"></div>}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={startCamera} className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-[10px] uppercase">Camera</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold text-[10px] uppercase">Upload Photo</button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            </div>

            <div className="mt-4">
              <button 
                onClick={runAIScan} 
                disabled={isScanning || (!cameraActive && !selectedImage)} 
                className="w-full bg-[#8f3546] disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase text-xs"
              >
                {isScanning ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
            </div>
        </>
        ) : (
          
          /* --- RESULTS INTERFACE --- */
          <div className="w-full max-w-2xl bg-white text-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fff8f7] rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-center gap-2 mb-8 text-[#8f3546]">
              <span className="material-symbols-outlined text-3xl">verified</span>
              <h2 className="text-xl font-bold uppercase tracking-widest">Analysis Complete</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Face Shape</p>
                <p className="text-2xl font-display-custom font-bold text-gray-900">{result?.shape}</p>
                
                <div className="w-full h-px bg-gray-200 my-4"></div>
                
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Skin Undertone</p>
                <p className="text-2xl font-display-custom font-bold text-gray-900">{result?.tone}</p>
              </div>

              <div className="bg-[#fff8f7] rounded-2xl p-6 border border-[#8f3546]/10">
                <p className="text-xs text-[#8f3546]/70 font-bold uppercase tracking-widest mb-1">Ideal Makeup Style</p>
                <p className="text-2xl font-display-custom font-bold text-gray-900">{result?.style}</p>
                
                <div className="w-full h-px bg-[#8f3546]/10 my-4"></div>
                
                <p className="text-xs text-[#8f3546]/70 font-bold uppercase tracking-widest mb-1">Color Palette</p>
                <p className="text-lg font-bold text-[#8f3546]">{result?.palette}</p>
              </div>
            </div>

            <div className="text-center border-t border-gray-100 pt-8">
              <p className="text-sm text-gray-500 font-medium mb-4">Based on your metrics, we found your perfect artist matches.</p>
              
              {/* Clickable Recommended Vendors linked to specific IDs */}
              <div className="mt-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recommended For You</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {result?.matches.map((match: any) => (
                    <button 
                      key={match.id}
                      onClick={() => router.push(`/vendor/${match.id}`)}
                      className="bg-white border border-[#8f3546]/20 px-6 py-3 rounded-xl text-[#8f3546] font-bold text-xs shadow-sm flex items-center gap-2 hover:bg-[#8f3546] hover:text-white transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">brush</span>
                      {match.name}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => router.push('/search')}
                  className="mt-8 bg-[#22191a] text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors w-full md:w-auto"
                >
                  View Full Vendor List
                </button>
              </div>
              
              <button 
                onClick={resetScan}
                className="mt-6 block mx-auto text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-gray-800 transition-colors underline underline-offset-2"
              >
                Rescan Face
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}