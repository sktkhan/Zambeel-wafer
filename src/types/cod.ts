export type AppTab = "analyze" | "profit" | "listing" | "qr" | "trends";

export interface LocalizedListing {
  title: string;
  metaTitle: string;
  metaDescription: string;
  bulletPoints: string[];
  faq: { q: string; a: string }[];
  fullDescription: string;
}

export interface VideoScript {
  title: string;
  angle: string;
  hook3s: string;
  demoBody: string;
  codCta: string;
  arabicHookAndCta: string;
}

export interface ProductAnalysisResult {
  resolvedProductName: string;
  resolvedArabicName: string;
  winningScore: number;
  verdict: "PASS" | "FAIL";
  verdictReasons: string[];
  uaeMarketDemand: {
    level: "High" | "Medium" | "Low";
    summary: string;
  };
  problemSolvingPower: {
    score: number;
    summary: string;
  };
  impulseBuyFactor: {
    score: number;
    summary: string;
  };
  competitionLevel: "Low" | "Medium" | "High";
  competitionInsight: string;
  suggestedSupplierCostAed: number;
  suggestedSellingPriceAed: number;
  suggestedSlug: string;
  buyerPersona: {
    profile: string;
    emiratesFocus: string;
    painPoint: string;
    purchaseTrigger: string;
  };
  seoKeywords: {
    english: string[];
    arabic: string[];
    trendingTags: string[];
  };
  storeListing: {
    english: LocalizedListing;
    arabic: LocalizedListing;
  };
  socialKit: {
    videoScripts: VideoScript[];
    adCaptions: {
      english: string;
      arabic: string;
    };
    hashtags: string[];
    whatsappCatalogText: {
      english: string;
      arabic: string;
    };
  };
}

export interface SavedProductEntry {
  id: string;
  createdAt: string;
  inputName: string;
  inputSource: string;
  imagePreview?: string;
  analysis: ProductAnalysisResult;
}

export interface ProfitInputs {
  supplierCostAed: number;
  zambeelFeeAed: number;
  rtoPercent: number;
  sellingPriceAed: number;
  cpaAed: number;
}

export interface ProfitMetrics {
  deliveryRate: number;
  netProfitPerDeliveredAed: number;
  breakEvenPriceAed: number;
  maxSafeCpaAed: number;
  safeCpaAt15MarginAed: number;
  netMarginPercent: number;
  roasBreakEven: number;
  status: "PASS" | "MARGINAL" | "FAIL";
  sim100Orders: {
    deliveredCount: number;
    rtoCount: number;
    collectedRevenueAed: number;
    totalSupplierCostAed: number;
    totalZambeelFeeAed: number;
    totalAdSpendAed: number;
    totalNetProfitAed: number;
  };
}

export interface TrendingProductIdea {
  name: string;
  arabicName: string;
  category: string;
  whyItSellsInUae: string;
  estimatedSupplierCostAed: number;
  recommendedSellingPriceAed: number;
  competitionLevel: "Low" | "Medium";
  keywordsEn: string[];
  keywordsAr: string[];
  hookIdea: string;
}

export interface TrendingIdeasResponse {
  seasonHeadline: string;
  ideas: TrendingProductIdea[];
  generatedAt?: string;
  category?: string;
}

export interface ReminderPrefs {
  enabled: boolean;
  timeHHMM: string;
  lastTriggeredDate: string;
}
