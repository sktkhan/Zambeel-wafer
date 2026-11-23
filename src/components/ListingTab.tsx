import { ExternalLink, FileText, Film, MessageSquare } from "lucide-react";
import { useState } from "react";
import type { LocalizedListing, ProductAnalysisResult } from "../types/cod";
import { STORE_BASE_URL } from "../utils/storage";
import { CopyButton } from "./CopyButton";
import { ResearchLinksBar } from "./ResearchLinksBar";

interface ListingTabProps {
  analysis: ProductAnalysisResult | null;
  onGoAnalyze: () => void;
}

function formatFullListingCopy(
  listing: LocalizedListing,
  lang: "en" | "ar"
): string {
  const bulletsLabel = lang === "en" ? "Key Benefits:" : "أهم المميزات:";
  const faqLabel = lang === "en" ? "FAQ:" : "الأسئلة الشائعة:";
  const bullets = listing.bulletPoints.map((b) => `• ${b}`).join("\n");
  const faqs = listing.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return [
    listing.title,
    "",
    bulletsLabel,
    bullets,
    "",
    listing.fullDescription,
    "",
    faqLabel,
    faqs,
    "",
    `SEO Meta Title: ${listing.metaTitle}`,
    `SEO Meta Description: ${listing.metaDescription}`,
  ].join("\n");
}

