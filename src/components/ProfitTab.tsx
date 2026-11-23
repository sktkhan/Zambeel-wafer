import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { ProfitInputs } from "../types/cod";
import {
  DEFAULT_PROFIT_INPUTS,
  calculateCodProfit,
} from "../utils/storage";

interface ProfitTabProps {
  inputs: ProfitInputs;
  activeProductName?: string;
  onChange: (next: ProfitInputs) => void;
}

export function ProfitTab({
  inputs,
  activeProductName,
  onChange,
}: ProfitTabProps) {
  const metrics = calculateCodProfit(inputs);

  const updateField = (field: keyof ProfitInputs, value: number) => {
    onChange({
      ...inputs,
      [field]: Number.isFinite(value) ? value : 0,
    });
  };

  const verdictBanner =
    metrics.status === "PASS"
      ? {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />,
          label: "PASS — Healthy UAE COD Margin",
          detail:
            "Net profit is at least 15 AED and 15% margin after factoring RTO returns.",
        }
      : metrics.status === "MARGINAL"
      ? {
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          icon: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />,
          label: "MARGINAL — Thin Margin After RTO",
          detail:
            "Profitable, but vulnerable if CPA or UAE RTO rises above your estimate. Raise price or bundle.",
        }
      : {
          bg: "bg-rose-50 border-rose-200 text-rose-900",
          icon: <XCircle className="w-5 h-5 text-rose-700 shrink-0" />,
          label: "FAIL — Unprofitable at Current RTO & CPA",
          detail:
            "You lose money per delivered order. Raise selling price, lower CPA, or choose a cheaper Zambeel SKU.",
        };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Zambeel UAE COD Calculator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeProductName
                ? `Modeling margins for: ${activeProductName}`
                : "Accounts for Zambeel delivery fees and UAE RTO returns."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PROFIT_INPUTS)}
            className="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="selling-price"
              className="flex items-center justify-between text-xs font-semibold text-slate-700"
            >
              <span>Target Selling Price (AED)</span>
              <span className="font-mono tabular-nums text-teal-800">
                {inputs.sellingPriceAed} AED
              </span>
            </label>
            <input
              id="selling-price"
              type="number"
              min={0}
              step={1}
              value={inputs.sellingPriceAed}
              onChange={(e) =>
                updateField("sellingPriceAed", parseFloat(e.target.value))
              }
              className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="supplier-cost"
                className="block text-xs font-semibold text-slate-700"
              >
                Supplier Cost (AED)
              </label>
              <input
                id="supplier-cost"
                type="number"
                min={0}
                step={1}
                value={inputs.supplierCostAed}
                onChange={(e) =>
                  updateField("supplierCostAed", parseFloat(e.target.value))
                }
                className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="zambeel-fee"
                className="block text-xs font-semibold text-slate-700"
              >
                Zambeel COD / Delivery (AED)
              </label>
              <input
                id="zambeel-fee"
                type="number"
                min={0}
                step={1}
                value={inputs.zambeelFeeAed}
                onChange={(e) =>
                  updateField("zambeelFeeAed", parseFloat(e.target.value))
                }
                className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="cpa-aed"
              className="flex items-center justify-between text-xs font-semibold text-slate-700"
            >
              <span>Estimated Ad Cost / CPA (AED per Order)</span>
              <span className="font-mono tabular-nums text-slate-600">
                {inputs.cpaAed} AED
              </span>
            </label>
            <input
              id="cpa-aed"
              type="number"
              min={0}
              step={1}
              value={inputs.cpaAed}
              onChange={(e) => updateField("cpaAed", parseFloat(e.target.value))}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <label htmlFor="rto-slider">Expected UAE Return / RTO %</label>
              <span className="font-mono tabular-nums text-slate-900">
                {inputs.rtoPercent}% RTO ({100 - inputs.rtoPercent}% Delivered)
              </span>
            </div>
            <input
              id="rto-slider"
              type="range"
              min={0}
              max={60}
              step={1}
              value={inputs.rtoPercent}
              onChange={(e) =>
                updateField("rtoPercent", parseFloat(e.target.value))
              }
              className="w-full h-2 accent-teal-700 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-2">
              {[15, 25, 35, 45].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateField("rtoPercent", preset)}
                  className={`flex-1 min-h-[38px] rounded-xl text-xs font-mono tabular-nums font-semibold border transition-colors cursor-pointer ${
                    inputs.rtoPercent === preset
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Verdict & Breakdown */}
      <div className="lg:col-span-7 space-y-5">
        {/* Verdict Banner */}
        <div className={`border rounded-2xl p-4 sm:p-5 flex items-start gap-3 ${verdictBanner.bg}`}>
          <div className="mt-0.5">{verdictBanner.icon}</div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">{verdictBanner.label}</h3>
            <p className="text-xs sm:text-sm opacity-90 mt-0.5">
              {verdictBanner.detail}
            </p>
          </div>
        </div>

        {/* Key KPI Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">
                Net Profit / Delivered
              </span>
              <span
                className={`text-2xl font-bold font-mono tabular-nums block ${
                  metrics.netProfitPerDeliveredAed > 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {metrics.netProfitPerDeliveredAed >= 0 ? "+" : ""}
                {metrics.netProfitPerDeliveredAed.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">AED</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">
                Break-Even Price
              </span>
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
                {metrics.breakEvenPriceAed.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">AED</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">Max Safe CPA</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
                {metrics.maxSafeCpaAed.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                AED (15% margin: {metrics.safeCpaAt15MarginAed.toFixed(0)})
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">Net Margin</span>
              <span
                className={`text-2xl font-bold font-mono tabular-nums block ${
                  metrics.netMarginPercent >= 15
                    ? "text-emerald-700"
                    : metrics.netMarginPercent > 0
                    ? "text-amber-700"
                    : "text-rose-700"
                }`}
              >
                {metrics.netMarginPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Min ROAS {metrics.roasBreakEven.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        {/* 100-Order Zambeel Cashflow Simulation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h3 className="text-sm font-semibold text-slate-900">
              100-Order UAE Cashflow Simulation
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {metrics.sim100Orders.deliveredCount} Delivered ·{" "}
              {metrics.sim100Orders.rtoCount} RTO Returned
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-slate-600">
                Collected COD Revenue ({metrics.sim100Orders.deliveredCount}{" "}
                orders × {inputs.sellingPriceAed} AED)
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                +{metrics.sim100Orders.collectedRevenueAed.toLocaleString()} AED
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-slate-600">
                Supplier Product Cost ({metrics.sim100Orders.deliveredCount}{" "}
                delivered)
              </span>
              <span className="font-mono tabular-nums text-slate-700">
                −{metrics.sim100Orders.totalSupplierCostAed.toLocaleString()} AED
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-slate-600">
                Zambeel Delivery &amp; COD Handling (100 shipped)
              </span>
              <span className="font-mono tabular-nums text-slate-700">
                −{metrics.sim100Orders.totalZambeelFeeAed.toLocaleString()} AED
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-slate-600">
                Total Ad Spend (100 orders × {inputs.cpaAed} AED CPA)
              </span>
              <span className="font-mono tabular-nums text-slate-700">
                −{metrics.sim100Orders.totalAdSpendAed.toLocaleString()} AED
              </span>
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-900">
                Projected Net Profit (100 Orders)
              </span>
              <span
                className={`text-lg font-bold font-mono tabular-nums ${
                  metrics.sim100Orders.totalNetProfitAed >= 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {metrics.sim100Orders.totalNetProfitAed >= 0 ? "+" : ""}
                {metrics.sim100Orders.totalNetProfitAed.toLocaleString()} AED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
