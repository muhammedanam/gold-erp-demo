import React, { useState, useEffect } from 'react';
import { getInvoices } from '../../api';
import { formatINR, formatWeight, formatPavan, formatDate } from '../../utils/formatters';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { ReceiptInvoice } from './ReceiptInvoice';
import { Badge } from '../common/Badge';
import { FileText, Printer, Eye } from 'lucide-react';

export function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    try {
      const res = await getInvoices();
      if (res.success) setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const columns = [
    {
      header: 'Invoice No',
      accessor: 'invoice_no',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-300">
          {row.invoice_no}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.customer_name}</div>
          <div className="text-[11px] text-slate-500">{row.customer_phone}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">
          {formatDate(row.created_at)}
        </span>
      )
    },
    {
      header: 'Net Gold Wt',
      accessor: 'total_net_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold text-slate-900',
      render: (row) => `${formatWeight(row.total_net_weight_g)} (${formatPavan(row.total_pavan)})`
    },
    {
      header: 'Taxable (₹)',
      accessor: 'taxable_amount',
      className: 'text-right',
      cellClassName: 'text-right font-mono',
      render: (row) => formatINR(row.taxable_amount)
    },
    {
      header: 'GST 3% (₹)',
      accessor: 'gst_total_amount',
      className: 'text-right',
      cellClassName: 'text-right font-mono text-xs text-slate-500',
      render: (row) => formatINR((row.cgst_amount || 0) + (row.sgst_amount || 0))
    },
    {
      header: 'Net Payable (₹)',
      accessor: 'net_payable',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-black text-slate-950 text-sm',
      render: (row) => formatINR(row.net_payable)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge>{row.status || 'COMPLETED'}</Badge>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => setSelectedInvoice(row)}
          className="flex items-center gap-1 px-2.5 py-1 bg-royal-900 text-white rounded text-xs font-bold hover:bg-royal-800 transition shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-gold-400" />
          <span>View / Print</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Tax Invoices Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            GST compliant sales bills with HUID breakdown & dual A4/Thermal printing
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Search by invoice number or customer..."
        emptyMessage="No sales invoices generated yet."
      />

      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice?.invoice_no?.startsWith('EST') ? "Estimate / Proforma Quotation" : "Showroom Tax Invoice"}
        subtitle={`${selectedInvoice?.invoice_no?.startsWith('EST') ? 'Estimate No' : 'Invoice No'}: ${selectedInvoice?.invoice_no}`}
        maxWidth="max-w-4xl"
      >
        <ReceiptInvoice
          invoice={selectedInvoice}
          isEstimate={selectedInvoice?.invoice_no?.startsWith('EST')}
          onClose={() => setSelectedInvoice(null)}
        />
      </Modal>
    </div>
  );
}

export default InvoiceList;

