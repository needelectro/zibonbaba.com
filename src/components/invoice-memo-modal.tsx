'use client';

import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Receipt,
  Download,
  Building2,
  Phone,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface InvoiceItem {
  id?: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface InvoiceOrder {
  id: string;
  date?: string;
  createdAt?: string;
  customerName?: string;
  customerPhone?: string;
  altPhone?: string;
  address?: string;
  district?: string;
  upazila?: string;
  total: number;
  subTotal?: number;
  tax?: number;
  discount?: number;
  deliveryFee?: number;
  codAmount?: number;
  status: string;
  source?: string;
  paymentMethod?: string;
  storeName?: string;
  specialInstructions?: string;
  hub?: {
    id?: string;
    name?: string;
    code?: string;
    address?: string;
    contactNumber?: string;
  } | null;
  items?: InvoiceItem[];
  itemsSummary?: string;
  itemsCount?: number;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  riderName?: string;
  riderPhone?: string;
}

interface InvoiceMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: InvoiceOrder[] | InvoiceOrder | null;
  defaultFormat?: 'A4' | 'POS';
  title?: string;
}

// Convert numbers to English words (Bangla Currency format)
function numberToWordsBD(num: number): string {
  if (isNaN(num) || num <= 0) return 'Zero Taka Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertNumber(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertNumber(n % 100) : '');
    if (n < 100000) return convertNumber(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertNumber(n % 1000) : '');
    if (n < 10000000) return convertNumber(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertNumber(n % 100000) : '');
    return convertNumber(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convertNumber(n % 10000000) : '');
  }

  const rounded = Math.round(num);
  return `${convertNumber(rounded)} Taka Only`;
}

// Clean pseudo-barcode SVG generator
function BarcodeSvg({ value }: { value: string }) {
  const bars: { width: number; space: number }[] = [];
  const cleanVal = (value || '000000').toUpperCase().replace(/[^A-Z0-9]/g, '');
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    bars.push({
      width: (code % 3) + 1.5,
      space: ((code >> 1) % 2) + 1.2
    });
  }

  return (
    <div className="flex flex-col items-center">
      <svg height="38" className="w-full max-w-[200px]" viewBox="0 0 160 38">
        <rect width="160" height="38" fill="white" />
        <g fill="#111827">
          {bars.map((b, idx) => {
            const x = 10 + idx * 8;
            return <rect key={idx} x={x} y="2" width={b.width} height="32" rx="0.5" />;
          })}
        </g>
      </svg>
      <span className="font-mono text-[9px] tracking-widest text-slate-800 font-bold uppercase mt-0.5">
        *{cleanVal}*
      </span>
    </div>
  );
}

// Visual QR Code SVG Box
function QrCodeSvg({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded shadow-xs">
      <div className="relative w-14 h-14 bg-slate-900 rounded p-1 flex items-center justify-center">
        <div className="w-full h-full border border-white flex flex-wrap p-0.5 justify-between content-between">
          <div className="w-3.5 h-3.5 border-2 border-white bg-slate-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white" />
          </div>
          <div className="w-3.5 h-3.5 border-2 border-white bg-slate-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white" />
          </div>
          <div className="w-3.5 h-3.5 border-2 border-white bg-slate-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white" />
          </div>
          <div className="w-2.5 h-2.5 bg-white" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[7px] font-black text-amber-400 bg-slate-900 px-0.5 rounded">ZB</span>
        </div>
      </div>
      <span className="text-[7.5px] font-mono text-slate-600 font-bold mt-1">SCAN VERIFY</span>
    </div>
  );
}

