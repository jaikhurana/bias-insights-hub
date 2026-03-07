import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { opinionId, content, caseTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a cognitive bias analyst for MBA case study discussions. Analyze the given opinion about a business case and return structured analysis.

You MUST use the analyze_bias tool to return your analysis.

Guidelines:
- Identify cognitive biases present in the opinion (confirmation bias, anchoring bias, survivorship bias, herd mentality, sunk cost fallacy, availability heuristic, overconfidence bias, status quo bias, etc.)
- For each bias, provide a clear explanation of how it manifests in the text
- Rate severity as "low", "medium", or "high"
- Suggest 2-3 alternative perspectives the author may have missed
- Generate 3 arguments FOR and 3 arguments AGAINST the position`;

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
          { role: "user", content: `Case: "${caseTitle}"\n\nOpinion to analyze:\n"${content}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_bias",
              description: "Return the structured bias analysis results",
              parameters: {
                type: "object",
                properties: {
                  biases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        explanation: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high"] },
                      },
                      required: ["name", "explanation", "severity"],
                      additionalProperties: false,
                    },
                  },
                  perspectives: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["title", "description"],
                      additionalProperties: false,
                    },
                  },
                  debate_for: {
                    type: "array",
                    items: { type: "string" },
                  },
                  debate_against: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["biases", "perspectives", "debate_for", "debate_against"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_bias" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const analysis = JSON.parse(toolCall.function.arguments);

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const insertResp = await fetch(`${supabaseUrl}/rest/v1/bias_analyses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        opinion_id: opinionId,
        biases: analysis.biases,
        perspectives: analysis.perspectives,
        debate_for: analysis.debate_for,
        debate_against: analysis.debate_against,
      }),
    });

    if (!insertResp.ok) {
      const errText = await insertResp.text();
      console.error("DB insert error:", errText);
      throw new Error("Failed to save analysis");
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-bias error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
