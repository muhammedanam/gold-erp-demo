import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'gold', trend, onClick }) {
  const colorMap = {
    gold: 'bg-gold-50/70 border-gold-200 text-gold-900',
    blue: 'bg-blue-50/70 border-blue-200 text-blue-900',
    emerald: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
    purple: 'bg-purple-50/70 border-purple-200 text-purple-900',
    slate: 'bg-slate-50 border-slate-200 text-slate-800'
  };

  const iconColorMap = {
    gold: 'bg-gold-500 text-white shadow-gold-500/20',
    blue: 'bg-blue-600 text-white shadow-blue-500/20',
    emerald: 'bg-emerald-600 text-white shadow-emerald-500/20',
    purple: 'bg-purple-600 text-white shadow-purple-500/20',
    slate: 'bg-slate-700 text-white shadow-slate-500/20'
  };

  return (
    <div 
      onClick={onClick}
      className={`relative p-5 rounded-xl border backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md ${colorMap[color]} ${onClick ? 'cursor-pointer hover:border-gold-400' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs mt-1 text-slate-600 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg shadow-sm ${iconColorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 text-xs font-medium text-emerald-600 flex items-center gap-1">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;