export default function InvoiceMemoModal({
  isOpen,
  onClose,
  orders,
  defaultFormat = 'A4',
  title = 'Cash Memo & Invoice Printing System'
}: InvoiceMemoModalProps) {
  const [printFormat, setPrintFormat] = useState<'A4' | 'POS'>(defaultFormat);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [printAllBatch, setPrintAllBatch] = useState(true);

  if (!isOpen || !orders) return null;

  const orderList: InvoiceOrder[] = Array.isArray(orders) ? orders : [orders];
  if (orderList.length === 0) return null;

  const activeOrder = orderList[currentIndex] || orderList[0];

  const handlePrint = () => {
    window.print();
  };

  // Helper to normalize items from diverse order structures
  const normalizeItems = (ord: InvoiceOrder): InvoiceItem[] => {
    if (ord.items && ord.items.length > 0) {
      return ord.items.map((it: any) => ({
        id: it.id,
        name: it.name || it.product?.name || it.title || 'Product Item',
        sku: it.sku || it.variant?.sku || it.product?.sku || 'SKU-STD',
        quantity: Number(it.quantity || it.qty || 1),
        price: Number(it.price || it.product?.price || 0),
        total: Number(it.price || it.product?.price || 0) * Number(it.quantity || it.qty || 1)
      }));
    }
    // Fallback if items array wasn't provided directly
    return [
      {
        name: ord.itemsSummary || 'Standard Order Package Items',
        sku: 'PKG-DIRECT',
        quantity: ord.itemsCount || 1,
        price: ord.total || 0,
        total: ord.total || 0
      }
    ];
  };

  return (
    <>
      {/* SCOPED PRINT STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 8mm;
          }
          /* Hide everything on the page except the printable memo container */
          body * {
            visibility: hidden !important;
          }
          #zibonbaba-printable-container,
          #zibonbaba-printable-container * {
            visibility: visible !important;
          }
          #zibonbaba-printable-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            display: block !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
          .memo-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      {/* MODAL DIALOG OVERLAY */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in no-print">
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden">
          
          {/* Top Control Bar */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                  {title}
                  {orderList.length > 1 && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
                      {orderList.length} Invoices Loaded
                    </span>
                  )}
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  Ready for high-resolution desktop printing, PDF export, or thermal POS memo slip.
                </p>
              </div>
            </div>

            {/* Actions & Format switch */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Format Toggle */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setPrintFormat('A4')}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    printFormat === 'A4'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> A4 Invoice
                </button>
                <button
                  onClick={() => setPrintFormat('POS')}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    printFormat === 'POS'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" /> 80mm POS Slip
                </button>
              </div>

              {/* Multi-Order Navigation if viewing single */}
              {orderList.length > 1 && (
                <div className="flex items-center bg-white/5 rounded-xl border border-white/10 px-2 py-1 text-xs text-slate-300 gap-1.5">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    className="p-1 hover:bg-white/10 disabled:opacity-30 rounded cursor-pointer"
                    title="Previous Memo"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] font-bold px-1">
                    {currentIndex + 1} / {orderList.length}
                  </span>
                  <button
                    disabled={currentIndex >= orderList.length - 1}
                    onClick={() => setCurrentIndex(prev => Math.min(orderList.length - 1, prev + 1))}
                    className="p-1 hover:bg-white/10 disabled:opacity-30 rounded cursor-pointer"
                    title="Next Memo"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print {orderList.length > 1 && printAllBatch ? `All (${orderList.length})` : 'Invoice'}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Multi-order batch print checkbox */}
          {orderList.length > 1 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 flex items-center justify-between text-xs text-amber-300">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={printAllBatch}
                  onChange={(e) => setPrintAllBatch(e.target.checked)}
                  className="rounded border-amber-400 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
                <span>Batch Printing: Print all {orderList.length} invoices sequentially with automatic page breaks</span>
              </label>
              <span className="text-[11px] opacity-80">
                Viewing memo for: <strong className="font-mono text-white">{activeOrder.id}</strong>
              </span>
            </div>
          )}

          {/* Modal Preview Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/70 flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full transition-all flex justify-center p-3 sm:p-6">
              {printFormat === 'A4' ? (
                <div className="w-full max-w-[800px] text-slate-900 font-sans">
                  <A4InvoiceLayout order={activeOrder} items={normalizeItems(activeOrder)} />
                </div>
              ) : (
                <div className="w-[340px] text-slate-900 font-sans">
                  <PosSlipLayout order={activeOrder} items={normalizeItems(activeOrder)} />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> Ready for Paper / Thermal Print
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-400">
                Hub Dispatch & Logistics Standard Compliant
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* HIDDEN PRINTABLE CONTAINER FOR BROWSER PRINT TRIGGER */}
      <div id="zibonbaba-printable-container" className="hidden">
        {(orderList.length > 1 && printAllBatch ? orderList : [activeOrder]).map((ord, idx, arr) => {
          const items = normalizeItems(ord);
          const isLast = idx === arr.length - 1;
          return (
            <div
              key={ord.id || idx}
              className={`p-4 bg-white text-slate-900 ${!isLast ? 'memo-page-break' : ''}`}
              style={{ minHeight: printFormat === 'A4' ? '280mm' : 'auto' }}
            >
              {printFormat === 'A4' ? (
                <A4InvoiceLayout order={ord} items={items} />
              ) : (
                <div className="max-w-[340px] mx-auto">
                  <PosSlipLayout order={ord} items={items} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// =========================================================================
// 1. A4 STANDARD CORPORATE CASH MEMO & INVOICE LAYOUT
// =========================================================================
function A4InvoiceLayout({ order, items }: { order: InvoiceOrder; items: InvoiceItem[] }) {
  const customerName = order.customerName || order.customer?.name || 'Valued Customer';
  const customerPhone = order.customerPhone || order.customer?.phone || 'N/A';
  const fullAddress = order.address || 'Standard Delivery Address, Bangladesh';
  const district = order.district || 'Dhaka';
  const upazila = order.upazila ? `${order.upazila}, ` : '';

  const hubName = order.hub?.name || 'Central Delivery Hub';
  const hubCode = order.hub?.code || 'HUB-DHK-01';
  const hubAddress = order.hub?.address || 'Tejgaon Industrial Area, Dhaka, Bangladesh';
  const hubContact = order.hub?.contactNumber || '+880 1700-000000';

  const orderDate = order.date || order.createdAt ? new Date(order.date || order.createdAt!).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-GB');

  const printTimestamp = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subTotal = order.subTotal ?? items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const deliveryFee = order.deliveryFee ?? 120;
  const discount = order.discount ?? 0;
  const tax = order.tax ?? 0;
  const grandTotal = order.total || (subTotal + deliveryFee + tax - discount);
  const codPayable = order.codAmount !== undefined ? order.codAmount : grandTotal;

  const isPaid = order.status === 'DELIVERED' || order.paymentMethod === 'ONLINE' || order.paymentMethod === 'CARD' || order.paymentMethod === 'BKASH';
  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="bg-white text-slate-900 text-xs font-sans leading-normal border border-slate-200 rounded-xl p-6 sm:p-8">
      {/* 1. HEADER & BRANDING */}
      <div className="border-b-2 border-slate-900 pb-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
              Z
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-950 block uppercase">
                ZIBONBABA<span className="text-amber-500">.COM</span>
              </span>
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block">
                Daraz-Style Multi-Vendor E-Commerce & Logistics BD
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 space-y-0.5 pt-1">
            <p className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Corporate HQ: House #12, Road #04, Sector #03, Uttara, Dhaka-1230</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> Hotline: +880 9610-000000
              </span>
              <span>•</span>
              <span>BIN: 004829104-0101</span>
              <span>•</span>
              <span>Trade Lic: TRAD/DNCC/019283</span>
            </p>
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="sm:text-right shrink-0">
          <div className="inline-block bg-slate-900 text-white font-black text-sm px-4 py-1 rounded-md uppercase tracking-wider mb-2">
            CASH MEMO / INVOICE
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-800 space-y-0.5">
            <p>Invoice No: <span className="text-slate-950 font-extrabold">{invoiceNumber}</span></p>
            <p>Order ID: <span className="text-slate-600 font-normal">{order.id}</span></p>
            <p>Date: <span className="font-normal">{orderDate}</span></p>
            <p className="text-[10px] text-slate-500">Printed: {printTimestamp}</p>
          </div>
        </div>
      </div>

      {/* 2. LOGISTICS STATUS BANNER */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment Status:</span>
          <span className={`text-[10.5px] font-black px-2.5 py-0.5 rounded border uppercase ${
            isPaid
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            {isPaid ? 'PAID / SETTLED' : 'CASH ON DELIVERY (COD)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Channel / Node:</span>
          <span className="text-[11px] font-bold text-slate-800 uppercase bg-white border border-slate-200 px-2 py-0.5 rounded">
            {order.source || 'ONLINE MARKETPLACE'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Status:</span>
          <span className="text-[11px] font-bold text-slate-800 uppercase font-mono">
            {order.status}
          </span>
        </div>
      </div>

      {/* 3. CUSTOMER & LOGISTICS DETAILS (2 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Customer / Bill To */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 space-y-1">
          <span className="text-[9.5px] font-black uppercase text-amber-600 tracking-wider block border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Customer Details (গ্রাহকের তথ্য)
          </span>
          <p className="font-extrabold text-sm text-slate-900">{customerName}</p>
          <p className="font-mono text-xs font-bold text-slate-800">Phone: {customerPhone}</p>
          {order.altPhone && (
            <p className="font-mono text-[11px] text-slate-600">Alt Phone: {order.altPhone}</p>
          )}
          <p className="text-[11px] text-slate-700 leading-snug pt-1">
            <strong className="text-slate-800">Delivery Address: </strong>
            {fullAddress}, {upazila}{district}, Bangladesh
          </p>
        </div>

        {/* Dispatch Hub & Seller Info */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 space-y-1">
          <span className="text-[9.5px] font-black uppercase text-amber-600 tracking-wider block border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Dispatch Hub & Merchant (ডেলিভারি হাব ও মার্চেন্ট)
          </span>
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-900">{hubName}</p>
            <span className="font-mono text-[9px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
              {hubCode}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">Address: {hubAddress}</p>
          <p className="text-[11px] text-slate-600">Hub Contact: {hubContact}</p>
          <div className="pt-1 border-t border-slate-200/80 mt-1 flex justify-between items-center text-[10.5px]">
            <span className="text-slate-500 font-bold">Merchant / Store:</span>
            <span className="font-extrabold text-slate-800">{order.storeName || 'Zibonbaba Direct'}</span>
          </div>
        </div>
      </div>

      {/* 4. ITEMS TABLE */}
      <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-[10.5px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">SL</th>
              <th className="py-2.5 px-3">Item Description (পণ্যের বিবরণ)</th>
              <th className="py-2.5 px-3 w-28">SKU / Code</th>
              <th className="py-2.5 px-3 w-20 text-right">Price (৳)</th>
              <th className="py-2.5 px-3 w-16 text-center">Qty</th>
              <th className="py-2.5 px-3 w-24 text-right">Total (৳)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
            {items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                  {String(idx + 1).padStart(2, '0')}
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  {item.name}
                </td>
                <td className="py-2.5 px-3 font-mono text-[10.5px] text-slate-600">
                  {item.sku || 'SKU-STD'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  ৳{item.price.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-center font-bold">
                  {item.quantity}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-950 font-mono">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. FINANCIAL BREAKDOWN & BARCODE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start mb-6">
        
        {/* Left Col: Amount in Words, Special Notes & Barcode */}
        <div className="md:col-span-7 space-y-3">
          {/* Amount in words */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              In Words (কথায়):
            </span>
            <p className="font-bold text-slate-900 italic text-xs">
              {numberToWordsBD(grandTotal)}
            </p>
          </div>

          {/* Special Instructions if any */}
          {order.specialInstructions && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900">
              <strong className="block font-bold uppercase text-[9px] tracking-wider mb-0.5">
                Special Delivery Instructions:
              </strong>
              {order.specialInstructions}
            </div>
          )}

          {/* Barcode & QR Verification */}
          <div className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4 bg-white">
            <BarcodeSvg value={order.id} />
            <div className="border-l border-slate-200 pl-4">
              <QrCodeSvg value={`https://zibonbaba.com/tracking?orderId=${order.id}`} />
            </div>
          </div>
        </div>

        {/* Right Col: Calculation Totals Box */}
        <div className="md:col-span-5 bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal (মোট মূল্য):</span>
            <span className="font-mono text-slate-900">৳{subTotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-slate-600 font-medium">
            <span>Delivery Fee (ডেলিভারি চার্জ):</span>
            <span className="font-mono text-slate-900">৳{deliveryFee.toLocaleString()}</span>
          </div>

          {tax > 0 && (
            <div className="flex justify-between text-slate-600 font-medium">
              <span>VAT / Tax (ভ্যাট):</span>
              <span className="font-mono text-slate-900">৳{tax.toLocaleString()}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount / Promo (ছাড়):</span>
              <span className="font-mono">-৳{discount.toLocaleString()}</span>
            </div>
          )}

          <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm font-extrabold text-slate-950">
            <span>Net Payable (সর্বমোট):</span>
            <span className="text-base font-black font-mono text-slate-950">
              ৳{grandTotal.toLocaleString()}
            </span>
          </div>

          {/* COD Collect Highlight Box */}
          <div className="mt-2 bg-amber-400 text-slate-950 p-2.5 rounded-lg border border-amber-500 font-black text-center shadow-xs">
            <span className="text-[9px] uppercase tracking-wider block text-slate-900">
              Cash to Collect (COD সংগ্রহযোগ্য):
            </span>
            <span className="text-lg font-mono">
              ৳{codPayable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 6. RETURN POLICY & TERMS */}
      <div className="border-t border-slate-200 pt-3 mb-6 text-[10px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-700 uppercase tracking-wide">Customer Instructions & Return Policy:</p>
        <p>1. অনুগ্রহ করে ডেলিভারি রাইডারের উপস্থিতিতে পার্সেল চেক করে গ্রহণ করুন।</p>
        <p>2. পণ্য বা সার্ভিসের যেকোনো ত্রুটিতে পণ্য পাওয়ার ৭ দিনের মধ্যে আমাদের কাস্টমার সাপোর্টে (+880 9610-000000) যোগাযোগ করুন।</p>
        <p>3. যেকোনো ওয়ারেন্টি ও রিটার্ন দাবির জন্য এই ক্যাশ মেমোটি প্রমাণ হিসেবে সংরক্ষণ করুন।</p>
      </div>

      {/* 7. SIGNATURE BLOCKS */}
      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-dashed border-slate-300 text-center text-[10.5px] font-bold text-slate-700">
        <div>
          <div className="border-b border-slate-400 h-8 mb-1.5" />
          <span>Prepared By (Hub Staff)</span>
        </div>
        <div>
          <div className="border-b border-slate-400 h-8 mb-1.5" />
          <span>Delivery Hero / Rider</span>
        </div>
        <div>
          <div className="border-b border-slate-400 h-8 mb-1.5" />
          <span>Customer Signature & Date</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. 80MM POS THERMAL COMPACT SLIP LAYOUT (POCKET / THERMAL PRINTER)
// =========================================================================
function PosSlipLayout({ order, items }: { order: InvoiceOrder; items: InvoiceItem[] }) {
  const customerName = order.customerName || order.customer?.name || 'Customer';
  const customerPhone = order.customerPhone || order.customer?.phone || 'N/A';
  const fullAddress = order.address || 'Bangladesh';
  const district = order.district || 'Dhaka';

  const subTotal = order.subTotal ?? items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const deliveryFee = order.deliveryFee ?? 120;
  const discount = order.discount ?? 0;
  const grandTotal = order.total || (subTotal + deliveryFee - discount);
  const codPayable = order.codAmount !== undefined ? order.codAmount : grandTotal;

  const orderDate = order.date || order.createdAt ? new Date(order.date || order.createdAt!).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

  return (
    <div className="bg-white text-slate-900 font-mono text-[11px] leading-tight p-4 border border-dashed border-slate-300 rounded shadow-xs max-w-[320px] mx-auto">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
        <h2 className="text-base font-black tracking-tight uppercase">ZIBONBABA.COM</h2>
        <p className="text-[10px] text-slate-600">Multi-Vendor E-Commerce & Logistics</p>
        <p className="text-[9.5px]">Hotline: +880 9610-000000</p>
        <div className="font-bold border border-slate-800 inline-block px-2 py-0.5 mt-1 text-[10px] uppercase">
          *** CASH MEMO ***
        </div>
      </div>

      {/* Meta */}
      <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[10px]">
        <p>Order Ref: <strong>{order.id.slice(0, 12).toUpperCase()}</strong></p>
        <p>Date: {orderDate}</p>
        <p>Hub: {order.hub?.name || 'Dhaka Central Hub'}</p>
        <p>Store: {order.storeName || 'Zibonbaba Store'}</p>
      </div>

      {/* Customer Info */}
      <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[10.5px]">
        <p className="font-black text-slate-950 uppercase">{customerName}</p>
        <p className="font-bold">Phone: {customerPhone}</p>
        <p className="text-[10px] leading-tight text-slate-800">{fullAddress}, {district}</p>
      </div>

      {/* Items list */}
      <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
        <div className="flex justify-between font-bold text-[10px] uppercase border-b border-slate-300 pb-1">
          <span>Item</span>
          <span>Qty x Price</span>
          <span>Total</span>
        </div>
        {items.map((it, idx) => (
          <div key={idx} className="space-y-0.5 py-0.5">
            <div className="font-medium truncate text-slate-900">{it.name}</div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span className="font-mono">{it.sku || 'SKU'}</span>
              <span>{it.quantity} x ৳{it.price}</span>
              <strong className="text-slate-900">৳{it.price * it.quantity}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Financials */}
      <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10.5px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>৳{subTotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Charge:</span>
          <span>৳{deliveryFee}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount:</span>
            <span>-৳{discount}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-xs border-t border-slate-300 pt-1">
          <span>Total:</span>
          <span>৳{grandTotal}</span>
        </div>
      </div>

      {/* COD Highlight */}
      <div className="my-2.5 p-2 bg-slate-100 border border-slate-800 text-center">
        <span className="text-[9px] uppercase font-bold block text-slate-700">COLLECT CASH ON DELIVERY:</span>
        <span className="text-sm font-black text-slate-950">৳{codPayable.toLocaleString()}</span>
      </div>

      {/* Barcode */}
      <div className="py-2 text-center flex flex-col items-center">
        <BarcodeSvg value={order.id} />
      </div>

      {/* Footer */}
      <div className="text-center pt-1 border-t border-dashed border-slate-400 text-[9px] text-slate-600 space-y-0.5">
        <p>Please check parcel before receiving.</p>
        <p>7-day replacement warranty with cash memo.</p>
        <p className="font-bold text-slate-800 mt-1">Thank you for shopping at Zibonbaba!</p>
      </div>
    </div>
  );
}
