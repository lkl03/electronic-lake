import Groq from "groq-sdk";
import type { Phone, PhoneSpecs } from "./types";

const MODEL = "llama-3.3-70b-versatile";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type ExtractedPhone = {
  brand: string;
  model: string;
  variant?: string;
  storage?: string;
  color?: string;
  condition?: "nuevo" | "usado" | "seminuevo";
  usd: number;
  specs?: PhoneSpecs;
  highlights?: string[];
};

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey });
}

const EXTRACT_SYSTEM = `You are a data extraction specialist for a phone importer in Argentina.
You receive a free-text price list (in Spanish or English) from a wholesale importer.
Extract every phone listed into a clean JSON array. NEVER invent items that aren't in the list.
Return ONLY JSON, no prose, with this exact shape:
{"phones": [{
  "brand": "iPhone|Samsung|Xiaomi|Motorola|...",
  "model": "e.g. Redmi Note 15, Galaxy S26 Ultra, 16 Pro Max",
  "variant": "optional suffix like 5G, Plus, Ultra, Pro, Pro Max — only if NOT already in model",
  "storage": "EXACTLY as written in the source, e.g. '8+256GB', '12+512GB', '16+1TB', '128GB'",
  "color": "optional",
  "condition": "nuevo|usado|seminuevo (default nuevo if unclear)",
  "usd": 999
}]}
Rules:
- usd must be a number (the US dollar price from the list). U$, USD, u$s all mean US dollars.
- If the price is in ARS/pesos, skip the item.
- storage: copy the full RAM+ROM string verbatim from the source (e.g. '8+256GB'). If only storage is given (e.g. '256GB'), use that.
- model: include the base model name. Do NOT include storage or RAM in the model field.
- variant: include connectivity/generation suffixes like '5G', and tier suffixes like 'Pro', 'Ultra', 'Air' ONLY if not already in model.
- Brand must be canonical: 'iPhone' for Apple; 'Samsung'; 'Xiaomi' for Xiaomi/Redmi/Poco/Mi; 'Motorola'; etc.
- Each distinct storage/RAM configuration is a SEPARATE entry.
- Do not add phones you only know about from training; only use what's in the message.`;

const SPECS_SYSTEM = `You are a mobile phone specs expert. Given a phone brand, model, variant and storage, return a JSON object with concise, accurate technical specs in Spanish (Argentine) and a list of 3-5 short highlights.
Return ONLY JSON with this shape:
{
  "specs": {
    "display": "6.7'' OLED 120Hz",
    "processor": "Apple A17 Pro",
    "ram": "8 GB",
    "storage": "256 GB",
    "camera": "48MP + 12MP + 12MP",
    "battery": "4422 mAh",
    "os": "iOS 17",
    "connectivity": "5G, Wi-Fi 6E, USB-C",
    "extras": "Titanio, resistente al agua IP68"
  },
  "highlights": ["Chip A17 Pro", "Cámara 48MP con zoom 5x", "Pantalla ProMotion 120Hz"]
}
Be accurate. If you don't know a field, omit it. Keep strings short.`;

export async function extractPhonesFromMessage(
  message: string
): Promise<ExtractedPhone[]> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EXTRACT_SYSTEM },
      { role: "user", content: message },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { phones?: ExtractedPhone[] };
  return (parsed.phones ?? []).filter(
    (p) => p.brand && p.model && typeof p.usd === "number" && p.usd > 0
  );
}

export async function enrichSpecs(
  phone: ExtractedPhone
): Promise<{ specs: PhoneSpecs; highlights: string[] }> {
  const client = getClient();
  const prompt = JSON.stringify({
    brand: phone.brand,
    model: phone.model,
    variant: phone.variant,
    storage: phone.storage,
  });
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SPECS_SYSTEM },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      specs?: PhoneSpecs;
      highlights?: string[];
    };
    return {
      specs: parsed.specs ?? {},
      highlights: parsed.highlights ?? [],
    };
  } catch {
    return { specs: {}, highlights: [] };
  }
}

export function buildPhone(
  extracted: ExtractedPhone,
  dollarRate: number,
  extras: {
    specs: PhoneSpecs;
    highlights: string[];
    images: string[];
    marginUsd?: number;
  }
): Phone {
  const slugParts = [
    extracted.brand,
    extracted.model,
    extracted.variant,
    extracted.storage,
  ]
    .filter(Boolean)
    .join(" ");
  const marginUsd = Math.max(0, extras.marginUsd ?? 0);
  return {
    slug: slugify(slugParts),
    brand: extracted.brand,
    model: extracted.model,
    variant: extracted.variant,
    storage: extracted.storage ?? extras.specs.storage,
    color: extracted.color,
    condition: extracted.condition ?? "nuevo",
    usd: extracted.usd,
    marginUsd,
    priceArs: Math.round((extracted.usd + marginUsd) * dollarRate),
    images: extras.images,
    specs: extras.specs,
    highlights: extras.highlights,
  };
}
