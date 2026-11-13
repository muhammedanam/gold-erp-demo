import React, { useState, useEffect } from 'react';
import { getChittySchemes, getChittyAccounts, payChittyInstallment } from '../../api';
import { useGoldRates } from '../../context/GoldRateContext';
import { formatINR, formatWeight, formatPavan } from '../../utils/formatters';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Coins, Plus, CreditCard, Sparkles, CheckCircle2, Award } from 'lucide-react';

export function ChitManager() {
  const { rates } = useGoldRates();
  const [schemes, setSchemes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [payAmount, setPayAmount] = useState(5000);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schRes, accRes] = await Promise.all([
        getChittySchemes(),
        getChittyAccounts()
      ]);
      if (schRes.success) setSchemes(schRes.data);
      if (accRes.success) setAccounts(accRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedAcc) return;
    setSubmitting(true);
    try {
      const res = await payChittyInstallment({
        accountId: selectedAcc.id,
        amount: Number(payAmount)
      });
      if (res.success) {
        setSelectedAcc(null);
        loadData();
      }
    } catch (err) {
      alert('Error recording payment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Passbook No',
      accessor: 'passbook_no',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-300">
          {row.passbook_no}
        </span>
      )
    },
    {
      header: 'Customer Details',
      accessor: 'customer_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.customer_name}</div>
          <div className="text-[11px] text-slate-500">{row.customer_phone}</div>
        </div>
      )
    },
    {
      header: 'Scheme Name',
      accessor: 'scheme_name'
    },
    {
      header: 'Installments Paid',
      accessor: 'installments_paid',
      className: 'text-center',
      cellClassName: 'text-center font-bold',
      render: (row) => `${row.installments_paid} / 11 Months`
    },
    {
      header: 'Total Paid (₹)',
      accessor: 'total_amount_paid',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold',
      render: (row) => formatINR(row.total_amount_paid)
    },
    {
      header: 'Gold Accumulated',
      accessor: 'total_gold_accumulated_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold text-gold-900',
      render: (row) => `${formatWeight(row.total_gold_accumulated_g)} (${formatPavan(row.total_gold_accumulated_g / 8)})`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge>{row.status}</Badge>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'ACTIVE' && (
            <button
              onClick={() => {
                setSelectedAcc(row);
                setPayAmount(row.scheme_id === 'sch-2' ? 10000 : 5000);
              }}
              className="px-2.5 py-1 bg-royal-900 hover:bg-royal-800 text-white rounded text-xs font-bold transition"
            >
              Pay Month
            </button>
          )}
          {row.status === 'MATURED' && (
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-xs font-bold border border-purple-300">
              Ready to Redeem
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Swarna Nidhi (Gold Chit Schemes)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Advance gold booking & 11+1 month bonus schemes • Passbook accumulation management
          </p>
        </div>
      </div>

      {/* Schemes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schemes.map(sch => (
          <div key={sch.id} className="p-4 rounded-xl bg-gradient-to-br from-white to-gold-50/50 border border-gold-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-gold-800 bg-gold-100 px-2 py-0.5 rounded">
                {sch.scheme_code}
              </span>
              <span className="text-xs font-bold text-emerald-600">Active Scheme</span>
            </div>
            <h3 className="font-bold text-slate-900 mt-2 text-sm">{sch.scheme_name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {sch.duration_months} Months installment + {sch.bonus_months} Month showroom bonus
            </p>
            <div className="mt-3 pt-3 border-t border-gold-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>VA / Making Charge Benefit:</span>
              <span className="text-gold-900 font-bold">{sch.max_va_discount_percent}% OFF</span>
            </div>
          </div>
        ))}
      </div>

      {/* Passbook Accounts Table */}
      <DataTable
        columns={columns}
        data={accounts}
        searchPlaceholder="Search passbook number or customer..."
        emptyMessage="No chit scheme accounts registered."
      />

      {/* ======================================================== */}
      {/* PAY INSTALLMENT MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(selectedAcc)}
        onClose={() => setSelectedAcc(null)}
        title="Record Chit Scheme Installment"
        subtitle={`Passbook: ${selectedAcc?.passbook_no} • Customer: ${selectedAcc?.customer_name}`}
      >
        {selectedAcc && (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Installment:</span>
                <span className="font-bold text-slate-900">Month #{selectedAcc.installments_paid + 1} of 11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prev Total Deposited:</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(selectedAcc.total_amount_paid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gold Accumulated So Far:</span>
                <span className="font-mono font-bold text-gold-800">{formatWeight(selectedAcc.total_gold_accumulated_g)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Monthly Installment Amount (₹)</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-base font-bold font-mono border rounded-lg focus:ring-1 focus:ring-gold-500"
                required
              />
            </div>

            <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl text-xs flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Gold Added at Today's Rate ({formatINR(rates.gold_22k_gram)}/g):</span>
              <span className="font-mono font-bold text-gold-950">
                +{formatWeight(Number(payAmount) / rates.gold_22k_gram)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedAcc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-royal-950 font-bold rounded-lg text-xs shadow disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Record Payment & Print Passbook'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default ChitManager;

