import React, { useState, useEffect } from 'react';
import { useGoldRates } from '../../context/GoldRateContext';
import { formatINR, formatDate, formatTime } from '../../utils/formatters';
import { X, ShieldCheck, Sparkles } from 'lucide-react';

export function ShowroomDisplayBoard() {
  const { rates, isShowroomBoardOpen, setIsShowroomBoardOpen } = useGoldRates();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isShowroomBoardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-royal-950 via-royal-900 to-slate-950 text-white flex flex-col justify-between p-8 md:p-12 select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gold-500/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-300 text-royal-950 flex items-center justify-center text-4xl shadow-xl shadow-gold-500/20">
            👑
          </div>
          <div>
            <h1 className="font-serif-luxury font-black text-3xl md:text-4xl text-gold-300 tracking-wider">
              SWARNA JEWELLERY
            </h1>
            <p className="text-xs md:text-sm text-gold-400 font-semibold tracking-widest mt-1 uppercase">
              Kerala's Benchmark for Pure 916 BIS Hallmarked Jewellery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-slate-100 font-mono">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs md:text-sm text-gold-400 font-medium">
              {formatDate(currentTime)} • Kerala Showroom Rate
            </div>
          </div>
          <button
            onClick={() => setIsShowroomBoardOpen(false)}
            className="p-2.5 rounded-xl bg-royal-800/80 hover:bg-royal-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Exit Fullscreen Board"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-auto">
        {/* 22K 916 Per Gram - HERO */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-b from-royal-800/90 to-royal-850/90 border-2 border-gold-500/60 shadow-2xl backdrop-blur-md overflow-hidden transform hover:scale-[1.01] transition">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gold-500 text-royal-950 uppercase tracking-widest">
              Most Popular
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE
            </span>
          </div>
          <h2 className="text-base font-bold text-gold-300 mt-4 uppercase tracking-wider">
            22K (916) Hallmark Gold
          </h2>
          <div className="text-4xl md:text-5xl font-black text-white mt-2 tracking-tight">
            {formatINR(rates.gold_22k_gram)}
            <span className="text-xl font-normal text-slate-400 ml-2">/ gram</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Government BIS HUID certified hallmarked gold</p>
        </div>

        {/* 22K 916 Per Sovereign / Pavan - HERO */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-b from-gold-950/80 to-royal-900/90 border-2 border-gold-400/80 shadow-2xl backdrop-blur-md overflow-hidden transform hover:scale-[1.01] transition">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-400/20 rounded-full blur-2xl"></div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-gold-400 text-royal-950 uppercase tracking-widest">
            1 Sovereign
          </span>
          <h2 className="text-base font-bold text-gold-200 mt-4 uppercase tracking-wider">
            1 Pavan (8.000 Grams)
          </h2>
          <div className="text-4xl md:text-5xl font-black text-gold-300 mt-2 tracking-tight">
            {formatINR(rates.gold_22k_pavan || rates.gold_22k_gram * 8)}
          </div>
          <p className="text-xs text-gold-400/80 mt-3">Universal benchmark for Kerala weddings & savings</p>
        </div>

        {/* 24K Pure Bullion */}
        <div className="p-8 rounded-3xl bg-royal-850/80 border border-slate-700/60 shadow-xl backdrop-blur-md">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 uppercase tracking-wider">
            99.9% Pure
          </span>
          <h2 className="text-base font-bold text-slate-300 mt-4 uppercase tracking-wider">
            24K Fine Gold Bar
          </h2>
          <div className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">
            {formatINR(rates.gold_24k_gram)}
            <span className="text-lg font-normal text-slate-400 ml-2">/ gram</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Pure bullion bars & coins</p>
        </div>

        {/* 18K Diamond Standard */}
        <div className="p-8 rounded-3xl bg-royal-850/80 border border-slate-700/60 shadow-xl backdrop-blur-md">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 uppercase tracking-wider">
            Diamond Standard
          </span>
          <h2 className="text-base font-bold text-slate-300 mt-4 uppercase tracking-wider">
            18K Hallmarked Gold
          </h2>
          <div className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">
            {formatINR(rates.gold_18k_gram)}
            <span className="text-lg font-normal text-slate-400 ml-2">/ gram</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">For diamond solitaire & designer jewellery</p>
        </div>

        {/* Silver 999 */}
        <div className="p-8 rounded-3xl bg-royal-850/80 border border-slate-700/60 shadow-xl backdrop-blur-md">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 uppercase tracking-wider">
            Pure Silver
          </span>
          <h2 className="text-base font-bold text-slate-300 mt-4 uppercase tracking-wider">
            Silver (999 Fine)
          </h2>
          <div className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">
            {formatINR(rates.silver_gram)}
            <span className="text-lg font-normal text-slate-400 ml-2">/ gram</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">1 Kilogram: {formatINR(rates.silver_kg || rates.silver_gram * 1000)}</p>
        </div>

        {/* Old Gold Buy-back */}
        <div className="p-8 rounded-3xl bg-royal-850/80 border border-amber-600/40 shadow-xl backdrop-blur-md">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 uppercase tracking-wider">
            Instant Trade-In
          </span>
          <h2 className="text-base font-bold text-amber-300 mt-4 uppercase tracking-wider">
            Old Gold Purchase Rate
          </h2>
          <div className="text-3xl md:text-4xl font-black text-amber-400 mt-2 tracking-tight">
            {formatINR(rates.old_gold_purchase_rate)}
            <span className="text-lg font-normal text-slate-400 ml-2">/ gram</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Highest buy-back valuation with melt testing</p>
        </div>
      </div>

      {/* Showroom Footer Info */}
      <div className="border-t border-gold-500/20 pt-6 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gold-300 font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>100% BIS Hallmarked HUID Guaranteed</span>
          </div>
          <span>•</span>
          <span>GST 3% (1.5% CGST + 1.5% SGST) applicable on all purchases</span>
        </div>
        <div className="text-slate-500">
          SwarnaERP Digital Board Engine • Updated: {rates.rate_date || 'Today'}
        </div>
      </div>
    </div>
  );
}

export default ShowroomDisplayBoard;

