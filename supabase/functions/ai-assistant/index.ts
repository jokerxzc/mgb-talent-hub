import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssistantRequest {
  type: "job-match" | "application-tips" | "qualification-check" | "general";
  context?: {
    vacancyTitle?: string;
    vacancyRequirements?: {
      education?: string;
      experience?: string;
      training?: string;
      eligibility?: string;
    };
    userProfile?: {
      education?: string[];
      experience?: string[];
    };
    userQuestion?: string;
  };
}

const systemPrompts: Record<string, string> = {
  "job-match": `You are an AI career advisor for a Philippine government job application system (Mines and Geosciences Bureau - MGB).
Your role is to analyze how well an applicant matches a specific job vacancy.

Provide a brief, encouraging assessment that:
1. Highlights matching qualifications (education, experience, training)
2. Identifies gaps and suggests how to address them
3. Gives a match score (Excellent/Good/Fair/Needs Improvement)
4. Provides 2-3 specific tips to strengthen the application

Keep responses concise (under 200 words) and professional. Use Filipino-friendly English.`,

  "application-tips": `You are an AI career advisor helping applicants prepare strong job applications for Philippine government positions.

Provide practical, actionable advice on:
1. Required documents (PDS, resume, transcripts, certificates)
2. How to present qualifications effectively
3. Common mistakes to avoid
4. Civil service eligibility requirements

Keep advice specific, actionable, and under 150 words.`,

  "qualification-check": `You are an AI assistant helping applicants understand job requirements at the Mines and Geosciences Bureau (MGB).

Explain qualification requirements in simple terms:
1. Education requirements (degree levels, relevant fields)
2. Experience requirements (years, type of work)
3. Training requirements (hours, relevance)
4. Eligibility requirements (civil service, professional licenses)

Be clear and encouraging. Under 150 words.`,

  "general": `You are a helpful AI assistant for the MGB Online Job Application System.
Help applicants with questions about:
- How to apply for positions
- Understanding job requirements
- Document preparation
- Application status and process

Be friendly, professional, and concise. Under 150 words.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user session with Supabase Auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration is missing");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, context }: AssistantRequest = await req.json();

    let userMessage = "";
    const systemPrompt = systemPrompts[type] || systemPrompts["general"];

    switch (type) {
      case "job-match":
        userMessage = `Analyze this job match:

Position: ${context?.vacancyTitle || "Unknown"}

Job Requirements:
- Education: ${context?.vacancyRequirements?.education || "Not specified"}
- Experience: ${context?.vacancyRequirements?.experience || "Not specified"}
- Training: ${context?.vacancyRequirements?.training || "Not specified"}
- Eligibility: ${context?.vacancyRequirements?.eligibility || "Not specified"}

Applicant's Background:
- Education: ${context?.userProfile?.education?.join(", ") || "Not provided"}
- Experience: ${context?.userProfile?.experience?.join(", ") || "Not provided"}

Provide a brief match assessment.`;
        break;

      case "qualification-check":
        userMessage = `Explain the requirements for this position:

Position: ${context?.vacancyTitle || "Unknown"}
- Education: ${context?.vacancyRequirements?.education || "Not specified"}
- Experience: ${context?.vacancyRequirements?.experience || "Not specified"}
- Training: ${context?.vacancyRequirements?.training || "Not specified"}
- Eligibility: ${context?.vacancyRequirements?.eligibility || "Not specified"}`;
        break;

      case "application-tips":
        userMessage = `Provide tips for applying to: ${context?.vacancyTitle || "a government position"}`;
        break;

      default:
        userMessage = context?.userQuestion || "How can I apply for a job at MGB?";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: content }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});