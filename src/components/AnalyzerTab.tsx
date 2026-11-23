import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Loader2,
  PackageSearch,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { ProductAnalysisResult, SavedProductEntry } from "../types/cod";
import { CopyButton } from "./CopyButton";
import { ResearchLinksBar } from "./ResearchLinksBar";

interface AnalyzerTabProps {
  activeEntry: SavedProductEntry | null;
  savedProducts: SavedProductEntry[];
  isAnalyzing: boolean;
  error: string | null;
  onAnalyze: (payload: {
    productName: string;
    supplierUrlOrDesc: string;
    imageBase64?: string;
    imageMimeType?: string;
    imagePreview?: string;
  }) => Promise<void>;
  onSelectSaved: (id: string) => void;
  onDeleteSaved: (id: string) => void;
  onJumpToTab: (tab: "profit" | "listing" | "qr") => void;
}

async function compressImageFile(
  file: File
): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format."));
      img.onload = () => {
        const maxSide = 1024;
        let width = img.width;
        let height = img.height;
        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const base64Only = dataUrl.split(",")[1] || "";
          resolve({
            base64: base64Only,
            mimeType: file.type || "image/jpeg",
            previewUrl: dataUrl,
          });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = compressedDataUrl.split(",")[1] || "";
        resolve({
          base64,
          mimeType: "image/jpeg",
          previewUrl: compressedDataUrl,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function ScoreMeter({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const barColor =
    clamped >= 70
      ? "bg-emerald-600"
      : clamped >= 50
      ? "bg-amber-500"
      : "bg-rose-600";

  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function AnalyzerTab({
  activeEntry,
  savedProducts,
  isAnalyzing,
  error,
  onAnalyze,
  onSelectSaved,
  onDeleteSaved,
  onJumpToTab,
}: AnalyzerTabProps) {
  const [productName, setProductName] = useState("");
  const [supplierUrlOrDesc, setSupplierUrlOrDesc] = useState("");
  const [imageData, setImageData] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose a valid JPG, PNG, or WebP product photo.");
      return;
    }
    try {
      const compressed = await compressImageFile(file);
      setImageData(compressed);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Failed to process image."
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;
    await onAnalyze({
      productName,
      supplierUrlOrDesc,
      imageBase64: imageData?.base64,
      imageMimeType: imageData?.mimeType,
      imagePreview: imageData?.previewUrl,
    });
  };

  const analysis: ProductAnalysisResult | null = activeEntry?.analysis || null;
  const currentResearchQuery =
    analysis?.resolvedProductName || productName || "portable mini blender uae";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Input Form + Saved History */}
      <div className="lg:col-span-5 space-y-5">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              AI UAE Product Analyzer
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Enter a Zambeel product name, link, or photo to score UAE COD
              potential and generate full EN/AR marketing assets.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="product-name"
              className="block text-xs font-semibold text-slate-700"
            >
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Electric Oud Bakhoor Burner USB"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="supplier-desc"
              className="block text-xs font-semibold text-slate-700"
            >
              Zambeel / Supplier Link or Product Description
            </label>
            <textarea
              id="supplier-desc"
              rows={3}
              value={supplierUrlOrDesc}
              onChange={(e) => setSupplierUrlOrDesc(e.target.value)}
              placeholder="Paste Zambeel product link, supplier specs, cost in AED, or key features..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 resize-y"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">
              Product Photo (Optional)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageData ? (
              <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={imageData.previewUrl}
                    alt="Uploaded product preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">
                      Product photo attached
                    </p>
                    <p className="text-xs text-slate-500">
                      Ready for visual AI scoring
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageData(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  aria-label="Remove uploaded photo"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Upload or Snap Product Photo</span>
                <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            )}

            {imageError && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{imageError}</span>
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isAnalyzing ||
              (!productName.trim() && !supplierUrlOrDesc.trim() && !imageData)
            }
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:text-slate-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Analyzing UAE COD Market...</span>
              </>
            ) : (
              <>
                <PackageSearch className="w-4 h-4 shrink-0" />
                <span>Analyze Product &amp; Build Full Kit</span>
              </>
            )}
          </button>
        </form>

        {/* Saved Product History (localStorage) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Saved Products History
            </h3>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {savedProducts.length} saved
            </span>
          </div>

          {savedProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              Analyzed products are automatically saved on your device so you
              can switch between winners anytime.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {savedProducts.map((entry) => {
                const isSelected = activeEntry?.id === entry.id;
                const isPass = entry.analysis.verdict === "PASS";
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between gap-2 py-2.5 first:pt-1 last:pb-1 ${
                      isSelected ? "bg-teal-50/50 -mx-2 px-2 rounded-xl" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSaved(entry.id)}
                      className="flex-1 min-w-0 text-left py-1 cursor-pointer"
                    >
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {entry.analysis.resolvedProductName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span
                          className={`font-semibold ${
                            isPass ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {entry.analysis.verdict}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {entry.analysis.winningScore}/100
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {entry.analysis.suggestedSellingPriceAed} AED
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSaved(entry.id)}
                      aria-label={`Delete ${entry.analysis.resolvedProductName}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Analysis Results */}
      <div className="lg:col-span-7 space-y-5">
        {isAnalyzing && !analysis ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-28 bg-slate-100 rounded-xl" />
          </div>
        ) : !analysis ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-3">
            <PackageSearch className="w-10 h-10 text-teal-700 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900">
              No Product Analyzed Yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Enter any Zambeel product above or pick one from Today&apos;s UAE
              Trending Ideas to get a Winning Score, UAE buyer persona,
              English/Arabic store copy, and Reels scripts.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setProductName("Portable Magnetic Car Phone Vacuum Cleaner");
                  setSupplierUrlOrDesc(
                    "Compact cordless USB-C car & keyboard vacuum with strong suction, Zambeel UAE supplier ~32 AED."
                  );
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Load Sample UAE Product
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Winning Score & PASS/FAIL Verdict */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>UAE COD Analysis</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Est. Cost {analysis.suggestedSupplierCostAed} AED
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Target {analysis.suggestedSellingPriceAed} AED
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {analysis.resolvedProductName}
                  </h2>
                  <p
                    dir="rtl"
                    className="font-arabic text-base font-medium text-slate-600"
                  >
                    {analysis.resolvedArabicName}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Winning Score</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {analysis.winningScore}
                      <span className="text-sm font-normal text-slate-400">
                        /100
                      </span>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-bold ${
                      analysis.verdict === "PASS"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    {analysis.verdict === "PASS" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    )}
                    <span>{analysis.verdict}</span>
                  </div>
                </div>
              </div>

              <ScoreMeter score={analysis.winningScore} />

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Verdict Breakdown
                </h3>
                <ul className="space-y-1.5">
                  {analysis.verdictReasons.map((reason, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-700 flex items-start gap-2"
                    >
                      <span className="text-teal-700 font-mono text-xs mt-1 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4-Factor UAE Market Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      UAE Market Demand
                    </span>
                    <span className="font-semibold text-teal-800">
                      {analysis.uaeMarketDemand.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysis.uaeMarketDemand.summary}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      UAE Competition
                    </span>
                    <span className="font-semibold text-slate-900">
                      {analysis.competitionLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysis.competitionInsight}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Problem-Solving Power
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {analysis.problemSolvingPower.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysis.problemSolvingPower.summary}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Impulse-Buy Factor
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {analysis.impulseBuyFactor.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {analysis.impulseBuyFactor.summary}
                  </p>
                </div>
              </div>

              {/* Quick workflow actions */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onJumpToTab("profit")}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Check COD Profit &amp; RTO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToTab("listing")}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Open Store Copy &amp; Scripts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToTab("qr")}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Generate QR &amp; WA Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* UAE Buyer Persona & Bilingual SEO Keywords */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Ideal UAE Buyer Persona
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Buyer Profile
                    </span>
                    <span className="text-slate-600">
                      {analysis.buyerPersona.profile}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Top Emirates Focus
                    </span>
                    <span className="text-slate-600">
                      {analysis.buyerPersona.emiratesFocus}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Core Pain Point
                    </span>
                    <span className="text-slate-600">
                      {analysis.buyerPersona.painPoint}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      COD Purchase Trigger
                    </span>
                    <span className="text-slate-600">
                      {analysis.buyerPersona.purchaseTrigger}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Low-Competition UAE SEO Keywords (EN + AR)
                  </h3>
                  <CopyButton
                    label="Copy All Keywords"
                    text={[
                      ...analysis.seoKeywords.english,
                      ...analysis.seoKeywords.arabic,
                    ].join(", ")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700 block">
                      English High-Intent Keywords
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {analysis.seoKeywords.english.join(" · ")}
                    </p>
                  </div>
                  <div className="space-y-1.5" dir="rtl">
                    <span className="font-arabic text-xs font-semibold text-slate-700 block">
                      كلمات بحث عالية التحويل في الإمارات
                    </span>
                    <p className="font-arabic text-xs text-slate-600 leading-relaxed">
                      {analysis.seoKeywords.arabic.join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Trending Ad &amp; Search Tags
                  </span>
                  <p className="text-xs text-slate-600">
                    {analysis.seoKeywords.trendingTags.join(" · ")}
                  </p>
                </div>
              </div>
            </div>

            <ResearchLinksBar query={currentResearchQuery} />
          </>
        )}
      </div>
    </div>
  );
}
