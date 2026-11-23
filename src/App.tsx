import {
  Bell,
  Calculator,
  ExternalLink,
  FileText,
  PackageSearch,
  QrCode,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnalyzerTab } from "./components/AnalyzerTab";
import { ListingTab } from "./components/ListingTab";
import { ProfitTab } from "./components/ProfitTab";
import { QrWhatsappTab } from "./components/QrWhatsappTab";
import { TrendsTab } from "./components/TrendsTab";
import type {
  AppTab,
  ProductAnalysisResult,
  ProfitInputs,
  ReminderPrefs,
  SavedProductEntry,
  TrendingIdeasResponse,
  TrendingProductIdea,
} from "./types/cod";
import {
  STORE_BASE_URL,
  loadActiveProductId,
  loadDailyIdeas,
  loadProfitInputs,
  loadReminderPrefs,
  loadSavedProducts,
  saveActiveProductId,
  saveDailyIdeas,
  saveProductsList,
  saveProfitInputs,
  saveReminderPrefs,
} from "./utils/storage";

const NAV_ITEMS: {
  id: AppTab;
  desktopLabel: string;
  mobileLabel: string;
  icon: typeof PackageSearch;
}[] = [
  {
    id: "analyze",
    desktopLabel: "Analyze",
    mobileLabel: "Analyze",
    icon: PackageSearch,
  },
  {
    id: "profit",
    desktopLabel: "Profit & RTO",
    mobileLabel: "Profit",
    icon: Calculator,
  },
  {
    id: "listing",
    desktopLabel: "Store & Ads",
    mobileLabel: "Listing",
    icon: FileText,
  },
  {
    id: "qr",
    desktopLabel: "QR & WhatsApp",
    mobileLabel: "QR & WA",
    icon: QrCode,
  },
  {
    id: "trends",
    desktopLabel: "UAE Trends",
    mobileLabel: "Trends",
    icon: TrendingUp,
  },
];

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("analyze");
  const [savedProducts, setSavedProducts] = useState<SavedProductEntry[]>(() =>
    loadSavedProducts()
  );
  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    const storedId = loadActiveProductId();
    const list = loadSavedProducts();
    if (storedId && list.some((item) => item.id === storedId)) return storedId;
    return list[0]?.id ?? null;
  });

  const [profitInputs, setProfitInputs] = useState<ProfitInputs>(() =>
    loadProfitInputs()
  );
  const [ideasData, setIdeasData] = useState<TrendingIdeasResponse | null>(() =>
    loadDailyIdeas()
  );
  const [reminderPrefs, setReminderPrefs] = useState<ReminderPrefs>(() =>
    loadReminderPrefs()
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);

  const [dailyDigestVisible, setDailyDigestVisible] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return window.Notification.permission;
  });

  const activeEntry =
    savedProducts.find((item) => item.id === activeProductId) ??
    savedProducts[0] ??
    null;

  const handleUpdateProfitInputs = (next: ProfitInputs) => {
    setProfitInputs(next);
    saveProfitInputs(next);
  };

  const handleUpdateReminderPrefs = (next: ReminderPrefs) => {
    setReminderPrefs(next);
    saveReminderPrefs(next);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    try {
      const result = await window.Notification.requestPermission();
      setNotificationPermission(result);
    } catch {
      setNotificationPermission("denied");
    }
  };

  const fireDailyReminder = (isManualTest = false) => {
    setDailyDigestVisible(true);

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      window.Notification.permission === "granted"
    ) {
      try {
        new window.Notification("Wafers UAE COD Daily Product Hunt", {
          body: ideasData?.ideas?.[0]
            ? `Today's top pick: ${ideasData.ideas[0].name} (${ideasData.ideas[0].recommendedSellingPriceAed} AED). Tap Trends to explore 5 ideas.`
            : "Check today's 5 fresh low-competition UAE COD product ideas.",
        });
      } catch {
        // Fallback to in-app digest banner already shown
      }
    }

    if (!isManualTest) {
      const today = getTodayDateString();
      const updated: ReminderPrefs = {
        ...reminderPrefs,
        lastTriggeredDate: today,
      };
      handleUpdateReminderPrefs(updated);
    }
  };

  useEffect(() => {
    if (!reminderPrefs.enabled) return;

    const checkReminderSchedule = () => {
      const today = getTodayDateString();
      if (reminderPrefs.lastTriggeredDate === today) return;
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      if (currentHHMM >= reminderPrefs.timeHHMM) {
        fireDailyReminder(false);
      }
    };

    checkReminderSchedule();
    const timer = window.setInterval(checkReminderSchedule, 60_000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderPrefs.enabled, reminderPrefs.timeHHMM, reminderPrefs.lastTriggeredDate]);

  const handleAnalyzeProduct = async (payload: {
    productName: string;
    supplierUrlOrDesc: string;
    imageBase64?: string;
    imageMimeType?: string;
    imagePreview?: string;
  }) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const response = await fetch("/api/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: payload.productName,
          supplierUrlOrDesc: payload.supplierUrlOrDesc,
          imageBase64: payload.imageBase64,
          imageMimeType: payload.imageMimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to analyze product.");
      }

      const analysis = data as ProductAnalysisResult;
      const newEntry: SavedProductEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        inputName: payload.productName || analysis.resolvedProductName,
        inputSource: payload.supplierUrlOrDesc,
        imagePreview: payload.imagePreview,
        analysis,
      };

      const updatedList = [newEntry, ...savedProducts].slice(0, 25);
      setSavedProducts(updatedList);
      saveProductsList(updatedList);
      setActiveProductId(newEntry.id);
      saveActiveProductId(newEntry.id);

      // Sync suggested pricing into Profit Calculator
      if (
        analysis.suggestedSupplierCostAed > 0 ||
        analysis.suggestedSellingPriceAed > 0
      ) {
        handleUpdateProfitInputs({
          ...profitInputs,
          supplierCostAed:
            analysis.suggestedSupplierCostAed || profitInputs.supplierCostAed,
          sellingPriceAed:
            analysis.suggestedSellingPriceAed || profitInputs.sellingPriceAed,
        });
      }
    } catch (err) {
      setAnalyzeError(
        err instanceof Error ? err.message : "Failed to analyze product."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSaved = (id: string) => {
    setActiveProductId(id);
    saveActiveProductId(id);
    const found = savedProducts.find((item) => item.id === id);
    if (found) {
      handleUpdateProfitInputs({
        ...profitInputs,
        supplierCostAed:
          found.analysis.suggestedSupplierCostAed ||
          profitInputs.supplierCostAed,
        sellingPriceAed:
          found.analysis.suggestedSellingPriceAed ||
          profitInputs.sellingPriceAed,
      });
    }
  };

  const handleDeleteSaved = (id: string) => {
    const filtered = savedProducts.filter((item) => item.id !== id);
    setSavedProducts(filtered);
    saveProductsList(filtered);
    if (activeProductId === id) {
      const nextId = filtered[0]?.id ?? null;
      setActiveProductId(nextId);
      saveActiveProductId(nextId);
    }
  };

  const handleFetchIdeas = async (category: string) => {
    setIsLoadingIdeas(true);
    setIdeasError(null);
    try {
      const currentMonthLabel = new Date().toLocaleDateString("en-AE", {
        month: "long",
        year: "numeric",
      });
      const response = await fetch("/api/trending-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentMonthLabel,
          focusCategory: category,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate UAE trending ideas.");
      }
      const nextIdeas: TrendingIdeasResponse = {
        ...(data as TrendingIdeasResponse),
        generatedAt: new Date().toISOString(),
        category,
      };
      setIdeasData(nextIdeas);
      saveDailyIdeas(nextIdeas);
    } catch (err) {
      setIdeasError(
        err instanceof Error ? err.message : "Could not load trending ideas."
      );
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleAnalyzeIdea = async (idea: TrendingProductIdea) => {
    await handleAnalyzeProduct({
      productName: idea.name,
      supplierUrlOrDesc: `${idea.whyItSellsInUae} Category: ${idea.category}. Est. supplier cost: ${idea.estimatedSupplierCostAed} AED, target selling price: ${idea.recommendedSellingPriceAed} AED. Video hook: ${idea.hookIdea}`,
    });
    setActiveTab("analyze");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Sticky Top Navigation Bar (Strict 3-Zone Contract, 48px mobile / 60px desktop) */}
      <header className="sticky top-0 z-30 h-12 lg:h-15 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab("analyze")}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Wafers COD Studio
          </button>

          {/* Zone 2: 5 concise single-line nav links (desktop) */}
          <nav
            aria-label="Primary Workspace Navigation"
            className="hidden lg:flex items-center gap-6"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "border-teal-700 text-teal-800 font-semibold"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.desktopLabel}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <a
              href={STORE_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open Wafers Store</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 lg:pb-10 space-y-5">
        {/* In-App Daily Reminder Digest Banner (shown when scheduled time hits or user tests reminder) */}
        {dailyDigestVisible && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-teal-950">
                  Daily UAE COD Product Hunt Digest
                </p>
                <p className="text-xs text-teal-900">
                  {ideasData?.ideas?.[0]
                    ? `Top saved trend: ${ideasData.ideas[0].name} (${ideasData.ideas[0].recommendedSellingPriceAed} AED). Refresh UAE Trends for 5 fresh picks today.`
                    : "Ready to spot today's low-competition UAE COD winners? Open UAE Trends to generate 5 seasonal ideas."}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("trends");
                      setDailyDigestVisible(false);
                    }}
                    className="text-xs font-semibold text-teal-800 underline cursor-pointer"
                  >
                    Open UAE Trends
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDailyDigestVisible(false)}
              aria-label="Dismiss daily digest"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-teal-800 hover:bg-teal-100 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Tab View */}
        {activeTab === "analyze" && (
          <AnalyzerTab
            activeEntry={activeEntry}
            savedProducts={savedProducts}
            isAnalyzing={isAnalyzing}
            error={analyzeError}
            onAnalyze={handleAnalyzeProduct}
            onSelectSaved={handleSelectSaved}
            onDeleteSaved={handleDeleteSaved}
            onJumpToTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === "profit" && (
          <ProfitTab
            inputs={profitInputs}
            activeProductName={activeEntry?.analysis.resolvedProductName}
            onChange={handleUpdateProfitInputs}
          />
        )}

        {activeTab === "listing" && (
          <ListingTab
            analysis={activeEntry?.analysis ?? null}
            onGoAnalyze={() => setActiveTab("analyze")}
          />
        )}

        {activeTab === "qr" && (
          <QrWhatsappTab analysis={activeEntry?.analysis ?? null} />
        )}

        {activeTab === "trends" && (
          <TrendsTab
            ideasData={ideasData}
            isLoading={isLoadingIdeas}
            error={ideasError}
            reminderPrefs={reminderPrefs}
            notificationPermission={notificationPermission}
            onFetchIdeas={handleFetchIdeas}
            onAnalyzeIdea={handleAnalyzeIdea}
            onUpdateReminderPrefs={handleUpdateReminderPrefs}
            onRequestNotificationPermission={requestNotificationPermission}
            onTriggerTestReminder={() => fireDailyReminder(true)}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Thumb-Zone Tab Bar (56px height, <=15% combined sticky height) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 transition-colors cursor-pointer ${
                  isActive ? "text-teal-700" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.4 : 1.8} />
                <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap truncate max-w-full">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
