'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isVendor, setIsVendor] = useState(false);
  const [vendorType, setVendorType] = useState<'makeup' | 'mehendi'>('makeup');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    location: '', starting_price: '', services: ''
  });

  const uploadImage = async (userId: string) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `vendor-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vendor-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('vendor-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleRegister = async (e: React.FormEvent) => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Is user logged in?", session !== null); 
    if (session) {
      console.log("Logged in User ID:", session.user.id);
    }
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name, role: isVendor ? 'vendor' : 'bride' } }
      });
      if (authError) throw authError;

     // 2. Database Insert
      if (isVendor && authData.user) {
        const imageUrl = await uploadImage(authData.user.id);
        const table = vendorType === 'makeup' ? 'vendor' : 'mehendi';

        // NEW ID LOGIC: Uses a short timestamp to guarantee uniqueness
        const prefix = table === 'vendor' ? 'v' : 'm';
        const uniqueSuffix = Date.now().toString().slice(-6); 
        const newId = `${prefix}${uniqueSuffix}`; 

        const { error: dbError } = await supabase.from(table).insert({
          id: newId, 
          user_id: authData.user.id, // <--- UNCOMMENT/ADD THIS LINE BACK
          name: formData.name,
          location: formData.location,
          starting_price: Number(formData.starting_price),
          services_offered: formData.services.split(',').map(s => s.trim()),
          image_url: imageUrl,
          rating: 0
        });

        if (dbError) {
          console.error("Database Insert Error:", dbError);
          throw new Error(`Profile creation failed: ${dbError.message}`);
        }
      }
      router.push(isVendor ? '/dashboard/vendor' : '/profile');
    } catch (err: any) {
      console.error("Full Registration Error:", err);
      alert(err.message || "Registration failed. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold mb-8">Join Dulhan Central</h1>
      
      {/* Role Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button onClick={() => setIsVendor(false)} className={`flex-1 py-2 rounded ${!isVendor ? 'bg-white shadow' : ''}`}>Bride</button>
        <button onClick={() => setIsVendor(true)} className={`flex-1 py-2 rounded ${isVendor ? 'bg-white shadow' : ''}`}>Vendor</button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <input placeholder="Full Name" required className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="email" placeholder="Email" required className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" required className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, password: e.target.value})} />

        {isVendor && (
        <div className="space-y-4 border-t pt-4 mt-4">
            <select className="w-full p-3 border rounded" onChange={(e) => setVendorType(e.target.value as any)}>
              <option value="makeup">Makeup Artist</option>
              <option value="mehendi">Mehendi Artist</option>
            </select>
            <input placeholder="Location (e.g. Vasant Vihar)" required className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, location: e.target.value})} />
            <input type="number" placeholder="Starting Price" required className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, starting_price: e.target.value})} />
            <input placeholder="Services (comma separated)" className="w-full p-3 border rounded" onChange={(e) => setFormData({...formData, services: e.target.value})} />
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Profile Picture</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full p-2 border rounded"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                />
            </div>
        </div>
        )}

        <button disabled={loading} className="w-full bg-[#8f3546] text-white py-3 rounded">
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
    </div>
  );
}