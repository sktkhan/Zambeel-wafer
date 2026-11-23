import type {
  ProfitInputs,
  ProfitMetrics,
  ReminderPrefs,
  SavedProductEntry,
  TrendingIdeasResponse,
} from "../types/cod";

export const STORE_BASE_URL = "https://wafers.myeasyorders.com";
export const WHATSAPP_DISPLAY = "+966 55 037 9838";
export const WHATSAPP_DIGITS = "966550379838";
export const WHATSAPP_LINK_BASE = `https://wa.me/${WHATSAPP_DIGITS}`;

const KEYS = {
  SAVED_PRODUCTS: "wafers_saved_products_v1",
  ACTIVE_PRODUCT_ID: "wafers_active_product_id_v1",
  PROFIT_INPUTS: "wafers_profit_calc_v1",
  DAILY_IDEAS: "wafers_daily_ideas_v1",
  REMINDER_PREFS: "wafers_reminder_prefs_v1",
} as const;

export const DEFAULT_PROFIT_INPUTS: ProfitInputs = {
  supplierCostAed: 28,
  zambeelFeeAed: 22,
  rtoPercent: 25,
  sellingPriceAed: 119,
  cpaAed: 24,
};

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  enabled: false,
  timeHHMM: "09:30",
  lastTriggeredDate: "",
};

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadSavedProducts(): SavedProductEntry[] {
  return safeReadJson<SavedProductEntry[]>(KEYS.SAVED_PRODUCTS, []);
}

export function saveProductsList(list: SavedProductEntry[]): void {
  safeWriteJson(KEYS.SAVED_PRODUCTS, list.slice(0, 25));
}

export function loadActiveProductId(): string | null {
  try {
    return window.localStorage.getItem(KEYS.ACTIVE_PRODUCT_ID);
  } catch {
    return null;
  }
}

export function saveActiveProductId(id: string | null): void {
  try {
    if (id) {
      window.localStorage.setItem(KEYS.ACTIVE_PRODUCT_ID, id);
    } else {
      window.localStorage.removeItem(KEYS.ACTIVE_PRODUCT_ID);
    }
  } catch {
    // Ignore
  }
}

export function loadProfitInputs(): ProfitInputs {
  return safeReadJson<ProfitInputs>(KEYS.PROFIT_INPUTS, DEFAULT_PROFIT_INPUTS);
}

export function saveProfitInputs(inputs: ProfitInputs): void {
  safeWriteJson(KEYS.PROFIT_INPUTS, inputs);
}

export function loadDailyIdeas(): TrendingIdeasResponse | null {
  return safeReadJson<TrendingIdeasResponse | null>(KEYS.DAILY_IDEAS, null);
}

export function saveDailyIdeas(data: TrendingIdeasResponse): void {
  safeWriteJson(KEYS.DAILY_IDEAS, data);
}

export function loadReminderPrefs(): ReminderPrefs {
  return safeReadJson<ReminderPrefs>(KEYS.REMINDER_PREFS, DEFAULT_REMINDER_PREFS);
}

export function saveReminderPrefs(prefs: ReminderPrefs): void {
  safeWriteJson(KEYS.REMINDER_PREFS, prefs);
}

export function calculateCodProfit(inputs: ProfitInputs): ProfitMetrics {
  const supplier = Math.max(0, Number(inputs.supplierCostAed) || 0);
  const fee = Math.max(0, Number(inputs.zambeelFeeAed) || 0);
  const rtoClamped = Math.min(95, Math.max(0, Number(inputs.rtoPercent) || 0));
  const selling = Math.max(0, Number(inputs.sellingPriceAed) || 0);
  const cpa = Math.max(0, Number(inputs.cpaAed) || 0);

  const deliveryRate = (100 - rtoClamped) / 100;
  const effectiveShippingPerDelivered = fee / deliveryRate;
  const effectiveAdCostPerDelivered = cpa / deliveryRate;

  const netProfitPerDeliveredAed =
    selling - supplier - effectiveShippingPerDelivered - effectiveAdCostPerDelivered;

  const breakEvenPriceAed =
    supplier + effectiveShippingPerDelivered + effectiveAdCostPerDelivered;

  const maxSafeCpaAed = Math.max(0, (selling - supplier) * deliveryRate - fee);
  const safeCpaAt15MarginAed = Math.max(
    0,
    (selling * 0.85 - supplier) * deliveryRate - fee
  );

  const netMarginPercent =
    selling > 0 ? (netProfitPerDeliveredAed / selling) * 100 : 0;

  const roasBreakEven =
    effectiveAdCostPerDelivered > 0 && selling > 0
      ? selling / Math.max(0.01, selling - supplier - effectiveShippingPerDelivered)
      : 0;

  let status: "PASS" | "MARGINAL" | "FAIL" = "FAIL";
  if (netProfitPerDeliveredAed >= 15 && netMarginPercent >= 15) {
    status = "PASS";
  } else if (netProfitPerDeliveredAed > 0) {
    status = "MARGINAL";
  }

  const deliveredCount = Math.round(100 * deliveryRate);
  const rtoCount = 100 - deliveredCount;
  const collectedRevenueAed = deliveredCount * selling;
  const totalSupplierCostAed = deliveredCount * supplier;
  const totalZambeelFeeAed = 100 * fee;
  const totalAdSpendAed = 100 * cpa;
  const totalNetProfitAed =
    collectedRevenueAed -
    totalSupplierCostAed -
    totalZambeelFeeAed -
    totalAdSpendAed;

  return {
    deliveryRate,
    netProfitPerDeliveredAed,
    breakEvenPriceAed,
    maxSafeCpaAed,
    safeCpaAt15MarginAed,
    netMarginPercent,
    roasBreakEven,
    status,
    sim100Orders: {
      deliveredCount,
      rtoCount,
      collectedRevenueAed,
      totalSupplierCostAed,
      totalZambeelFeeAed,
      totalAdSpendAed,
      totalNetProfitAed,
    },
  };
}

export function buildResearchLinks(productQuery: string) {
  const encoded = encodeURIComponent(productQuery.trim() || "uae gadgets");
  return {
    tiktokCreativeCenter: `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?region=AE`,
    metaAdLibrary: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=AE&q=${encoded}&search_type=keyword_unordered`,
    googleTrends: `https://trends.google.com/trends/explore?geo=AE&q=${encoded}`,
  };
}

export function slugifyProduct(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
