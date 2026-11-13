import React from 'react';
import { 
  ShoppingBag, 
  Layers, 
  Repeat, 
  Coins, 
  Hammer, 
  FileText, 
  Sparkles,
  BarChart3,
  ShieldCheck,
  Building2
} from 'lucide-react';

const navItems = [
  { id: 'pos', label: 'POS Billing', malayalam: 'കൗണ്ടർ ബില്ലിംഗ്', icon: ShoppingBag, badge: 'Fast' },
  { id: 'inventory', label: 'Inventory & HUID', malayalam: 'സ്റ്റോക്ക് & ഹോൾമാർക്ക്', icon: Layers },
  { id: 'old-gold', label: 'Old Gold Exchange', malayalam: 'പഴയ സ്വർണ്ണം', icon: Repeat },
  { id: 'chit', label: 'Swarna Nidhi (Chit)', malayalam: 'സ്വർണ്ണ നിധി സ്കീം', icon: Coins, badge: '11+1' },
  { id: 'karigar', label: 'Karigar Metal Ledger', malayalam: 'തട്ടാൻ / വർക്ക്ഷോപ്പ്', icon: Hammer },
  { id: 'invoices', label: 'Sales Invoices', malayalam: 'ഇൻവോയ്സുകൾ', icon: FileText },
  { id: 'day-book', label: 'Day Book & Audit', malayalam: 'ഡേ ബുക്ക് റീകൺസിലിയേഷൻ', icon: BarChart3 }
];

export function Sidebar({ currentTab, onSelectTab }) {
  return (
    <aside className="w-64 bg-royal-900 text-slate-200 border-r border-royal-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-royal-800 bg-royal-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-royal-950 font-black text-xl shadow-lg shadow-gold-500/20">
            👑
          </div>
          <div>
            <h1 className="font-serif-luxury font-bold text-lg text-gold-300 tracking-wider">SWARNA ERP</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">KERALA JEWELLERY SUITE</p>
          </div>
        </div>

        {/* BIS Hallmark Badge */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-royal-800/80 border border-gold-500/20 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-gold-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">BIS 916 HUID Compliant</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-300 border border-gold-500/30 shadow-sm' 
                  : 'text-slate-300 hover:bg-royal-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.malayalam}</div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-gold-500 text-royal-950' : 'bg-royal-700 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Showroom Branch Footer */}
      <div className="p-4 border-t border-royal-800 bg-royal-950/60">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-gold-400" />
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Kochi Main Showroom</p>
            <p className="text-[10px] text-slate-400">MG Road, Ernakulam</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

