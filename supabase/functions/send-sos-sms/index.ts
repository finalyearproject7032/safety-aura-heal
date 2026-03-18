import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY');
    if (!TWILIO_API_KEY) throw new Error('TWILIO_API_KEY is not configured');

    const TWILIO_FROM = Deno.env.get('TWILIO_FROM_NUMBER');
    if (!TWILIO_FROM) throw new Error('TWILIO_FROM_NUMBER is not configured');

    const body = await req.json();
    const { name, phone, gender, bloodGroup, emergencyContacts, location, timestamp } = body;

    // Build detailed SMS message
    const locationText = location
      ? `📍 Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}\n🗺️ Maps: https://maps.google.com/?q=${location.lat},${location.lng}`
      : '📍 Location: Unable to detect';

    const emergencyMessage = [
      `🚨 EMERGENCY SOS ALERT 🚨`,
      ``,
      `👤 Name: ${name}`,
      `📱 Mobile: ${phone}`,
      `⚧ Gender: ${gender?.toUpperCase() || 'N/A'}`,
      `🩸 Blood Group: ${bloodGroup || 'N/A'}`,
      ``,
      locationText,
      ``,
      `⏰ Time: ${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      ``,
      `⚠️ This person needs IMMEDIATE help. Please call them or contact emergency services (112).`,
    ].join('\n');

    // Collect all recipients: the user's own number + all emergency contacts
    const recipients: string[] = [];

    // Add emergency contacts (assuming phone numbers are stored in international format)
    if (emergencyContacts && Array.isArray(emergencyContacts)) {
      for (const contact of emergencyContacts) {
        if (contact.phone) {
          // Format phone number to E.164 if it starts with 0 or is 10 digits (Indian number)
          let formatted = contact.phone.replace(/\s+/g, '').replace(/-/g, '');
          if (formatted.startsWith('0')) formatted = '+91' + formatted.slice(1);
          if (/^\d{10}$/.test(formatted)) formatted = '+91' + formatted;
          if (!formatted.startsWith('+')) formatted = '+' + formatted;
          recipients.push(formatted);
        }
      }
    }

    if (recipients.length === 0) {
      // Fallback: send to the user's own phone if no emergency contacts
      let userPhone = phone?.replace(/\s+/g, '').replace(/-/g, '') || '';
      if (userPhone.startsWith('0')) userPhone = '+91' + userPhone.slice(1);
      if (/^\d{10}$/.test(userPhone)) userPhone = '+91' + userPhone;
      if (!userPhone.startsWith('+')) userPhone = '+' + userPhone;
      recipients.push(userPhone);
    }

    // Send SMS to each recipient
    const results = await Promise.allSettled(
      recipients.map(async (to) => {
        const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': TWILIO_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: TWILIO_FROM,
            Body: emergencyMessage,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Twilio error [${response.status}] to ${to}: ${JSON.stringify(data)}`);
        }
        return { to, sid: data.sid, status: data.status };
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message || 'Unknown error');

    return new Response(
      JSON.stringify({
        success: sent > 0,
        sent,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        recipients: recipients.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SOS SMS Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
