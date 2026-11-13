import React, { useState, useEffect } from 'react';
import { useGoldRates } from '../../context/GoldRateContext';
import { Modal } from '../common/Modal';
import { formatINR } from '../../utils/formatters';
import { Save, AlertCircle, Sparkles } from 'lucide-react';

export function RateBoardModal() {
  const { rates, isRateModalOpen, setIsRateModalOpen, saveRates } = useGoldRates();
  
  const [formData, setFormData] = useState({
    gold_22k_gram: 7150,
    gold_24k_gram: 7800,
    gold_18k_gram: 5850,
    silver_gram: 98,
    old_gold_purchase_rate: 6800
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (rates) {
      setFormData({
        gold_22k_gram: rates.gold_22k_gram || 7150,
        gold_24k_gram: rates.gold_24k_gram || 7800,
        gold_18k_gram: rates.gold_18k_gram || 5850,
        silver_gram: rates.silver_gram || 98,
        old_gold_purchase_rate: rates.old_gold_purchase_rate || 6800
      });
    }
  }, [rates, isRateModalOpen]);

  // Dynamic automatic calculation of Pavan and Pure gold when 22K is edited
  const handle22kChange = (val) => {
    const num = Number(val) || 0;
    setFormData(prev => ({
      ...prev,
      gold_22k_gram: num,
      gold_24k_gram: Math.round(num * (24 / 22)),
      gold_18k_gram: Math.round(num * (18 / 22)),
      old_gold_purchase_rate: Math.max(0, num - 350)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await saveRates(formData);
      setSuccessMsg('Board rates updated and broadcast across all counters!');
      setTimeout(() => {
        setSuccessMsg('');
        setIsRateModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const calculatedPavan = (Number(formData.gold_22k_gram) || 0) * 8;
  const calculatedSilverKg = (Number(formData.silver_gram) || 0) * 1000;

  return (
    <Modal
      isOpen={isRateModalOpen}
      onClose={() => setIsRateModalOpen(false)}
      title="Daily Kerala Gold & Silver Board Rates"
      subtitle="Update morning opening rates. Automatically adjusts 1 Pavan (8g) and Silver/Kg calculations."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 22K Gram */}
          <div className="p-3.5 bg-gold-50/60 rounded-xl border border-gold-200">
            <label className="block text-xs font-bold text-gold-900 uppercase">
              22K (916 Hallmark) / Gram (₹)
            </label>
            <input
              type="number"
              step="any"
              value={formData.gold_22k_gram}
              onChange={(e) => handle22kChange(e.target.value)}
              className="mt-1.5 w-full text-lg font-bold px-3 py-2 bg-white border border-gold-300 rounded-lg focus:ring-2 focus:ring-gold-500 text-gold-950"
              required
            />
            <div className="mt-2 text-xs font-semibold text-gold-800 flex items-center justify-between">
              <span>1 Sovereign (Pavan = 8g):</span>
              <span className="text-sm font-extrabold">{formatINR(calculatedPavan)}</span>
            </div>
          </div>

          {/* 24K Pure */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
            <label className="block text-xs font-bold text-amber-900 uppercase">
              24K Pure Bullion / Gram (₹)
            </label>
            <input
              type="number"
              step="any"
              value={formData.gold_24k_gram}
              onChange={(e) => setFormData({ ...formData, gold_24k_gram: Number(e.target.value) })}
              className="mt-1.5 w-full text-lg font-bold px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-amber-950"
              required
            />
            <p className="mt-2 text-xs text-amber-700">Standard for Karigar 24K casting bars</p>
          </div>

          {/* 18K Diamond Standard */}
          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
            <label className="block text-xs font-bold text-rose-900 uppercase">
              18K Diamond Jewellery / Gram (₹)
            </label>
            <input
              type="number"
              step="any"
              value={formData.gold_18k_gram}
              onChange={(e) => setFormData({ ...formData, gold_18k_gram: Number(e.target.value) })}
              className="mt-1.5 w-full text-lg font-bold px-3 py-2 bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-rose-950"
              required
            />
            <p className="mt-2 text-xs text-rose-700">Diamond and lightweight boutique pieces</p>
          </div>

          {/* Old Gold Purchase */}
          <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-200">
            <label className="block text-xs font-bold text-orange-900 uppercase">
              Old Gold Purchase Rate / Gram (₹)
            </label>
            <input
              type="number"
              step="any"
              value={formData.old_gold_purchase_rate}
              onChange={(e) => setFormData({ ...formData, old_gold_purchase_rate: Number(e.target.value) })}
              className="mt-1.5 w-full text-lg font-bold px-3 py-2 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-orange-950"
              required
            />
            <p className="mt-2 text-xs text-orange-700">Counter valuation baseline for old gold trade-ins</p>
          </div>

          {/* Silver Gram */}
          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase">
                  Silver 999 / Gram (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.silver_gram}
                  onChange={(e) => setFormData({ ...formData, silver_gram: Number(e.target.value) })}
                  className="mt-1.5 w-full text-lg font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-slate-900"
                  required
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="text-xs font-semibold text-slate-600">Silver Rate per Kilogram:</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{formatINR(calculatedSilverKg)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setIsRateModalOpen(false)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-gold-500 hover:bg-gold-600 text-royal-950 rounded-lg shadow transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Broadcasting...' : 'Save & Broadcast Rates'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RateBoardModal;

