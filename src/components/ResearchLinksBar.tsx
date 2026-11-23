import { ExternalLink, Search, TrendingUp, Video } from "lucide-react";
import { buildResearchLinks } from "../utils/storage";

interface ResearchLinksBarProps {
  query: string;
}

export function ResearchLinksBar({ query }: ResearchLinksBarProps) {
  const links = buildResearchLinks(query);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            1-Tap UAE Market Research
          </h3>
          <p className="text-xs text-slate-500">
            Verify live UAE ad creatives and search volume for{" "}
            <span className="font-medium text-slate-700">
              {query.trim() || "your product"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <a
          href={links.tiktokCreativeCenter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <span className="inline-flex items-center gap-2 truncate">
            <Video className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="truncate">TikTok Creative Center (UAE)</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </a>

        <a
          href={links.metaAdLibrary}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <span className="inline-flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="truncate">Meta Ad Library (UAE)</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </a>

        <a
          href={links.googleTrends}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <span className="inline-flex items-center gap-2 truncate">
            <TrendingUp className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="truncate">Google Trends (UAE)</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </a>
      </div>
    </div>
  );
}
