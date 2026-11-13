import React, { useState, useEffect } from 'react';
import { getKarigarAccounts, getKarigarTransactions, recordKarigarTx } from '../../api';
import { formatINR, formatWeight, formatDate } from '../../utils/formatters';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Hammer, Plus, Scale, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function KarigarLedger() {
  const [karigars, setKarigars] = useState([]);
  const [selectedKarigar, setSelectedKarigar] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Job Work Form
  const [formData, setFormData] = useState({
    karigar_id: '',
    tx_type: 'ISSUE_RAW_GOLD', // 'ISSUE_RAW_GOLD', 'RECEIVE_FINISHED', 'CASH_PAYMENT'
    item_description: '24K Fine Gold Bar for Casting',
    gross_weight_g: 50.000,
    purity_percent: 99.90,
    allowed_loss_g: 0.500,
    actual_loss_g: 0.480,
    making_charge_inr: 0,
    notes: 'Order #ORD-882: 2 Traditional Kasumala'
  });

  const loadKarigars = async () => {
    try {
      const res = await getKarigarAccounts();
      if (res.success && res.data) {
        setKarigars(res.data);
        if (!selectedKarigar && res.data.length > 0) {
          setSelectedKarigar(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTransactions = async (karigarId) => {
    try {
      const res = await getKarigarTransactions(karigarId);
      if (res.success) setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadKarigars();
  }, []);

  useEffect(() => {
    if (selectedKarigar) {
      loadTransactions(selectedKarigar.id);
      setFormData(prev => ({ ...prev, karigar_id: selectedKarigar.id }));
    }
  }, [selectedKarigar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await recordKarigarTx({
        ...formData,
        gross_weight_g: Number(formData.gross_weight_g || 0),
        purity_percent: Number(formData.purity_percent || 99.9),
        allowed_loss_g: Number(formData.allowed_loss_g || 0),
        actual_loss_g: Number(formData.actual_loss_g || 0),
        making_charge_inr: Number(formData.making_charge_inr || 0)
      });
      if (res.success) {
        setIsModalOpen(false);
        loadKarigars();
        if (selectedKarigar) loadTransactions(selectedKarigar.id);
      }
    } catch (err) {
      alert('Error updating Karigar ledger: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Date & ID',
      accessor: 'id',
      render: (row) => (
        <div>
          <div className="font-mono text-xs text-slate-500">{formatDate(row.created_at)}</div>
          <span className="font-mono text-[10px] text-slate-400">{row.id}</span>
        </div>
      )
    },
    {
      header: 'Transaction Type',
      accessor: 'tx_type',
      render: (row) => {
        if (row.tx_type === 'ISSUE_RAW_GOLD') {
          return (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Issued Bullion</span>
            </span>
          );
        }
        if (row.tx_type === 'RECEIVE_FINISHED') {
          return (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Received Finished</span>
            </span>
          );
        }
        return <Badge>{row.tx_type}</Badge>;
      }
    },
    {
      header: 'Description / Notes',
      accessor: 'item_description',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.item_description}</div>
          {row.notes && <div className="text-[10px] text-slate-400">{row.notes}</div>}
        </div>
      )
    },
    {
      header: 'Gross (g)',
      accessor: 'gross_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono',
      render: (row) => formatWeight(row.gross_weight_g)
    },
    {
      header: 'Fine Gold 24K (g)',
      accessor: 'fine_gold_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold text-slate-900',
      render: (row) => formatWeight(row.fine_gold_weight_g)
    },
    {
      header: 'Allowed / Actual Loss',
      accessor: 'actual_loss_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono text-xs text-slate-500',
      render: (row) => `${formatWeight(row.allowed_loss_g, false)} / ${formatWeight(row.actual_loss_g, false)}`
    },
    {
      header: 'Labor / Making (₹)',
      accessor: 'making_charge_inr',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold text-slate-800',
      render: (row) => formatINR(row.making_charge_inr)
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Karigar (Goldsmith) Dual Metal Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thrissur & Kozhikode goldsmith job-work accounts • Dual tracking of Fine Metal (Grams) and Labor (₹)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-royal-900 hover:bg-royal-800 text-white font-bold rounded-lg text-xs shadow transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Record Job Work Order</span>
        </button>
      </div>

      {/* Karigars Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {karigars.map(k => (
          <div
            key={k.id}
            onClick={() => setSelectedKarigar(k)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedKarigar?.id === k.id
                ? 'bg-gradient-to-br from-royal-900 to-royal-950 text-white border-gold-500 shadow-lg'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  selectedKarigar?.id === k.id ? 'bg-royal-800 text-gold-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {k.karigar_code}
                </span>
                <h3 className="text-base font-bold mt-2">{k.name}</h3>
                <p className={`text-xs mt-0.5 ${selectedKarigar?.id === k.id ? 'text-slate-400' : 'text-slate-500'}`}>
                  {k.workshop_location} • {k.phone}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-gold-500 text-royal-950">
                <Hammer className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/20">
              <div>
                <span className={`text-[11px] uppercase tracking-wider ${
                  selectedKarigar?.id === k.id ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Pure Gold Metal Balance:
                </span>
                <p className={`text-xl font-mono font-black mt-0.5 ${
                  selectedKarigar?.id === k.id ? 'text-gold-300' : 'text-gold-800'
                }`}>
                  {formatWeight(k.pure_gold_balance_g)}
                </p>
              </div>

              <div>
                <span className={`text-[11px] uppercase tracking-wider ${
                  selectedKarigar?.id === k.id ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Labor Dues Owed:
                </span>
                <p className="text-xl font-mono font-bold mt-0.5">
                  {formatINR(k.cash_balance_inr)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Karigar Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions}
        searchPlaceholder="Search order description or notes..."
        emptyMessage="No job work transactions recorded for this Karigar."
      />

      {/* ======================================================== */}
      {/* RECORD JOB WORK ORDER MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Karigar Metal / Job Work Entry"
        subtitle="Issue raw bullion or receive finished crafted ornaments."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Select Karigar</label>
              <select
                value={formData.karigar_id}
                onChange={(e) => setFormData({ ...formData, karigar_id: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border rounded-lg bg-white"
                required
              >
                {karigars.map(k => (
                  <option key={k.id} value={k.id}>{k.name} ({k.workshop_location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Transaction Type</label>
              <select
                value={formData.tx_type}
                onChange={(e) => setFormData({ ...formData, tx_type: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs border rounded-lg bg-white font-bold"
              >
                <option value="ISSUE_RAW_GOLD">Issue 24K Raw Bullion / Bars</option>
                <option value="RECEIVE_FINISHED">Receive Finished Crafted Ornaments</option>
                <option value="CASH_PAYMENT">Labor Charge Cash Payout</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Work Description</label>
              <input
                type="text"
                value={formData.item_description}
                onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, gross_weight_g: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Purity (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.purity_percent}
                onChange={(e) => setFormData({ ...formData, purity_percent: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Allowed Melting Loss (g)</label>
              <input
                type="number"
                step="0.001"
                value={formData.allowed_loss_g}
                onChange={(e) => setFormData({ ...formData, allowed_loss_g: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Actual Melting Loss (g)</label>
              <input
                type="number"
                step="0.001"
                value={formData.actual_loss_g}
                onChange={(e) => setFormData({ ...formData, actual_loss_g: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono font-bold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Labor / Making Charge Amount (₹)</label>
              <input
                type="number"
                value={formData.making_charge_inr}
                onChange={(e) => setFormData({ ...formData, making_charge_inr: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border rounded-lg font-mono font-bold"
              />
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
              Record in Dual Ledger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KarigarLedger;

