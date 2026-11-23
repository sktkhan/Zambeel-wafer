import {
  AlertCircle,
  ArrowRight,
  Bell,
  BellOff,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type {
  ReminderPrefs,
  TrendingIdeasResponse,
  TrendingProductIdea,
} from "../types/cod";

interface TrendsTabProps {
  ideasData: TrendingIdeasResponse | null;
  isLoading: boolean;
  error: string | null;
  reminderPrefs: ReminderPrefs;
  notificationPermission: NotificationPermission | "unsupported";
  onFetchIdeas: (category: string) => Promise<void>;
  onAnalyzeIdea: (idea: TrendingProductIdea) => Promise<void>;
  onUpdateReminderPrefs: (next: ReminderPrefs) => void;
  onRequestNotificationPermission: () => Promise<void>;
  onTriggerTestReminder: () => void;
}

const CATEGORIES = [
  "All",
  "Home & Kitchen",
  "Car & Commute",
  "Personal Care",
  "Outdoor & Travel",
  "Smart Gadgets",
];

export function TrendsTab({
  ideasData,
  isLoading,
  error,
  reminderPrefs,
  notificationPermission,
  onFetchIdeas,
  onAnalyzeIdea,
  onUpdateReminderPrefs,
  onRequestNotificationPermission,
  onTriggerTestReminder,
}: TrendsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    ideasData?.category || "All"
  );
  const [analyzingName, setAnalyzingName] = useState<string | null>(null);

  const currentMonthLabel = new Date().toLocaleDateString("en-AE", {
    month: "long",
    year: "numeric",
  });

  const handleToggleReminder = async () => {
    if (!reminderPrefs.enabled) {
      if (notificationPermission === "default") {
        await onRequestNotificationPermission();
      }
      onUpdateReminderPrefs({ ...reminderPrefs, enabled: true });
    } else {
      onUpdateReminderPrefs({ ...reminderPrefs, enabled: false });
    }
  };

  const handleAnalyzeClick = async (idea: TrendingProductIdea) => {
    setAnalyzingName(idea.name);
    try {
      await onAnalyzeIdea(idea);
    } finally {
      setAnalyzingName(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Notification / Reminder Control Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {reminderPrefs.enabled ? (
              <Bell className="w-4 h-4 text-teal-700 shrink-0" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <h2 className="text-base font-semibold text-slate-900">
              Daily UAE Product Hunt Reminder
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Get a daily in-app digest + browser notification to review 5 fresh
            low-competition Zambeel UAE products.
            {notificationPermission === "denied" && (
              <span className="text-amber-700 font-medium">
                {" "}
                Browser notifications are blocked; in-app daily digest remains
                active.
              </span>
            )}
            {notificationPermission === "unsupported" && (
              <span className="text-slate-600">
                {" "}
                Your mobile browser uses the in-app daily digest banner.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <label
              htmlFor="reminder-time"
              className="text-xs font-semibold text-slate-600"
            >
              Daily Time
            </label>
            <input
              id="reminder-time"
              type="time"
              value={reminderPrefs.timeHHMM}
              onChange={(e) =>
                onUpdateReminderPrefs({
                  ...reminderPrefs,
                  timeHHMM: e.target.value || "09:30",
                })
              }
              className="min-h-[44px] px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={handleToggleReminder}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              reminderPrefs.enabled
                ? "bg-teal-700 text-white hover:bg-teal-800"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            {reminderPrefs.enabled ? "Reminder Active" : "Enable Daily Reminder"}
          </button>

          <button
            type="button"
            onClick={onTriggerTestReminder}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
          >
            Test Reminder
          </button>
        </div>
      </div>

      {/* Category Filter & Generate Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Today&apos;s UAE Trending Product Ideas
            </h2>
            <p className="text-xs text-slate-500">
              Curated for {currentMonthLabel} · Low-competition UAE COD niches
            </p>
          </div>

          <button
            type="button"
            onClick={() => onFetchIdeas(selectedCategory)}
            disabled={isLoading}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating 5 UAE Ideas...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>
                  {ideasData ? "Refresh 5 Fresh Ideas" : "Generate 5 UAE Ideas"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                void onFetchIdeas(cat);
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
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

        {isLoading && !ideasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : !ideasData ? (
          <div className="py-10 text-center space-y-2 border-t border-slate-100">
            <TrendingUp className="w-8 h-8 text-teal-700 mx-auto" />
            <p className="text-sm font-medium text-slate-800">
              Tap &ldquo;Generate 5 UAE Ideas&rdquo; to discover seasonal winners
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Each idea includes target AED price, Zambeel cost estimate,
              bilingual SEO keywords, and a 3-second Reels hook.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-700 font-medium">
              {ideasData.seasonHeadline}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideasData.ideas.map((idea, idx) => {
                const isBusy = analyzingName === idea.name;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-4 bg-slate-50/40"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{idea.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-teal-800">
                              {idea.competitionLevel} Competition
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            {idea.name}
                          </h3>
                          <p
                            dir="rtl"
                            className="font-arabic text-sm font-medium text-slate-600"
                          >
                            {idea.arabicName}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-500 block">
                            Target COD
                          </span>
                          <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                            {idea.recommendedSellingPriceAed} AED
                          </span>
                          <span className="text-xs text-slate-500 font-mono tabular-nums block">
                            Cost ~{idea.estimatedSupplierCostAed} AED
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {idea.whyItSellsInUae}
                      </p>

                      <div className="text-xs bg-white border border-slate-200 rounded-lg p-2.5">
                        <span className="font-semibold text-slate-700">
                          3s Video Hook:{" "}
                        </span>
                        <span className="text-slate-600">{idea.hookIdea}</span>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div>
                          <span className="font-semibold text-slate-700">
                            EN:{" "}
                          </span>
                          <span>{idea.keywordsEn.join(" · ")}</span>
                        </div>
                        <div dir="rtl" className="font-arabic">
                          <span className="font-semibold text-slate-700">
                            AR:{" "}
                          </span>
                          <span>{idea.keywordsAr.join(" · ")}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAnalyzeClick(idea)}
                      disabled={Boolean(analyzingName)}
                      className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-700 text-teal-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {isBusy ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Building Full Store &amp; Ad Kit...</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze &amp; Build Full Kit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
