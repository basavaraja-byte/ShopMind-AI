'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { checkoutOrder, OrderConfirmation } from '@/lib/api';
import { X, CheckCircle2, CreditCard, Truck, ShieldCheck, ArrowRight, Loader2, Copy, Sparkles, ShoppingBag } from 'lucide-react';

interface CheckoutModalProps {
  onAskAIAboutOrder?: (prompt: string) => void;
}

export default function CheckoutModal({ onAskAIAboutOrder }: CheckoutModalProps) {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    subtotal,
    discountAmount,
    shippingFee,
    tax,
    totalPayable,
    appliedPromo,
    setLastOrder,
  } = useCart();

  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [shipping, setShipping] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    address: '42 Tech Park Avenue, Sector 5',
    city: 'Bengaluru',
    zip_code: '560001',
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [orderResult, setOrderResult] = useState<OrderConfirmation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStep('processing');

    const payload = {
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        price: i.product.price,
        final_price: i.product.final_price,
        quantity: i.quantity,
      })),
      shipping_address: shipping,
      payment_method: paymentMethod,
      promo_code: appliedPromo ? appliedPromo.code : undefined,
    };

    try {
      // Simulate brief network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await checkoutOrder(payload);
      setOrderResult(res);
      setLastOrder(res);
      clearCart();
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed. Please try again.');
      setStep('form');
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('form');
    setOrderResult(null);
  };

  const copyOrderId = () => {
    if (orderResult) {
      navigator.clipboard.writeText(orderResult.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackWithAI = () => {
    if (orderResult) {
      const prompt = `Can you check the delivery timeline and status for my order ${orderResult.order_id}?`;
      handleClose();
      if (onAskAIAboutOrder) {
        onAskAIAboutOrder(prompt);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {step === 'success' ? 'Order Confirmed!' : 'Express Checkout'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'success' ? 'Thank you for your purchase' : 'Simulated Order & Instant Confirmation'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Processing State */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-spin">
              <Loader2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-white">Processing Order...</h4>
              <p className="text-xs text-slate-400">
                Verifying inventory stock, calculating tax compliance, and generating order record.
              </p>
            </div>
          </div>
        )}

        {/* Success Confirmation State */}
        {step === 'success' && orderResult && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Order Status: {orderResult.status}</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">Order #{orderResult.order_id}</h4>
                <p className="text-xs text-slate-400 mt-1">Placed on {orderResult.created_at}</p>
              </div>

              {/* Order ID Copy Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-mono text-emerald-400 font-bold">{orderResult.order_id}</span>
                <button
                  onClick={copyOrderId}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Delivery Address</span>
                <span className="text-white font-medium">{orderResult.shipping_address.address}, {orderResult.shipping_address.city}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Estimated Delivery</span>
                <span className="text-emerald-400 font-bold">{orderResult.estimated_delivery}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Amount Paid</span>
                <span className="text-white font-extrabold text-sm">₹{orderResult.total_payable.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleTrackWithAI}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Track Order with ShopMind AI</span>
              </button>
              <button
                onClick={handleClose}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        {step === 'form' && (
          <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Shipping Address Inputs */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-400" /> Shipping Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shipping.name}
                    onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shipping.zip_code}
                    onChange={(e) => setShipping({ ...shipping, zip_code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-emerald-400" /> Payment Method
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {['UPI / GPay', 'Credit / Debit Card', 'Net Banking', 'Cash on Delivery'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      paymentMethod === method
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{method}</span>
                    {paymentMethod === method && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary & Pay */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                <span className="text-white">₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Savings</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping & Tax</span>
                <span className="text-white">₹{(shippingFee + tax).toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-emerald-400">₹{totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Complete Order — ₹{totalPayable.toLocaleString()}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
