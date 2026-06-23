// supabase/functions/send-booking-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



serve(async (req) => {
  const payload = await req.json();
  const { record } = payload; 
  const vendorId = record.vendor_id; 

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: vendor, error } = await supabase
    .from('vendor')
    .select('email, name')
    .eq('id', vendorId)
    .single();

  if (error || !vendor) {
    return new Response(JSON.stringify({ error: "Vendor not found" }), { status: 404 });
  }

  // Prefix 'res' with an underscore to tell Deno it's intentionally unused
  const _res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Bookings <bookings@yourdomain.com>",
      to: [vendor.email],
      subject: `New Booking for ${vendor.name}!`,
      html: `<h1>New Booking Confirmed!</h1>`
    }),
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});