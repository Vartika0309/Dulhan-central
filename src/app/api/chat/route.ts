import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // <-- Import Supabase dynamically

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "🔴 Missing API Key: I can't find 'GEMINI_API_KEY' in your .env.local file. Please make sure that file is in your project's root folder." 
      });
    }

    // 1. Fetch Makeup Artists from Supabase
    const { data: makeupVendors } = await supabase
      .from('vendor')
      .select('name, location, starting_price, services_offered');

    // 2. Fetch Mehendi Artists from Supabase
    const { data: mehendiVendors } = await supabase
      .from('mehendi')
      .select('name, location, starting_price, services_offered');

    // 3. Combine them and label their categories for the AI
    const combinedData = [
      ...(makeupVendors || []).map(v => ({ category: 'Makeup Artist', ...v })),
      ...(mehendiVendors || []).map(v => ({ category: 'Mehendi Artist', ...v }))
    ];

    const simplifiedVendors = combinedData.map(v => ({
      category: v.category,
      name: v.name,
      location: v.location,
      price: v.starting_price,
      services: v.services_offered?.join(', ') || ''
    }));

    const systemPrompt = `
    You are BeautyBot (DC Genie), an elite bridal concierge for 'Dulhan Central' in Delhi NCR.
    A user is asking for advice. Use ONLY the following list of real vendors from our database to give them a specific, helpful recommendation.
    Pay attention to whether they need Makeup or Mehendi. 
    Keep your answer friendly, relatively short (2-4 sentences max), and mention the vendor's starting price and location. Do not use bold formatting.

    OUR VENDOR DATABASE:
    ${JSON.stringify(simplifiedVendors)}
    `;

    // Try multiple stable production models on v1 and v1beta as fallback
    const modelsToTry = [
      { name: 'gemini-1.5-flash', version: 'v1' },
      { name: 'gemini-2.5-flash', version: 'v1' },
      { name: 'gemini-1.5-flash', version: 'v1beta' }
    ];

    let lastError = null;
    let botReply = '';

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemPrompt + "\n\nUser Question: " + message }] }
            ]
          })
        });

        const data = await response.json();

        if (response.ok) {
          botReply = data.candidates[0].content.parts[0].text;
          break; // Successfully got a response, break out of retry loop!
        } else {
          lastError = data?.error?.message || JSON.stringify(data);
          console.warn(`Model ${model.name} on ${model.version} failed:`, lastError);
        }
      } catch (err: any) {
        lastError = err?.message || err;
        console.warn(`Fetch error for model ${model.name}:`, lastError);
      }
    }

    if (!botReply) {
      return NextResponse.json({ 
        reply: `❌ Google API Error: Could not establish a connection to Gemini models on stable v1/v1beta. Last error was: "${lastError}". Please double-check your API key configuration.` 
      });
    }

    return NextResponse.json({ reply: botReply });

  } catch (error: any) {
    console.error("Backend Catch-All Error:", error);
    return NextResponse.json({ reply: `⚠️ Server connection error: ${error?.message || error}` });
  }
}