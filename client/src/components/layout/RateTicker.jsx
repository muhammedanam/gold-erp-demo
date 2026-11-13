import React from 'react';
import { useGoldRates } from '../../context/GoldRateContext';
import { formatINR } from '../../utils/formatters';
import { TrendingUp, RefreshCw, Tv, Edit3 } from 'lucide-react';

export function RateTicker() {
  const { rates, setIsRateModalOpen, setIsShowroomBoardOpen } = useGoldRates();

  return (
    <div className="bg-royal-900 text-white px-4 py-2 border-b border-gold-600/30 flex flex-wrap items-center justify-between text-xs shadow-md">
      {/* Live Gold Ticker */}
      <div className="flex items-center gap-6 overflow-x-auto py-1">
        <div className="flex items-center gap-2 font-bold text-gold-400 bg-royal-800 px-2.5 py-1 rounded border border-gold-500/30">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>KERALA LIVE BOARD</span>
        </div>

        {/* 22K (916) Gram */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-400">22K (916) / g:</span>
          <span className="font-bold text-gold-300 text-sm">{formatINR(rates.gold_22k_gram)}</span>
        </div>

        {/* 22K (916) Sovereign / Pavan */}
        <div className="flex items-center gap-1.5 whitespace-nowrap bg-gold-950/60 px-2.5 py-0.5 rounded border border-gold-500/40">
          <span className="text-gold-400 font-semibold">1 Pavan (8g):</span>
          <span className="font-extrabold text-gold-200 text-sm">{formatINR(rates.gold_22k_pavan || rates.gold_22k_gram * 8)}</span>
        </div>

        {/* 24K Pure */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-400">24K Pure / g:</span>
          <span className="font-semibold text-slate-100">{formatINR(rates.gold_24k_gram)}</span>
        </div>

        {/* 18K Diamond Standard */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-400">18K / g:</span>
          <span className="font-semibold text-slate-200">{formatINR(rates.gold_18k_gram)}</span>
        </div>

        {/* Silver */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-400">Silver 999 / g:</span>
          <span className="font-semibold text-slate-300">{formatINR(rates.silver_gram)}</span>
        </div>

        {/* Old Gold Purchase */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-amber-400">Old Gold Buy:</span>
          <span className="font-bold text-amber-300">{formatINR(rates.old_gold_purchase_rate)}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setIsShowroomBoardOpen(true)}
          className="flex items-center gap-1.5 bg-royal-800 hover:bg-royal-700 text-slate-200 hover:text-white px-2.5 py-1 rounded border border-slate-700 transition"
          title="Open Fullscreen Showroom TV Board"
        >
          <Tv className="w-3.5 h-3.5 text-gold-400" />
          <span className="hidden md:inline font-medium">Showroom TV Display</span>
        </button>

        <button
          onClick={() => setIsRateModalOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-950 font-bold px-3 py-1 rounded shadow-sm transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Update Rates</span>
        </button>
      </div>
    </div>
  );
}

export default RateTicker;

