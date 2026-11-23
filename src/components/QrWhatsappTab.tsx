import {
  Download,
  ExternalLink,
  MessageCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import type { ProductAnalysisResult } from "../types/cod";
import {
  STORE_BASE_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_LINK_BASE,
  slugifyProduct,
} from "../utils/storage";
import { CopyButton } from "./CopyButton";

interface QrWhatsappTabProps {
  analysis: ProductAnalysisResult | null;
}

const UAE_EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

export function QrWhatsappTab({ analysis }: QrWhatsappTabProps) {
  const [qrMode, setQrMode] = useState<"whatsapp" | "store">("whatsapp");
  const [productName, setProductName] = useState(
    analysis?.resolvedProductName || "Portable Mini Blender"
  );
  const [arabicName, setArabicName] = useState(
    analysis?.resolvedArabicName || "خلاط محمول صغير"
  );
  const [priceAed, setPriceAed] = useState(
    String(analysis?.suggestedSellingPriceAed || 119)
  );
  const [productSlugOrUrl, setProductSlugOrUrl] = useState(
    analysis?.suggestedSlug || "portable-mini-blender"
  );
  const [defaultEmirate, setDefaultEmirate] = useState("Dubai");
  const [defaultQty, setDefaultQty] = useState("1");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysis) return;
    setProductName(analysis.resolvedProductName);
    setArabicName(analysis.resolvedArabicName);
    setPriceAed(String(analysis.suggestedSellingPriceAed));
    setProductSlugOrUrl(
      analysis.suggestedSlug || slugifyProduct(analysis.resolvedProductName)
    );
  }, [analysis]);

  const cleanStoreUrl = (() => {
    const raw = productSlugOrUrl.trim();
    if (!raw) return `${STORE_BASE_URL}/`;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const trimmedSlug = raw.replace(/^\/+/, "");
    return `${STORE_BASE_URL}/${trimmedSlug}`;
  })();

  const whatsappPreFilledMessage = [
    `Hello Wafers Store, I want to place a Cash on Delivery (UAE) order:`,
    `Product: ${productName.trim() || "Product"}`,
    `Price: ${priceAed || "0"} AED`,
    `Quantity: ${defaultQty || "1"}`,
    `Full Name: `,
    `Emirate: ${defaultEmirate}`,
    `Delivery Address (Area / Street / Villa or Apt): `,
  ].join("\n");

  const whatsappOrderUrl = `${WHATSAPP_LINK_BASE}?text=${encodeURIComponent(
    whatsappPreFilledMessage
  )}`;

  const targetUrl = qrMode === "whatsapp" ? whatsappOrderUrl : cleanStoreUrl;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(targetUrl, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (active) {
          setQrDataUrl(url);
          setQrError(null);
        }
      })
      .catch(() => {
        if (active) setQrError("Could not generate QR code for this URL.");
      });
    return () => {
      active = false;
    };
  }, [targetUrl]);

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    const safeName = slugifyProduct(productName || "wafers-product") || "wafers-qr";
    link.href = qrDataUrl;
    link.download = `${safeName}-${qrMode}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayTitle = productName.trim() || "Your Product";
  const displayArTitle = arabicName.trim() || "المنتج";
  const displayPrice = priceAed.trim() || "99";

  const antiRtoTemplates = [
    {
      id: "confirm",
      title: "1. Instant COD Order Confirmation (Reduce Fake Orders)",
      en: `Hello! Thank you for ordering "${displayTitle}" (${displayPrice} AED - Cash on Delivery) from Wafers Store (${STORE_BASE_URL}). Please reply YES to confirm your ${defaultEmirate} delivery address and active mobile number so we dispatch your order today.`,
      ar: `مرحباً! شكراً لطلبك "${displayArTitle}" بقيمة ${displayPrice} درهم (الدفع عند الاستلام) من متجر ويفرز (${STORE_BASE_URL}). يرجى الرد بكلمة (نعم) لتأكيد عنوان التوصيل في ${defaultEmirate} ورقم الهاتف النشط ليتم شحن طلبك اليوم.`,
    },
    {
      id: "dispatch",
      title: "2. Out for Delivery / Courier Reminder (Cut RTO Returns)",
      en: `Good news! Your Wafers Store order "${displayTitle}" is out for delivery today in the UAE. Please keep ${displayPrice} AED cash ready and answer calls from the courier. Need to reschedule? Reply here on ${WHATSAPP_DISPLAY}.`,
      ar: `أخبار سارة! طلبك "${displayArTitle}" من متجر ويفرز في طريقه للتوصيل اليوم داخل الإمارات. يرجى تجهيز مبلغ ${displayPrice} درهم نقداً والرد على اتصال المندوب. لتعديل الموعد تواصل معنا هنا على ${WHATSAPP_DISPLAY}.`,
    },
    {
      id: "unanswered",
      title: "3. Missed Courier Call Follow-Up (Save Returning Packages)",
      en: `Hi! Our UAE courier tried reaching you to deliver "${displayTitle}" (${displayPrice} AED COD). Please share your preferred delivery time today or tomorrow so your order isn't returned to warehouse.`,
      ar: `مرحباً! حاول مندوب التوصيل التواصل معك لتسليم طلب "${displayArTitle}" (${displayPrice} درهم عند الاستلام). يرجى إرسال الوقت المناسب لك اليوم أو غداً قبل إرجاع الشحنة للمستودع.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Generator Controls */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              QR Code &amp; Direct WhatsApp COD Order
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Linked to{" "}
              <span className="font-medium text-slate-700">
                wafers.myeasyorders.com
              </span>{" "}
              and WhatsApp{" "}
              <span className="font-mono text-slate-700">{WHATSAPP_DISPLAY}</span>
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setQrMode("whatsapp")}
              className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                qrMode === "whatsapp"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Direct WhatsApp COD
            </button>
            <button
              type="button"
              onClick={() => setQrMode("store")}
              className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                qrMode === "store"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Wafers Store Page
            </button>
          </div>

          {qrMode === "whatsapp" ? (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label
                    htmlFor="qr-prod-name"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Product Name (English)
                  </label>
                  <input
                    id="qr-prod-name"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="qr-price"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Price (AED)
                  </label>
                  <input
                    id="qr-price"
                    type="number"
                    min={0}
                    value={priceAed}
                    onChange={(e) => setPriceAed(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="qr-emirate"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Default Emirate
                  </label>
                  <select
                    id="qr-emirate"
                    value={defaultEmirate}
                    onChange={(e) => setDefaultEmirate(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  >
                    {UAE_EMIRATES.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="qr-qty"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Default Quantity
                  </label>
                  <input
                    id="qr-qty"
                    type="number"
                    min={1}
                    max={20}
                    value={defaultQty}
                    onChange={(e) => setDefaultQty(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold text-slate-700">
                  Pre-Filled WhatsApp COD Message Preview
                </span>
                <pre className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">
                  {whatsappPreFilledMessage}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label
                  htmlFor="store-slug"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Wafers Store Product Slug or Full URL
                </label>
                <input
                  id="store-slug"
                  type="text"
                  value={productSlugOrUrl}
                  onChange={(e) => setProductSlugOrUrl(e.target.value)}
                  placeholder="products/mini-blender or full URL"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-slate-600 block">
                  Resolved Store URL
                </span>
                <p className="text-xs font-mono text-teal-800 break-all">
                  {cleanStoreUrl}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: QR Preview & Download */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-full flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <QrCode className="w-4 h-4 text-teal-700" />
              <span>1024×1024 Print-Ready PNG</span>
            </span>
            <span className="font-mono">
              {qrMode === "whatsapp" ? "WhatsApp COD" : "Store Link"}
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl">
            {qrError ? (
              <p className="text-xs text-rose-600 py-16 px-8">{qrError}</p>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${displayTitle}`}
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            ) : (
              <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-xl" />
            )}
          </div>

          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-900">{displayTitle}</p>
            <p className="text-xs text-slate-500 font-mono">
              {qrMode === "whatsapp"
                ? `${displayPrice} AED · Cash on Delivery (${WHATSAPP_DISPLAY})`
                : cleanStoreUrl}
            </p>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadQrPng}
              disabled={!qrDataUrl}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Download PNG</span>
            </button>

            <CopyButton
              label="Copy Link"
              text={targetUrl}
              className="w-full"
            />

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {qrMode === "whatsapp" ? (
                <MessageCircle className="w-4 h-4 text-teal-700 shrink-0" />
              ) : (
                <ExternalLink className="w-4 h-4 text-teal-700 shrink-0" />
              )}
              <span>Test Link</span>
            </a>
          </div>
        </div>
      </div>

      {/* Anti-RTO Bilingual WhatsApp Templates */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Anti-RTO WhatsApp Confirmation &amp; Follow-Up Templates
              </h3>
              <p className="text-xs text-slate-500">
                Send before shipping and on delivery morning to cut UAE RTO
                returns.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="ar-name-inline" className="text-xs text-slate-500">
              Arabic Name:
            </label>
            <input
              id="ar-name-inline"
              type="text"
              dir="rtl"
              value={arabicName}
              onChange={(e) => setArabicName(e.target.value)}
              className="font-arabic min-h-[38px] px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 w-44"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {antiRtoTemplates.map((tpl) => (
            <div key={tpl.id} className="py-4 first:pt-2 last:pb-1 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">{tpl.title}</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      English
                    </span>
                    <CopyButton label="Copy EN" text={tpl.en} />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {tpl.en}
                  </p>
                </div>

                <div dir="rtl" className="bg-slate-50 rounded-xl p-3 space-y-2 font-arabic">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      العربية
                    </span>
                    <CopyButton
                      label="نسخ العربي"
                      copiedLabel="تم النسخ"
                      text={tpl.ar}
                    />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {tpl.ar}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
