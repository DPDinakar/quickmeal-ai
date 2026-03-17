import { NextResponse } from "next/server";
import { MealPlanRequestSchema } from "@/lib/mealplan-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

async function readUpstreamBody(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const j = await res.json().catch(() => null);
    return { kind: "json" as const, json: j };
  }
  const t = await res.text().catch(() => "");
  return { kind: "text" as const, text: t };
}

/**
 * ✅ NORMALIZE AI RESPONSE → UI FORMAT
 */
function normalizeAIResponse(parsedJson: any) {
  const mapMeal = (meal: any) => ({
    name:
      meal?.name ??
      meal?.recipeName ??
      meal?.meal ??
      "N/A",

    calories: meal?.calories ?? 0,

    timeMinutes:
      meal?.timeMinutes ??
      meal?.cookingTimeMinutes ??
      10,

    steps:
      meal?.steps && meal.steps.length > 0
        ? meal.steps
        : [
            "Prepare all ingredients",
            "Heat a pan with some oil",
            "Cook ingredients for 5–10 minutes",
            "Season to taste",
            "Serve hot",
          ],

    ingredients: meal?.ingredients ?? [],
  });

  return {
    breakfast: mapMeal(parsedJson?.breakfast),
    lunch: mapMeal(parsedJson?.lunch),
    dinner: mapMeal(parsedJson?.dinner),
    snack: mapMeal(parsedJson?.snack),

    dailyTotals: {
      calories: parsedJson?.dailyTotals?.calories ?? 0,
      proteinGrams: parsedJson?.dailyTotals?.protein ?? 0,
      carbsGrams: parsedJson?.dailyTotals?.carbs ?? 0,
      fatGrams: parsedJson?.dailyTotals?.fats ?? 0,
    },

    groceryList: Array.isArray(parsedJson?.groceryList)
  ? parsedJson.groceryList.map((item: any) => {
      if (typeof item === "string") {
        return {
          item,
          quantity: "",
        };
      }

      return {
        item:
          item?.item ??
          item?.name ??
          "Unknown item",

        quantity:
          item?.quantity ??
          item?.qty ??
          "",
      };
    })
  : [],
  };
}

/**
 * ✅ STRONG PROMPT (BETTER UX)
 */
function buildSystemPrompt() {
  return `
You are QuickMeal AI, a smart meal planning assistant.

Goal: Help users cook QUICK, SIMPLE, TASTY meals, Suggest grocery list.

STRICT RULES:

1. Return ONLY JSON (no text, no markdown)

2. Each meal must include:
- meal (string)
- ingredients (array)
- calories (number)
- steps (array of 4–6 steps)

3. Steps must be:
- Beginner friendly
- Clear and actionable
- Include time hints

GOOD EXAMPLE:
- "Heat 1 tbsp oil in a pan"
- "Add spinach and cook for 2–3 minutes"
- "Crack eggs and cook for 3 minutes"

BAD EXAMPLE:
- "Cook and serve"

4. Match user ingredients where possible

Return structure:

{
  "breakfast": {...},
  "lunch": {...},
  "dinner": {...},
  "snack": {...},
  "dailyTotals": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number
  },
  "groceryList": [
  {
    "item": string,
    "quantity": string
  }
]
}
`;
}

function buildUserPrompt(input: unknown) {
  return `User request: ${JSON.stringify(input)}`;
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = env("OPENROUTER_API_KEY").trim();

    const body = await req.json().catch(() => null);

    const parsedReq = MealPlanRequestSchema.safeParse(body);
    if (!parsedReq.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsedReq.error.flatten() },
        { status: 400 }
      );
    }

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(parsedReq.data) },
        ],
      }),
    });

    if (!upstream.ok) {
      const body = await readUpstreamBody(upstream);
      return NextResponse.json(
        { error: "OpenRouter failed", details: body },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 500 }
      );
    }

    console.log("AI RAW:", content);

    let parsedJson;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from AI" },
        { status: 500 }
      );
    }

    const finalData = normalizeAIResponse(parsedJson);

    console.log("FINAL:", finalData);

    const day = new Date().toISOString().slice(0, 10);

    await supabase.from("plans").insert({
      user_id: user.id,
      day,
      input: parsedReq.data,
      output: finalData,
    });

    return NextResponse.json(finalData);

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}