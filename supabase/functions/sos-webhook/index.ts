import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = 'https://finalpro1.app.n8n.cloud/webhook-test/c13188c3-072a-4aff-9f47-574fb51226b8';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      name,
      phone,
      gender,
      bloodGroup,
      allergies,
      conditions,
      emergencyContacts,
      location,
      timestamp,
    } = body;

    // Build per-contact list for easy iteration in n8n
    const contactsSummary = (emergencyContacts || [])
      .map((c: { name: string; phone: string; email?: string; relation: string }, i: number) =>
        `Contact ${i + 1}: ${c.name} (${c.relation}) | 📱 ${c.phone}${c.email ? ` | 📧 ${c.email}` : ''}`
      )
      .join('\n') || 'None provided';

    const mapsLink = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : null;

    const payload = {
      type: 'SOS',
      name: name || 'Unknown',
      phone: phone || 'N/A',
      gender: gender || 'N/A',
      bloodGroup: bloodGroup || 'N/A',
      allergies: allergies || [],
      conditions: conditions || [],
      emergencyContacts: emergencyContacts || [],
      location: location
        ? {
            lat: location.lat,
            lng: location.lng,
            address: location.address || 'Unknown',
            mapsLink,
          }
        : null,
      timestamp: timestamp || new Date().toISOString(),
      // Formatted SMS message that n8n / Twilio node can use directly
      smsMessage: [
        `🚨 EMERGENCY SOS ALERT 🚨`,
        ``,
        `👤 Name: ${name || 'Unknown'}`,
        `📱 Mobile: ${phone || 'N/A'}`,
        `⚧ Gender: ${(gender || 'N/A').toUpperCase()}`,
        `🩸 Blood Group: ${bloodGroup || 'N/A'}`,
        ``,
        mapsLink
          ? `📍 Location: ${mapsLink}`
          : `📍 Location: Unable to detect`,
        ``,
        `⏰ Time: ${new Date(timestamp || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
        ``,
        `⚠️ This person needs IMMEDIATE help. Please call or contact emergency services (112).`,
      ].join('\n'),
    };

    console.log('Forwarding SOS payload to n8n:', JSON.stringify(payload));

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await n8nRes.text();
    console.log('n8n response:', n8nRes.status, responseText);

    if (!n8nRes.ok && n8nRes.status !== 404) {
      throw new Error(`n8n webhook returned ${n8nRes.status}: ${responseText}`);
    }

    return new Response(
      JSON.stringify({ success: true, n8nStatus: n8nRes.status, payload }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SOS webhook proxy error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