export function ListingTab({ analysis, onGoAnalyze }: ListingTabProps) {
  const [langView, setLangView] = useState<"en" | "ar" | "both">("both");

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center space-y-3">
        <FileText className="w-10 h-10 text-teal-700 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-900">
          Store Listing &amp; Social Media Kit
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Analyze a product first to auto-generate bilingual English &amp; Arabic
          SEO copy for{" "}
          <span className="font-medium text-slate-700">{STORE_BASE_URL}</span>{" "}
          along with 3 short video scripts and WhatsApp catalog text.
        </p>
        <button
          type="button"
          onClick={onGoAnalyze}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer"
        >
          Analyze a Product First
        </button>
      </div>
    );
  }

  const en = analysis.storeListing.english;
  const ar = analysis.storeListing.arabic;
  const { socialKit } = analysis;

  const renderListingColumn = (
    data: LocalizedListing,
    lang: "en" | "ar"
  ) => {
    const isAr = lang === "ar";
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 ${
          isAr ? "font-arabic" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            {isAr
              ? "وصف المتجر والـ SEO (العربية)"
              : "Store Listing & SEO (English)"}
          </h3>
          <CopyButton
            variant="primary"
            label={isAr ? "نسخ الكل" : "Copy All"}
            copiedLabel={isAr ? "تم النسخ" : "Copied"}
            text={formatFullListingCopy(data, lang)}
          />
        </div>

        {/* Product Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {isAr ? "عنوان المنتج" : "Product Title"}
            </span>
            <CopyButton
              label={isAr ? "نسخ" : "Copy"}
              text={data.title}
            />
          </div>
          <p className="text-base font-bold text-slate-900">{data.title}</p>
        </div>

        {/* SEO Meta Title & Description */}
        <div className="border-t border-slate-100 pt-3 space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {isAr ? "عنوان السيو (Meta Title)" : "SEO Meta Title"}{" "}
                <span className="font-mono tabular-nums text-slate-400">
                  ({data.metaTitle.length} chars)
                </span>
              </span>
              <CopyButton
                label={isAr ? "نسخ" : "Copy"}
                text={data.metaTitle}
              />
            </div>
            <p className="text-xs text-slate-800">{data.metaTitle}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {isAr ? "وصف السيو (Meta Description)" : "SEO Meta Description"}{" "}
                <span className="font-mono tabular-nums text-slate-400">
                  ({data.metaDescription.length} chars)
                </span>
              </span>
              <CopyButton
                label={isAr ? "نسخ" : "Copy"}
                text={data.metaDescription}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {data.metaDescription}
            </p>
          </div>
        </div>

        {/* Problem-Solving Bullets */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {isAr ? "نقاط حل المشكلة" : "Problem-Solving Bullet Points"}
            </span>
            <CopyButton
              label={isAr ? "نسخ" : "Copy"}
              text={data.bulletPoints.map((b) => `• ${b}`).join("\n")}
            />
          </div>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {data.bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-teal-700 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Full Store Description */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {isAr ? "الوصف الكامل للمتجر" : "Full Store Description"}
            </span>
            <CopyButton
              label={isAr ? "نسخ" : "Copy"}
              text={data.fullDescription}
            />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {data.fullDescription}
          </p>
        </div>

        {/* Product FAQ */}
        <div className="border-t border-slate-100 pt-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {isAr ? "الأسئلة الشائعة" : "Product FAQ"}
            </span>
            <CopyButton
              label={isAr ? "نسخ" : "Copy"}
              text={data.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}
            />
          </div>
          <div className="space-y-3">
            {data.faq.map((item, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <p className="font-semibold text-slate-900">{item.q}</p>
                <p className="text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Store Paste Header & Language Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 truncate">
            {analysis.resolvedProductName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Ready to paste into Wafers Store</span>
            <span aria-hidden="true">·</span>
            <a
              href={STORE_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline"
            >
              <span>wafers.myeasyorders.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          {(
            [
              { id: "both", label: "EN + AR" },
              { id: "en", label: "English" },
              { id: "ar", label: "العربية" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLangView(opt.id)}
              className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                langView === opt.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Store Copy Columns */}
      <div
        className={`grid gap-6 ${
          langView === "both" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {(langView === "en" || langView === "both") &&
          renderListingColumn(en, "en")}
        {(langView === "ar" || langView === "both") &&
          renderListingColumn(ar, "ar")}
      </div>

      {/* 3 Short 20-Second TikTok / Reels / Shorts Scripts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-teal-700 shrink-0" />
            <h3 className="text-base font-semibold text-slate-900">
              3 Short 20s TikTok / Reels / Shorts Scripts
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {socialKit.videoScripts.map((script, idx) => {
            const fullScript = [
              `Script ${idx + 1}: ${script.title} (${script.angle})`,
              `0-3s Hook: ${script.hook3s}`,
              `3-15s Demo: ${script.demoBody}`,
              `15-20s COD CTA: ${script.codCta}`,
              `Arabic Hook & CTA: ${script.arabicHookAndCta}`,
            ].join("\n\n");

            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-4 bg-slate-50/50"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-teal-700 font-semibold">
                        Script 0{idx + 1} · {script.angle}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {script.title}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 block">
                        0–3s Hook
                      </span>
                      <p className="text-slate-600">{script.hook3s}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block">
                        3–15s Visual Demo
                      </span>
                      <p className="text-slate-600">{script.demoBody}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block">
                        15–20s COD Offer CTA
                      </span>
                      <p className="text-slate-600">{script.codCta}</p>
                    </div>
                    <div dir="rtl" className="pt-2 border-t border-slate-200 font-arabic">
                      <span className="font-semibold text-slate-700 block">
                        الخطاف والدعوة للشراء (بالعربي)
                      </span>
                      <p className="text-slate-700">{script.arabicHookAndCta}</p>
                    </div>
                  </div>
                </div>

                <CopyButton
                  label="Copy Script"
                  text={fullScript}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Ad Captions, Hashtags & WhatsApp Catalog Text */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Social Ad Captions &amp; UAE Hashtags
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                English Ad Caption
              </span>
              <CopyButton label="Copy" text={socialKit.adCaptions.english} />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
              {socialKit.adCaptions.english}
            </p>
          </div>

          <div className="space-y-1.5" dir="rtl">
            <div className="flex items-center justify-between">
              <span className="font-arabic text-xs font-semibold text-slate-600">
                كابشن الإعلان (عربي)
              </span>
              <CopyButton
                label="نسخ"
                copiedLabel="تم النسخ"
                text={socialKit.adCaptions.arabic}
              />
            </div>
            <p className="font-arabic text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
              {socialKit.adCaptions.arabic}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                UAE Hashtags
              </span>
              <CopyButton
                label="Copy Hashtags"
                text={socialKit.hashtags.join(" ")}
              />
            </div>
            <p className="text-xs font-mono text-teal-800 leading-relaxed">
              {socialKit.hashtags.join(" ")}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-700 shrink-0" />
            <h3 className="text-sm font-semibold text-slate-900">
              WhatsApp Business Catalog Text
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                English Catalog Copy
              </span>
              <CopyButton
                label="Copy"
                text={socialKit.whatsappCatalogText.english}
              />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
              {socialKit.whatsappCatalogText.english}
            </p>
          </div>

          <div className="space-y-1.5" dir="rtl">
            <div className="flex items-center justify-between">
              <span className="font-arabic text-xs font-semibold text-slate-600">
                نص كتالوج واتساب (عربي)
              </span>
              <CopyButton
                label="نسخ"
                copiedLabel="تم النسخ"
                text={socialKit.whatsappCatalogText.arabic}
              />
            </div>
            <p className="font-arabic text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
              {socialKit.whatsappCatalogText.arabic}
            </p>
          </div>
        </div>
      </div>

      <ResearchLinksBar query={analysis.resolvedProductName} />
    </div>
  );
}
