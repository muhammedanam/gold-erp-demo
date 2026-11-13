import React from 'react';

const statusStyles = {
  IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SOLD: 'bg-slate-100 text-slate-600 border-slate-200',
  ON_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
  KARIGAR_WORK: 'bg-blue-50 text-blue-700 border-blue-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MATURED: 'bg-purple-50 text-purple-700 border-purple-200',
  REDEEMED: 'bg-slate-100 text-slate-600 border-slate-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '22K': 'bg-gold-50 text-gold-800 border-gold-300 font-bold',
  '24K': 'bg-amber-100 text-amber-900 border-amber-400 font-extrabold',
  '18K': 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
  SILVER: 'bg-slate-100 text-slate-700 border-slate-300 font-medium'
};

export function Badge({ children, variant, className = '' }) {
  const key = variant || (typeof children === 'string' ? children.toUpperCase() : 'DEFAULT');
  const style = statusStyles[key] || 'bg-slate-50 text-slate-700 border-slate-200';
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;

