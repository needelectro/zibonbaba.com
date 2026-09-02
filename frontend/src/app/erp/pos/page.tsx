'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Search, Trash2, Printer, CheckCircle } from 'lucide-react';

export default function PosRegisterPage() {
  const {
    products,
    posCart,
    addToPosCart,
    removeFromPosCart,
    updatePosCartQty,
    posDiscountPercent,
    setPosDiscount,
    posPaymentMethod,
    setPosPaymentMethod,
    posCheckout,
    clearPosCart,
    crmCustomers,
  } = useStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [activeBranch, setActiveBranch] = useState('Dhanmondi Branch');
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Filter state
  const [selectedCat, setSelectedCat] = useState('All');
  const [posSearch, setPosSearch] = useState('');

  const catalogProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const matched = products.find((p) => p.sku.toUpperCase() === barcodeInput.trim().toUpperCase());
    if (matched) {
      addToPosCart(matched);
      setBarcodeInput('');
    } else {
      alert(`SKU "${barcodeInput}" not found in local database schema.`);
    }
  };

  const handlePosCheckoutSubmit = () => {
    if (posCart.length === 0) {
      alert('Cart is empty.');
      return;
    }
    const order = posCheckout(activeBranch, selectedCustomerId || undefined);
    if (order) {
      setReceiptOrder(order);
      setShowReceiptModal(true);
    }
  };

  const subtotal = posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * (posDiscountPercent / 100);
  const tax = (subtotal - discountAmount) * 0.05;
  const grandTotal = subtotal - discountAmount + tax;

  return (
    <div className="max-w-[1440px] mx-auto py-8 px-4 lg:px-8 space-y-6 animate-slide-up">
      {/* Top POS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-light pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-dark flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
            POS Terminal Register
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">High-speed retail scanning, receipt generation & local warehouse sync</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-white border border-neutral-light rounded p-2 text-xs font-bold text-neutral-dark outline-none shadow-sm"
          >
            <option value="Dhanmondi Branch">Dhanmondi Branch (Warehouse A)</option>
            <option value="Gulshan Outlet">Gulshan Outlet (Warehouse B)</option>
            <option value="Uttara Hub">Uttara Hub (Warehouse C)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Barcode Scanner & Product Catalog Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode & Search Controls */}
          <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-card grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Scan / Type SKU (e.g. ELEC-9821)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark font-mono font-bold outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-4 rounded transition-colors"
              >
                Scan
              </button>
            </form>

            <div className="flex items-center border border-neutral-light bg-neutral-light rounded p-2 text-xs">
              <Search className="w-4 h-4 text-neutral-muted mr-2" />
              <input
                type="text"
                placeholder="Search products by title..."
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                className="bg-transparent w-full outline-none text-neutral-dark"
              />
            </div>
          </div>

          {/* Quick-Pick Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
            {catalogProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToPosCart(p)}
                className="bg-white border border-neutral-light hover:border-primary hover:shadow-glow rounded-lg p-3 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-neutral-light rounded overflow-hidden mb-2">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-[11px] font-bold text-neutral-dark line-clamp-1">{p.name}</h4>
                  <p className="text-[9px] font-mono text-neutral-muted">{p.sku}</p>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-neutral-light pt-2">
                  <span className="text-xs font-black text-neutral-dark">৳{p.price.toFixed(2)}</span>
                  <span className="text-[9px] text-success font-semibold">{p.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active POS Order Ticket & Billing */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-neutral-light pb-2 mb-3">
                <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-primary-accent" /> Active Ticket
                </h3>
                <button
                  onClick={clearPosCart}
                  className="text-[10px] text-error hover:underline font-bold"
                >
                  Clear All
                </button>
              </div>

              {/* Customer Selector */}
              <div className="mb-3">
                <label className="text-[10px] font-bold text-neutral-muted block mb-1">CRM Customer (Optional)</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none"
                >
                  <option value="">Walk-in Retail Customer</option>
                  {crmCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.tier} Tier
                    </option>
                  ))}
                </select>
              </div>

              {/* Ticket Items List */}
              <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-neutral-light/50 pr-1">
                {posCart.length === 0 ? (
                  <p className="text-center text-xs text-neutral-muted py-8">Scan SKU or click catalog cards.</p>
                ) : (
                  posCart.map((item) => (
                    <div key={item.product.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-neutral-dark line-clamp-1">{item.product.name}</p>
                        <p className="text-[10px] text-neutral-muted">৳{item.product.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePosCartQty(item.product.id, parseInt(e.target.value) || 1)}
                          className="w-12 bg-neutral-light border border-neutral-light rounded p-1 text-center text-xs font-bold outline-none"
                        />
                        <button
                          onClick={() => removeFromPosCart(item.product.id)}
                          className="text-error hover:text-error/80 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Checkout Button */}
            <div className="border-t border-neutral-light pt-4 space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-body">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={posDiscountPercent}
                      onChange={(e) => setPosDiscount(parseInt(e.target.value) || 0)}
                      className="w-12 bg-neutral-light border border-neutral-light rounded p-0.5 text-center text-xs font-bold"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>VAT Tax (5%)</span>
                  <span className="font-semibold">৳{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-dark border-t border-neutral-light pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary-dark">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment selector */}
              <div className="grid grid-cols-3 gap-2">
                {['CASH', 'CARD', 'MFS (bKash)'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPosPaymentMethod(method)}
                    className={`py-1.5 text-[10px] font-bold rounded border transition-colors ${
                      posPaymentMethod === method
                        ? 'bg-neutral-dark text-white border-neutral-dark'
                        : 'border-neutral-light text-neutral-dark hover:bg-neutral-light'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePosCheckoutSubmit}
                className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-extrabold py-3 rounded-md shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print & Complete Sale (৳{grandTotal.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POS Receipt Modal */}
      {showReceiptModal && receiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-lg shadow-modal p-6 text-center space-y-4 animate-slide-up">
            <CheckCircle className="w-10 h-10 text-success mx-auto" />
            <h3 className="text-base font-bold text-neutral-dark">Order Completed!</h3>
            <div className="bg-neutral-light p-4 rounded text-left text-xs font-mono space-y-1">
              <p className="font-bold text-center border-b border-neutral-muted/20 pb-1 mb-2">ZIBONBABA POS OUTLET RECEIPT</p>
              <p>Receipt #: {receiptOrder.id}</p>
              <p>Branch: {receiptOrder.branch}</p>
              <p>Payment: {receiptOrder.paymentMethod}</p>
              <p>Date: {receiptOrder.date}</p>
              <div className="border-t border-neutral-muted/20 my-2 pt-1">
                {receiptOrder.items.map((i: any) => (
                  <div key={i.product.id} className="flex justify-between">
                    <span>{i.product.name.slice(0, 15)}... x{i.quantity}</span>
                    <span>৳{(i.product.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-muted/20 pt-1 font-bold flex justify-between">
                <span>TOTAL PAID:</span>
                <span>৳{receiptOrder.total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full bg-neutral-dark text-white text-xs font-bold py-2 rounded"
            >
              Close & Start New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
