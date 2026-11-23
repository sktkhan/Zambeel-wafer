import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_URL = "https://wafers.myeasyorders.com/";
const WHATSAPP_NUMBER = "+966550379838";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  if (rawMessage.includes("GEMINI_API_KEY is not configured")) {
    return {
      status: 500,
      message: "Gemini API key is missing. Please add GEMINI_API_KEY in Settings > Secrets.",
    };
  }
  if (rawMessage.includes("403") || rawMessage.includes("PERMISSION_DENIED") || rawMessage.includes("API_KEY_INVALID")) {
    return {
      status: 403,
      message: "Gemini API authentication failed. Please check your GEMINI_API_KEY in Settings > Secrets.",
    };
  }
  if (rawMessage.includes("429") || rawMessage.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      message: "Gemini API rate limit reached. Please wait a moment and try again.",
    };
  }
  return {
    status: 500,
    message: rawMessage || "Failed to process request with Gemini AI.",
  };
}

const productAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    resolvedProductName: {
      type: Type.STRING,
      description: "Clean concise product name in English.",
    },
    resolvedArabicName: {
      type: Type.STRING,
      description: "Clean concise product name in Arabic.",
    },
    winningScore: {
      type: Type.INTEGER,
      description: "Overall UAE COD Winning Score from 0 to 100.",
    },
    verdict: {
      type: Type.STRING,
      description: "Must be exactly PASS or FAIL.",
    },
    verdictReasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 to 4 crisp, practical UAE COD market reasons explaining the PASS or FAIL verdict.",
    },
    uaeMarketDemand: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, description: "High, Medium, or Low" },
        summary: { type: Type.STRING, description: "2-sentence UAE market demand analysis across Dubai, Abu Dhabi, Sharjah." },
      },
      required: ["level", "summary"],
    },
    problemSolvingPower: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Score from 0 to 100" },
        summary: { type: Type.STRING, description: "How strongly it solves a daily pain point for UAE residents/expats/families." },
      },
      required: ["score", "summary"],
    },
    impulseBuyFactor: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Score from 0 to 100" },
        summary: { type: Type.STRING, description: "Scroll-stopping potential on TikTok/Instagram Reels in the UAE." },
      },
      required: ["score", "summary"],
    },
    competitionLevel: {
      type: Type.STRING,
      description: "Low, Medium, or High",
    },
    competitionInsight: {
      type: Type.STRING,
      description: "Practical insight on saturation on Noon, Amazon.ae, and local UAE COD stores.",
    },
    suggestedSupplierCostAed: {
      type: Type.NUMBER,
      description: "Estimated Zambeel/wholesale product cost in AED.",
    },
    suggestedSellingPriceAed: {
      type: Type.NUMBER,
      description: "Optimal UAE COD selling price in AED (ending in 9 like 79, 99, 129, 149).",
    },
    suggestedSlug: {
      type: Type.STRING,
      description: "Clean lowercase hyphenated URL slug for wafers.myeasyorders.com.",
    },
    buyerPersona: {
      type: Type.OBJECT,
      properties: {
        profile: { type: Type.STRING, description: "Age, gender, household/lifestyle profile in UAE." },
        emiratesFocus: { type: Type.STRING, description: "Top performing Emirates and neighborhoods to target." },
        painPoint: { type: Type.STRING, description: "Primary problem or desire driving the purchase." },
        purchaseTrigger: { type: Type.STRING, description: "What converts them to place a COD order immediately." },
      },
      required: ["profile", "emiratesFocus", "painPoint", "purchaseTrigger"],
    },
    seoKeywords: {
      type: Type.OBJECT,
      properties: {
        english: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "6 low-competition high-intent UAE English search keywords.",
        },
        arabic: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "6 low-competition high-intent UAE Arabic search keywords.",
        },
        trendingTags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "6 trending UAE product & ad angle tags.",
        },
      },
      required: ["english", "arabic", "trendingTags"],
    },
    storeListing: {
      type: Type.OBJECT,
      properties: {
        english: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  a: { type: Type.STRING },
                },
                required: ["q", "a"],
              },
            },
            fullDescription: { type: Type.STRING },
          },
          required: ["title", "metaTitle", "metaDescription", "bulletPoints", "faq", "fullDescription"],
        },
        arabic: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  a: { type: Type.STRING },
                },
                required: ["q", "a"],
              },
            },
            fullDescription: { type: Type.STRING },
          },
          required: ["title", "metaTitle", "metaDescription", "bulletPoints", "faq", "fullDescription"],
        },
      },
      required: ["english", "arabic"],
    },
    socialKit: {
      type: Type.OBJECT,
      properties: {
        videoScripts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              angle: { type: Type.STRING },
              hook3s: { type: Type.STRING },
              demoBody: { type: Type.STRING },
              codCta: { type: Type.STRING },
              arabicHookAndCta: { type: Type.STRING },
            },
            required: ["title", "angle", "hook3s", "demoBody", "codCta", "arabicHookAndCta"],
          },
        },
        adCaptions: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            arabic: { type: Type.STRING },
          },
          required: ["english", "arabic"],
        },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        whatsappCatalogText: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            arabic: { type: Type.STRING },
          },
          required: ["english", "arabic"],
        },
      },
      required: ["videoScripts", "adCaptions", "hashtags", "whatsappCatalogText"],
    },
  },
  required: [
    "resolvedProductName",
    "resolvedArabicName",
    "winningScore",
    "verdict",
    "verdictReasons",
    "uaeMarketDemand",
    "problemSolvingPower",
    "impulseBuyFactor",
    "competitionLevel",
    "competitionInsight",
    "suggestedSupplierCostAed",
    "suggestedSellingPriceAed",
    "suggestedSlug",
    "buyerPersona",
    "seoKeywords",
    "storeListing",
    "socialKit",
  ],
};

