import React, { useState, useEffect } from 'react';
import { getOldGoldReceipts, createOldGoldReceipt } from '../../api';
import { useGoldRates } from '../../context/GoldRateContext';
import { evaluateOldGold } from '../../utils/keralaGoldMath';
import { formatINR, formatWeight, formatDate } from '../../utils/formatters';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Repeat, Plus, Calculator, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export function OldGoldEvaluator() {
  const { rates } = useGoldRates();
  const [receipts, setReceipts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Appraisal Form
  const [formData, setFormData] = useState({
    customer_name: 'Shailaja Ramachandran',
    customer_phone: '9447556677',
    customer_id_proof: 'KL-DRV-9081',
    description: 'Old Traditional Bangle (Tested with Caratometer)',
    gross_weight_g: 12.500,
    stone_dirt_deduction_g: 0.300,
    melt_loss_percent: 2.00,
    purity_percent: 91.60,
    settlement_type: 'EXCHANGE_DISCOUNT'
  });

  const loadReceipts = async () => {
    try {
      const res = await getOldGoldReceipts();
      if (res.success) setReceipts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  // Real-time calculation preview
  const preview = evaluateOldGold(formData, rates.old_gold_purchase_rate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createOldGoldReceipt(formData);
      if (res.success) {
        setIsModalOpen(false);
        loadReceipts();
        setSelectedReceipt(res.data);
      }
    } catch (err) {
      alert('Error recording old gold: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Receipt No / Date',
      accessor: 'receipt_no',
      render: (row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{row.receipt_no}</div>
          <div className="text-[10px] text-slate-400">{formatDate(row.created_at)}</div>
        </div>
      )
    },
    {
      header: 'Customer Details',
      accessor: 'customer_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.customer_name}</div>
          <div className="text-[11px] text-slate-500">{row.customer_phone} • ID: {row.customer_id_proof || 'Verified'}</div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description'
    },
    {
      header: 'Gross Wt',
      accessor: 'gross_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono',
      render: (row) => formatWeight(row.gross_weight_g)
    },
    {
      header: 'Net Melt Wt',
      accessor: 'net_melt_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold',
      render: (row) => formatWeight(row.net_melt_weight_g)
    },
    {
      header: 'Touch / Purity',
      accessor: 'purity_percent',
      className: 'text-center',
      cellClassName: 'text-center font-bold text-gold-800',
      render: (row) => `${row.purity_percent}%`
    },
    {
      header: 'Total Valuation Credit',
      accessor: 'total_credit_value',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-black text-amber-700 text-sm',
      render: (row) => formatINR(row.total_credit_value)
    },
    {
      header: 'Settlement',
      accessor: 'settlement_type',
      render: (row) => (
        <Badge variant={row.settlement_type === 'EXCHANGE_DISCOUNT' ? 'ACTIVE' : 'DEFAULT'}>
          {row.settlement_type === 'EXCHANGE_DISCOUNT' ? 'Trade-in Exchange' : 'Cash Payout'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Old Gold Appraisal & Exchange</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Purity assaying • Dirt & melting loss deduction • Prevailing purchase rate: <strong className="text-amber-700">{formatINR(rates.old_gold_purchase_rate)}/g</strong>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-royal-900 hover:bg-royal-800 text-white font-bold rounded-lg text-xs shadow transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Appraise Old Gold</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        searchPlaceholder="Search customer or receipt..."
        emptyMessage="No old gold appraisal records."
      />

      {/* ======================================================== */}
      {/* APPRAISAL MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Old Gold Valuation & Trade-In Calculator"
        subtitle="Calculates melting deduction, touch assaying, and generates trade-in credit."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Customer Name</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone / ID Proof</label>
              <input
                type="text"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border rounded-lg font-mono"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Ornament Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Gross Weight (Grams)</label>
              <input
                type="number"
                step="0.001"
                value={formData.gross_weight_g}
                onChange={(e) => setFormData({ ...formData, gross_weight_g: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Dirt / Stone Deduction (g)</label>
              <input
                type="number"
                step="0.001"
                value={formData.stone_dirt_deduction_g}
                onChange={(e) => setFormData({ ...formData, stone_dirt_deduction_g: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Melting Loss (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.melt_loss_percent}
                onChange={(e) => setFormData({ ...formData, melt_loss_percent: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Touch Assayed Purity (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.purity_percent}
                onChange={(e) => setFormData({ ...formData, purity_percent: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono font-bold text-gold-900"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Settlement Preference</label>
              <select
                value={formData.settlement_type}
                onChange={(e) => setFormData({ ...formData, settlement_type: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border rounded-lg bg-white font-bold"
              >
                <option value="EXCHANGE_DISCOUNT">Trade-in Voucher (Adjust in New Purchase POS)</option>
                <option value="CASH_PAYOUT">Direct Showroom Cash Payout (Requires Form 60)</option>
              </select>
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Net Melt Weight:</span>
              <span className="font-mono font-bold">{formatWeight(preview.net_melt_weight_g)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Fine Gold Equivalent (24K Pure):</span>
              <span className="font-mono font-bold text-amber-900">{formatWeight(preview.fine_gold_equivalent_g)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Adjusted Purchase Rate:</span>
              <span className="font-mono">{formatINR(preview.rate_applied_per_g)} /g</span>
            </div>
            <div className="pt-2 border-t border-amber-300 flex justify-between items-center text-sm font-black text-amber-950">
              <span>TOTAL CREDIT VALUATION:</span>
              <span className="text-lg font-mono">{formatINR(preview.total_credit_value)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-royal-950 font-bold rounded-lg text-xs shadow"
            >
              Issue Old Gold Voucher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default OldGoldEvaluator;

