import React, { useState } from 'react';
import { formatINR, formatWeight, formatPavan, formatDate, formatTime } from '../../utils/formatters';
import { Printer, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export function ReceiptInvoice({ invoice, onClose, isEstimate: propIsEstimate }) {
  const [format, setFormat] = useState('a4'); // 'a4' or 'thermal'

  if (!invoice) return null;

  const isEstimate = Boolean(
    propIsEstimate || 
    invoice.isEstimate || 
    invoice.invoice_no?.startsWith('EST') ||
    invoice.status === 'ESTIMATE'
  );

  const handlePrint = () => {
    window.print();
  };

  const docNumberLabel = isEstimate ? 'Estimate No' : 'Invoice No';
  const docBadgeTitle = isEstimate ? 'ESTIMATE / PROFORMA INVOICE' : 'TAX INVOICE';
  const docBadgeMalayalam = isEstimate ? 'എസ്റ്റിമേറ്റ് / പ്രൊഫോർമ' : 'ടാക്സ് ഇൻവോയ്സ്';

  return (
    <div className="space-y-4">
      {/* Print Controls Bar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Print Format:</span>
          <button
            type="button"
            onClick={() => setFormat('a4')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              format === 'a4' 
                ? 'bg-gold-500 text-royal-950 shadow-sm' 
                : 'bg-white text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            Luxury A4 {isEstimate ? 'Estimate' : 'Tax Invoice'}
          </button>
          <button
            type="button"
            onClick={() => setFormat('thermal')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              format === 'thermal' 
                ? 'bg-gold-500 text-royal-950 shadow-sm' 
                : 'bg-white text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            3-inch Thermal Roll
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isEstimate && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Estimate Mode (Non-GST)</span>
            </span>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-royal-900 text-white rounded-lg text-xs font-bold hover:bg-royal-800 shadow transition"
          >
            <Printer className="w-3.5 h-3.5 text-gold-400" />
            <span>Print Document</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. LUXURY A4 SHOWROOM DOCUMENT (TAX INVOICE OR ESTIMATE) */}
      {/* ======================================================== */}
      {format === 'a4' && (
        <div className="print-container bg-white p-8 md:p-10 rounded-xl border border-slate-300 shadow-sm max-w-4xl mx-auto text-slate-900 text-xs">
          
          {/* ESTIMATE WATERMARK BANNER (If Estimate / Proforma) */}
          {isEstimate && (
            <div className="mb-4 p-2.5 bg-amber-50 border-2 border-dashed border-amber-400 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 font-black text-amber-900 text-xs tracking-wider uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ESTIMATE / PROFORMA QUOTATION ONLY — THIS IS NOT A GST TAX INVOICE</span>
              </div>
              <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                സാധാരണ എസ്റ്റിമേറ്റ് വിവരണം മാത്രം — ഇത് ജി എസ് ടി ടാക്സ് ഇൻവോയ്സ് അല്ല
              </p>
            </div>
          )}

          {/* Showroom Header */}
          <div className="border-b-2 border-gold-500/60 pb-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold-500 text-royal-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-sm">
                  👑
                </div>
                <div>
                  <h1 className="font-serif-luxury text-2xl font-black text-slate-900 tracking-wider leading-none">
                    SWARNA JEWELLERY
                  </h1>
                  <p className="text-xs font-semibold text-gold-700 mt-0.5">
                    സ്വർണ്ണ ജ്വല്ലറി • MG Road, Kochi, Kerala - 682016
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                <p>
                  {!isEstimate ? (
                    <>
                      GSTIN: <span className="font-mono font-bold text-slate-900">32AABCS1429B1Z8</span> | State Code: 32 (Kerala)
                    </>
                  ) : (
                    <>
                      Showroom Reg: <span className="font-mono font-semibold">KL-EKM-2024</span> | State: Kerala (32)
                    </>
                  )}
                </p>
                <p>Phone: +91 484 2356789, +91 98470 12345 | Web: www.swarnakerala.com</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className={`inline-block px-3 py-1 rounded text-xs font-black tracking-wider uppercase border ${
                isEstimate 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-gold-100 text-gold-900 border-gold-300'
              }`}>
                {docBadgeTitle} / {docBadgeMalayalam}
              </span>
              <div className="text-sm font-bold font-mono text-slate-900 pt-1">
                {docNumberLabel}: <span className="font-black">{invoice.invoice_no}</span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Date: {formatDate(invoice.created_at || new Date())} {formatTime(invoice.created_at || new Date())}
              </div>
              <div className="text-[11px] font-semibold text-gold-800">
                22K Rate Applied: {formatINR(invoice.rate_22k_applied)} /g
              </div>
            </div>
          </div>

          {/* Customer & Certification Grid */}
          <div className="grid grid-cols-2 gap-4 my-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                {isEstimate ? 'Quotation For (ഉപഭോക്താവ്):' : 'Billed To (ഉപഭോക്താവ്):'}
              </p>
              <p className="text-sm font-bold text-slate-900">{invoice.customer_name || 'Walk-in Customer'}</p>
              <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                Phone: {invoice.customer_phone || 'N/A'}
              </p>
              <p className="text-slate-600 text-[11px]">{invoice.customer_address || 'Kerala, India'}</p>
              {invoice.customer_pan && (
                <p className="text-slate-800 font-mono text-[11px] mt-1 font-bold">
                  PAN: {invoice.customer_pan}
                </p>
              )}
            </div>

            <div className="border-l border-slate-200 pl-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-gold-800 font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs">BIS 916 HALLMARK COMPLIANT</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                {isEstimate 
                  ? 'All gold items quoted carry standard 6-digit Hallmark Unique Identification (HUID) upon final delivery.' 
                  : 'Every gold ornament listed is verified by authorized BIS assaying centers with a unique 6-character HUID tag.'}
              </p>
            </div>
          </div>

          {/* Precise Itemized Table */}
          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-slate-200 border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-200 text-center w-8">#</th>
                  <th className="p-2 border-r border-slate-200">Ornament Description / HUID</th>
                  <th className="p-2 border-r border-slate-200 text-center w-14">Purity</th>
                  <th className="p-2 border-r border-slate-200 text-right w-20">Gross (g)</th>
                  <th className="p-2 border-r border-slate-200 text-right w-16">Stone (g)</th>
                  <th className="p-2 border-r border-slate-200 text-right w-20">Net (g)</th>
                  <th className="p-2 border-r border-slate-200 text-right w-20">Pavan</th>
                  <th className="p-2 border-r border-slate-200 text-right w-20">Rate/g</th>
                  <th className="p-2 border-r border-slate-200 text-right w-14">VA %</th>
                  <th className="p-2 text-right w-24">Taxable (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2 border-r border-slate-200 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{item.item_name}</div>
                      <div className="text-[10px] font-mono text-gold-700 font-bold">
                        HUID: {item.huid} • HSN: 7113
                      </div>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-gold-800">
                      {item.purity_karat || '22K'}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono">
                      {formatWeight(item.gross_weight_g, false)}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-400">
                      {formatWeight(item.stone_weight_g, false)}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatWeight(item.net_weight_g, false)}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-gold-800">
                      {formatPavan(item.pavan, false)}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono">
                      {formatINR(item.rate_per_g).replace('₹', '')}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono">
                      {item.va_percent}%
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      {formatINR(item.taxable_value).replace('₹', '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation & Summary Section */}
          <div className="grid grid-cols-2 gap-4 my-3 print-break-inside-avoid">
            {/* Terms / Payment Notes */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-1.5">
                  {isEstimate ? 'Estimation Terms & Validity:' : 'Payment & Settlement Details:'}
                </p>
                {isEstimate ? (
                  <div className="text-[10px] text-slate-600 space-y-1 leading-relaxed">
                    <p>• This estimate is valid only for today based on the prevailing gold board rate.</p>
                    <p>• Wastage (VA%) and making charges are calculated according to traditional Kerala craft benchmarks.</p>
                    <p>• Final Tax Invoice with statutory GST (3%) will be generated upon confirmation and order billing.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {invoice.payment_modes && Object.entries(invoice.payment_modes).map(([mode, amt]) => (
                      amt > 0 && (
                        <div key={mode} className="flex justify-between text-[11px]">
                          <span className="capitalize text-slate-600">{mode}:</span>
                          <span className="font-bold font-mono text-slate-800">{formatINR(amt)}</span>
                        </div>
                      )
                    ))}
                    <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-normal">
                      <p>• 100% buyback guarantee on net gold weight at prevailing market rate.</p>
                      <p>• Exchange allowed within 7 days against original tax invoice.</p>
                      <p>• Subject to Ernakulam jurisdiction.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-3.5 bg-gold-50/50 rounded-xl border border-gold-200 text-xs space-y-1.5">
              <div className="flex justify-between py-0.5 text-slate-600">
                <span>Total Gross Weight:</span>
                <span className="font-mono font-bold">{formatWeight(invoice.total_gross_weight_g)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-slate-600">
                <span>Total Net Gold Weight:</span>
                <span className="font-mono font-bold text-gold-900">
                  {formatWeight(invoice.total_net_weight_g)} ({formatPavan(invoice.total_pavan)})
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-700 border-t border-gold-200 font-semibold">
                <span>Taxable Amount (Total Value):</span>
                <span className="font-mono font-bold">{formatINR(invoice.taxable_amount)}</span>
              </div>

              {!isEstimate ? (
                <>
                  <div className="flex justify-between py-0.5 text-slate-600">
                    <span>CGST (1.5%):</span>
                    <span className="font-mono">{formatINR(invoice.cgst_amount)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-slate-600">
                    <span>SGST (1.5% - Kerala):</span>
                    <span className="font-mono">{formatINR(invoice.sgst_amount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-0.5 text-amber-800 font-medium">
                  <span>Estimated GST (3% Indicative):</span>
                  <span className="font-mono">{formatINR((invoice.cgst_amount || 0) + (invoice.sgst_amount || 0))}</span>
                </div>
              )}

              {invoice.old_gold_deduction > 0 && (
                <div className="flex justify-between py-1 text-amber-800 font-semibold border-t border-gold-200">
                  <span>Less: Old Gold Trade-In Credit:</span>
                  <span className="font-mono">- {formatINR(invoice.old_gold_deduction)}</span>
                </div>
              )}

              {invoice.chit_scheme_deduction > 0 && (
                <div className="flex justify-between py-1 text-purple-800 font-semibold">
                  <span>Less: Swarna Nidhi Chit Credit:</span>
                  <span className="font-mono">- {formatINR(invoice.chit_scheme_deduction)}</span>
                </div>
              )}

              {invoice.round_off !== 0 && (
                <div className="flex justify-between py-0.5 text-slate-500 text-[10px]">
                  <span>Round Off:</span>
                  <span className="font-mono">{invoice.round_off > 0 ? `+${invoice.round_off}` : invoice.round_off}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t-2 border-gold-500 text-sm font-black text-slate-900">
                <span>{isEstimate ? 'ESTIMATED TOTAL (എസ്റ്റിമേറ്റ് തുക):' : 'NET PAYABLE (ആകെ തുക):'}</span>
                <span className="text-base text-gold-950 font-mono font-black">{formatINR(invoice.net_payable)}</span>
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-6 flex justify-between items-end text-xs text-slate-600 print-break-inside-avoid">
            <div>
              <p className="border-t border-slate-300 pt-1 w-44 text-center">Customer Acknowledgment</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">For SWARNA JEWELLERY</p>
              <p className="mt-6 border-t border-slate-300 pt-1 w-44 ml-auto text-center">
                {isEstimate ? 'Prepared By' : 'Authorized Signatory'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. THREE-INCH THERMAL POS RECEIPT */}
      {/* ======================================================== */}
      {format === 'thermal' && (
        <div className="print-container bg-white p-4 font-mono text-[11px] leading-tight max-w-[320px] mx-auto border border-slate-300 shadow-sm text-slate-900">
          <div className="text-center pb-2 border-b border-dashed border-slate-400">
            <h2 className="font-bold text-sm">SWARNA JEWELLERY</h2>
            <p className="text-[10px]">MG ROAD, KOCHI, KERALA</p>
            {!isEstimate ? (
              <>
                <p className="text-[10px]">GSTIN: 32AABCS1429B1Z8</p>
                <p className="text-[10px] mt-1 font-bold">*** TAX INVOICE ***</p>
              </>
            ) : (
              <>
                <p className="text-[10px] mt-1 font-bold text-amber-900">*** ESTIMATE / PROFORMA ***</p>
                <p className="text-[9px] font-bold">NOT A GST TAX INVOICE</p>
              </>
            )}
          </div>

          <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5">
            <div>{docNumberLabel}: {invoice.invoice_no}</div>
            <div>Date: {formatDate(invoice.created_at || new Date())} {formatTime(invoice.created_at || new Date())}</div>
            <div>Cust: {invoice.customer_name || 'Walk-in'} ({invoice.customer_phone || ''})</div>
            <div>22K Rate: {formatINR(invoice.rate_22k_applied)}/g</div>
          </div>

          <div className="py-2 border-b border-dashed border-slate-400">
            {invoice.items && invoice.items.map((item, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-bold">{item.item_name}</div>
                <div className="text-[10px] text-slate-600">HUID: {item.huid} | {item.purity_karat || '22K'}</div>
                <div className="flex justify-between">
                  <span>Gr: {formatWeight(item.gross_weight_g, false)} Nt: {formatWeight(item.net_weight_g, false)}</span>
                  <span>{formatINR(item.taxable_value)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Total Net Wt:</span>
              <span className="font-bold">{formatWeight(invoice.total_net_weight_g)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxable Value:</span>
              <span>{formatINR(invoice.taxable_amount)}</span>
            </div>
            {!isEstimate ? (
              <>
                <div className="flex justify-between">
                  <span>CGST (1.5%):</span>
                  <span>{formatINR(invoice.cgst_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (1.5%):</span>
                  <span>{formatINR(invoice.sgst_amount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-amber-900">
                <span>Est GST (3%):</span>
                <span>{formatINR((invoice.cgst_amount || 0) + (invoice.sgst_amount || 0))}</span>
              </div>
            )}
            {invoice.old_gold_deduction > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Old Gold Less:</span>
                <span>-{formatINR(invoice.old_gold_deduction)}</span>
              </div>
            )}
            {invoice.chit_scheme_deduction > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Chit Less:</span>
                <span>-{formatINR(invoice.chit_scheme_deduction)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-400">
              <span>{isEstimate ? 'EST TOTAL:' : 'NET PAYABLE:'}</span>
              <span>{formatINR(invoice.net_payable)}</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] space-y-0.5">
            <p>100% BIS 916 HALLMARKED</p>
            {isEstimate ? (
              <p className="font-bold text-[9px]">ESTIMATE ONLY • NOT A TAX BILL</p>
            ) : (
              <p>THANK YOU FOR SHOPPING WITH US!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiptInvoice;