const trendingIdeasSchema = {
  type: Type.OBJECT,
  properties: {
    seasonHeadline: {
      type: Type.STRING,
      description: "1-sentence summary of what UAE COD buyers are shopping for this month/season.",
    },
    ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          arabicName: { type: Type.STRING },
          category: { type: Type.STRING },
          whyItSellsInUae: { type: Type.STRING },
          estimatedSupplierCostAed: { type: Type.NUMBER },
          recommendedSellingPriceAed: { type: Type.NUMBER },
          competitionLevel: { type: Type.STRING, description: "Low or Medium" },
          keywordsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywordsAr: { type: Type.ARRAY, items: { type: Type.STRING } },
          hookIdea: { type: Type.STRING },
        },
        required: [
          "name",
          "arabicName",
          "category",
          "whyItSellsInUae",
          "estimatedSupplierCostAed",
          "recommendedSellingPriceAed",
          "competitionLevel",
          "keywordsEn",
          "keywordsAr",
          "hookIdea",
        ],
      },
    },
  },
  required: ["seasonHeadline", "ideas"],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "12mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/analyze-product", async (req, res) => {
    try {
      const { productName, supplierUrlOrDesc, imageBase64, imageMimeType } = req.body as {
        productName?: string;
        supplierUrlOrDesc?: string;
        imageBase64?: string;
        imageMimeType?: string;
      };

      if (!productName?.trim() && !supplierUrlOrDesc?.trim() && !imageBase64) {
        res.status(400).json({
          error: "Please provide a product name, supplier link/description, or a product photo.",
        });
        return;
      }

      const ai = getGeminiClient();

      const promptText = `You are an elite UAE Cash-on-Delivery (COD) e-commerce strategist & bilingual English/Arabic copywriter working exclusively for a Zambeel UAE dropshipping store:
- Store URL: ${STORE_URL}
- WhatsApp Business: ${WHATSAPP_NUMBER}

Analyze the following product for the UAE market (Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain):
- Product Name: ${productName?.trim() || "(Infer from description or attached photo)"}
- Zambeel / Supplier Link or Description: ${supplierUrlOrDesc?.trim() || "(Not provided)"}

Deliverables required in the JSON output:
1. Honest, realistic UAE COD Winning Score (0-100) and verdict ("PASS" if >= 68 and healthy COD margin/demand, otherwise "FAIL") with 3-4 sharp UAE-specific reasons (consider UAE heat/climate, apartment living, car commuting, family gifting, Noon/Amazon.ae price competition, and RTO risk).
2. Demand, problem-solving power, impulse-buy factor, competition level (Low/Medium/High), suggested Zambeel supplier cost (AED), and suggested COD selling price (AED, typically 69-199 AED range for impulse COD).
3. Low-competition, high-intent UAE SEO keywords in English and natural UAE Arabic, trending tags, and ideal UAE buyer persona.
4. Full high-converting store listing ready to paste into ${STORE_URL} in BOTH English and natural Gulf/UAE Arabic:
   - Catchy Product Title, SEO Meta Title (<= 60 chars), SEO Meta Description (<= 155 chars), 5 Problem-Solving Bullet Points, 3 Customer FAQs (addressing COD payment, UAE delivery speed 1-3 days, and warranty/quality), and persuasive Full Store Description.
5. Social Media Promotion Kit:
   - 3 distinct 20-second TikTok / Instagram Reels / YouTube Shorts scripts (3-sec visual/verbal Hook + Demo Body + Cash-on-Delivery Offer CTA, plus an Arabic hook & CTA line for each).
   - High-converting ad captions (English + Arabic).
   - 8 UAE-targeted hashtags.
   - Ready-to-paste WhatsApp Catalog listing text (English + Arabic) referencing Cash on Delivery across all UAE Emirates and ordering via ${WHATSAPP_NUMBER} or ${STORE_URL}.`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (imageBase64 && imageMimeType) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        });
      }
      parts.push({ text: promptText });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts },
        config: {
          systemInstruction:
            "You are a pragmatic UAE COD dropshipping specialist for Zambeel sellers. Give realistic, uninflated Winning Scores, authentic natural Gulf/UAE Arabic (never robotic literal translation), and concise scannable copy tailored for mobile shoppers in the UAE.",
          responseMimeType: "application/json",
          responseSchema: productAnalysisSchema,
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "Empty response received from Gemini AI." });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatGeminiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/trending-ideas", async (req, res) => {
    try {
      const { currentMonthLabel, focusCategory } = req.body as {
        currentMonthLabel?: string;
        focusCategory?: string;
      };

      const monthContext =
        currentMonthLabel?.trim() ||
        new Date().toLocaleDateString("en-AE", { month: "long", year: "numeric" });

      const ai = getGeminiClient();

      const promptText = `Generate 5 fresh, low-competition, high-margin UAE Cash-on-Delivery (COD) dropshipping product ideas suitable for Zambeel UAE sellers during ${monthContext}.
${focusCategory && focusCategory !== "All" ? `Focus specifically on the "${focusCategory}" category.` : "Cover a diverse mix of problem-solving categories (Home & Kitchen, Car & Commute, Personal Care/Grooming, Outdoor/Seasonal, Smart Gadgets)."}

Rules:
- Avoid oversaturated commodities (like generic phone cases or basic ring lights).
- Target products that sell easily between 69 AED and 169 AED with Cash on Delivery and have visual "wow" demo potential for 20-second TikTok/Reels ads in the UAE.
- Consider the UAE climate, lifestyle, and seasonal events around ${monthContext}.
- Provide natural English and Arabic product names, SEO keywords (EN + AR), estimated Zambeel supplier cost in AED, recommended selling price in AED, why it sells in the UAE, and a 3-second TikTok video hook idea.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: promptText,
        config: {
          systemInstruction:
            "You are a UAE COD product researcher specializing in Zambeel UAE supplier catalogs and TikTok/Meta COD funnels.",
          responseMimeType: "application/json",
          responseSchema: trendingIdeasSchema,
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        res.status(502).json({ error: "Empty response received from Gemini AI." });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatGeminiError(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Wafers COD Studio server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
