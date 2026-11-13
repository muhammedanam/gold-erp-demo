import React, { useState, useEffect } from 'react';
import { getInventory, addInventoryItem, getCategories } from '../../api';
import { useGoldRates } from '../../context/GoldRateContext';
import { calculateItemPricing } from '../../utils/keralaGoldMath';
import { formatINR, formatWeight, formatPavan } from '../../utils/formatters';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Plus, Tag, ShieldCheck, Printer, Barcode, Layers, Sparkles } from 'lucide-react';

export function InventoryManager() {
  const { rates } = useGoldRates();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category_id: 'cat-1',
    purity_karat: '22K',
    gross_weight_g: '',
    stone_weight_g: '0',
    stone_value_inr: '0',
    va_percent: '8.5',
    making_charge_per_g: '0',
    counter_tray: 'Bridal Counter - Tray 1',
    huid: ''
  });

  // Tag Sticker Modal
  const [tagModalItem, setTagModalItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([
        getInventory(),
        getCategories()
      ]);
      if (invRes.success) setItems(invRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const res = await addInventoryItem({
        ...formData,
        gross_weight_g: Number(formData.gross_weight_g),
        stone_weight_g: Number(formData.stone_weight_g || 0),
        stone_value_inr: Number(formData.stone_value_inr || 0),
        va_percent: Number(formData.va_percent || 8.0),
        making_charge_per_g: Number(formData.making_charge_per_g || 0)
      });
      if (res.success) {
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert('Failed to add item: ' + err.message);
    }
  };

  // Compute calculated net weight in form
  const formNetWeight = Math.max(0, Number(formData.gross_weight_g || 0) - Number(formData.stone_weight_g || 0));

  // Columns for universal DataTable
  const columns = [
    {
      header: 'HUID & Barcode',
      accessor: 'huid',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-slate-900 bg-gold-100/80 px-2 py-0.5 rounded text-xs border border-gold-300">
              {row.huid}
            </span>
            <Badge variant={row.purity_karat}>{row.purity_karat}</Badge>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">{row.barcode}</div>
        </div>
      )
    },
    {
      header: 'Ornament Name / Tray',
      accessor: 'item_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.item_name}</div>
          <div className="text-[11px] text-slate-500">{row.counter_tray}</div>
        </div>
      )
    },
    {
      header: 'Gross (g)',
      accessor: 'gross_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono',
      render: (row) => formatWeight(row.gross_weight_g, false)
    },
    {
      header: 'Stone (g)',
      accessor: 'stone_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono text-slate-400',
      render: (row) => formatWeight(row.stone_weight_g, false)
    },
    {
      header: 'Net Gold (g)',
      accessor: 'net_weight_g',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold text-slate-900',
      render: (row) => formatWeight(row.net_weight_g, false)
    },
    {
      header: 'Kerala Pavan',
      accessor: 'pavan',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold text-gold-800',
      render: (row) => formatPavan(row.net_weight_g / 8, false)
    },
    {
      header: 'VA %',
      accessor: 'va_percent',
      className: 'text-right',
      cellClassName: 'text-right font-mono',
      render: (row) => `${row.va_percent}%`
    },
    {
      header: 'Live Price (Approx)',
      accessor: 'id',
      className: 'text-right',
      cellClassName: 'text-right font-mono font-bold text-slate-900',
      render: (row) => {
        const pricing = calculateItemPricing(row, rates);
        return formatINR(pricing.item_total);
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge>{row.status}</Badge>
    },
    {
      header: 'Tag Sticker',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => setTagModalItem(row)}
          className="p-1.5 bg-slate-100 hover:bg-gold-100 text-slate-700 hover:text-gold-900 rounded-lg transition"
          title="Print Jewellery Tag Sticker"
        >
          <Printer className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Stock & HUID Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mandatory BIS Hallmarked stock register • 6-character HUID audit tracking
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-royal-900 hover:bg-royal-800 text-white font-bold rounded-lg text-xs shadow transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Add New Jewellery Piece</span>
        </button>
      </div>

      {/* Universal Data Table */}
      <DataTable
        columns={columns}
        data={items}
        searchPlaceholder="Search by HUID, barcode, ornament name..."
        emptyMessage="No jewellery items found."
        itemsPerPage={8}
      />

      {/* ======================================================== */}
      {/* ADD NEW ORNAMENT MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Jewellery Ornament Tag"
        subtitle="Registers new stock item with HUID, purity, weights, and tray allocation."
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Ornament Title</label>
              <input
                type="text"
                placeholder="e.g. Traditional Palakka Mala 4 Sovereign"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-gold-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-gold-500 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.malayalam_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Purity Standard</label>
              <select
                value={formData.purity_karat}
                onChange={(e) => setFormData({ ...formData, purity_karat: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-gold-500 bg-white font-bold"
              >
                <option value="22K">22K (916 Hallmarked)</option>
                <option value="24K">24K (999 Pure Bullion)</option>
                <option value="18K">18K (750 Diamond)</option>
                <option value="SILVER">Silver (925/999)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Gross Weight (Grams)</label>
              <input
                type="number"
                step="0.001"
                placeholder="0.000"
                value={formData.gross_weight_g}
                onChange={(e) => setFormData({ ...formData, gross_weight_g: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Stone Weight (Grams)</label>
              <input
                type="number"
                step="0.001"
                value={formData.stone_weight_g}
                onChange={(e) => setFormData({ ...formData, stone_weight_g: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
              />
            </div>

            {/* Calculated Net Gold Weight */}
            <div className="col-span-2 p-3 bg-gold-50 rounded-lg border border-gold-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-700">Calculated Net Gold:</span>
                <span className="ml-2 font-mono font-black text-slate-900 text-sm">{formatWeight(formNetWeight)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Kerala Pavan:</span>
                <span className="ml-2 font-mono font-black text-gold-900 text-sm">{formatPavan(formNetWeight / 8)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">VA % (Wastage)</label>
              <input
                type="number"
                step="0.1"
                value={formData.va_percent}
                onChange={(e) => setFormData({ ...formData, va_percent: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">BIS HUID (6-Character)</label>
              <input
                type="text"
                maxLength={6}
                placeholder="Leave blank for auto-HUID"
                value={formData.huid}
                onChange={(e) => setFormData({ ...formData, huid: e.target.value.toUpperCase() })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold uppercase"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Counter / Tray Location</label>
              <input
                type="text"
                value={formData.counter_tray}
                onChange={(e) => setFormData({ ...formData, counter_tray: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-royal-950 font-bold rounded-lg text-xs shadow"
            >
              Save Tag & Print Barcode
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* BARCODE & RFID STICKER TAG PREVIEW MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(tagModalItem)}
        onClose={() => setTagModalItem(null)}
        title="Jewellery Barcode Tag Sticker"
        subtitle="Standard dumb-bell thermal sticker format for jewellery trays."
        maxWidth="max-w-md"
      >
        {tagModalItem && (
          <div className="space-y-4">
            <div className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-xl max-w-[280px] mx-auto text-center font-mono">
              <div className="font-serif-luxury font-black text-xs tracking-wider text-slate-900 border-b pb-1">
                SWARNA JEWELLERY
              </div>
              <div className="text-[10px] font-bold text-slate-800 mt-1">{tagModalItem.item_name}</div>
              
              {/* Barcode Mock Pattern */}
              <div className="my-2 bg-slate-900 text-white py-2 px-1 rounded flex justify-center tracking-widest text-xs font-mono font-black">
                |||| | ||||| || ||| |
              </div>
              <div className="text-[9px] text-slate-500">{tagModalItem.barcode}</div>

              <div className="grid grid-cols-2 gap-1 text-[10px] mt-2 pt-2 border-t border-slate-200 text-left font-bold">
                <div>HUID: <span className="text-gold-800 font-black">{tagModalItem.huid}</span></div>
                <div>PURITY: {tagModalItem.purity_karat}</div>
                <div>GROSS: {formatWeight(tagModalItem.gross_weight_g)}</div>
                <div>NET: {formatWeight(tagModalItem.net_weight_g)}</div>
                <div className="col-span-2 text-center text-gold-900 font-black text-[11px] mt-0.5">
                  PAVAN: {formatPavan(tagModalItem.net_weight_g / 8)}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-royal-900 text-white rounded-lg text-xs font-bold shadow"
              >
                <Printer className="w-4 h-4 text-gold-400" />
                <span>Print Sticker</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default InventoryManager;

