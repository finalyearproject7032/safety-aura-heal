import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { symptoms, bloodGroup, allergies, conditions, fileBase64, fileMimeType, fileName, mode } = body;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    let messages: unknown[];

    // ── Mode: analyze uploaded medical document ──
    if (mode === 'file' && fileBase64 && fileMimeType) {
      const systemPrompt = `You are AegisMed AI Doctor — a medical document analyst.
The user has uploaded a medical report/document. Analyze it thoroughly and provide:

📋 **Document Summary**
- What type of report this is (lab test, X-ray, ECG, prescription, etc.)
- Key findings and values mentioned

🔍 **Key Medical Insights**
- What the results mean in simple language
- Any values that are abnormal or out of range (highlight these clearly)
- What conditions or risk factors they suggest

💊 **Recommendations**
- What specialist the patient should consult based on findings
- Any immediate actions needed
- Simple OTC remedies if applicable

⚠️ **Red Flags**
- Any urgent or critical values that need immediate attention

RULES:
- Use simple, clear language a non-medical person can understand
- Always recommend consulting a real doctor
- Format with clear sections and emojis for readability
- If values are normal, clearly reassure the patient`;

      const userContent: unknown[] = [
        {
          type: 'text',
          text: `Please analyze this medical document (${fileName || 'uploaded file'}).
Patient Profile:
- Blood Group: ${bloodGroup || 'Not specified'}
- Known Allergies: ${allergies?.length ? allergies.join(', ') : 'None'}
- Existing Conditions: ${conditions?.length ? conditions.join(', ') : 'None'}

Provide a detailed summary and medical insights.`,
        },
      ];

      // Attach file as image (for images) or inline data (for PDFs)
      if (fileMimeType.startsWith('image/')) {
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${fileMimeType};base64,${fileBase64}` },
        });
      } else if (fileMimeType === 'application/pdf') {
        // Gemini supports PDF inline
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:application/pdf;base64,${fileBase64}` },
        });
      }

      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ];

    } else {
      // ── Mode: symptom analysis (default) ──
      const systemPrompt = `You are AegisMed AI Doctor — a knowledgeable medical assistant. 
Analyze the user's symptoms and provide:
1. Likely condition/diagnosis (brief)
2. Recommended specialist to consult
3. Simple OTC medications or remedies they can try immediately (with dosage)
4. Urgent red flags to watch for
5. Lifestyle tips

IMPORTANT RULES:
- Always recommend consulting a real doctor for serious symptoms
- For medicines, only suggest common OTC (over-the-counter) drugs
- Keep responses clear, concise, and in simple language
- Format your response in clear sections with emojis for readability
- Consider the patient's blood group and any known allergies/conditions when advising`;

      const userMessage = `
Patient Profile:
- Blood Group: ${bloodGroup || 'Not specified'}
- Known Allergies: ${allergies?.length ? allergies.join(', ') : 'None'}
- Existing Conditions: ${conditions?.length ? conditions.join(', ') : 'None'}

Symptoms: ${symptoms}

Please analyze and provide medical guidance.`;

      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ];
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errBody = await response.text();
      throw new Error(`AI gateway error: ${response.status} — ${errBody}`);
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || 'Unable to generate analysis. Please consult a doctor.';

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Doctor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
