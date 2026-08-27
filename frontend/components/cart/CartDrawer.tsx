'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  onAskAIAboutCart?: (prompt: string) => void;
}

export default function CartDrawer({ onAskAIAboutCart }: CartDrawerProps) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    tax,
    totalPayable,
    appliedPromo,
    applyPromo,
    removePromo,
    setIsCheckoutOpen,
    totalItemsCount,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = async (codeToApply?: string) => {
    const code = codeToApply || promoInput;
    if (!code.trim()) return;

    setApplying(true);
    setPromoMessage(null);

    const res = await applyPromo(code);
    setApplying(false);

    if (res.success) {
      setPromoMessage({ text: res.message, isError: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const handleAskAICart = () => {
    if (cart.length === 0) return;
    const itemNames = cart.map((i) => `${i.product.name} (Qty: ${i.quantity})`).join(', ');
    const prompt = `I have the following items in my shopping cart: ${itemNames}. Total payable is ₹${totalPayable.toLocaleString()}. Are there any extra bank offers, warranty policies, or stock constraints for these products?`;
    
    setIsCartOpen(false);
    if (onAskAIAboutCart) {
      onAskAIAboutCart(prompt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Your Shopping Cart</h2>
                <p className="text-xs text-slate-400">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-300">Your cart is currently empty</p>
                  <p className="text-xs text-slate-500">Explore recommendations from ShopMind AI or browse our catalog.</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  {cart.map(({ product, quantity }) => {
                    const price = product.final_price || product.price;
                    return (
                      <div
                        key={product.id}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex gap-3 items-center hover:border-slate-700 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0 uppercase">
                          {product.brand ? product.brand.substring(0, 2) : 'AI'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-white truncate">{product.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{product.category}</span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-white">₹{price.toLocaleString()}</span>
                            {product.discount > 0 && (
                              <span className="text-[10px] text-slate-500 line-through">₹{product.price.toLocaleString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1.5">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Section */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-emerald-400" /> Apply Promo Code
                    </span>
                    {appliedPromo && (
                      <button onClick={removePromo} className="text-[10px] text-rose-400 hover:underline">
                        Remove Code
                      </button>
                    )}
                  </div>

                  {appliedPromo ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <div>
                          <p className="font-bold">{appliedPromo.code}</p>
                          <p className="text-[10px] text-emerald-400/80">{appliedPromo.description}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="e.g. SHOPMIND10"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                        />
                        <button
                          onClick={() => handleApplyPromo()}
                          disabled={applying || !promoInput.trim()}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold px-3 py-1.5 text-xs rounded-lg transition-colors"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Promo Code Presets */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          onClick={() => handleApplyPromo('SHOPMIND10')}
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono"
                        >
                          SHOPMIND10 (10% OFF)
                        </button>
                        <button
                          onClick={() => handleApplyPromo('AIWELCOME')}
                          className="text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono"
                        >
                          AIWELCOME (₹1k OFF)
                        </button>
                      </div>
                    </>
                  )}

                  {promoMessage && (
                    <div className={`text-[11px] flex items-center gap-1.5 ${promoMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {promoMessage.isError ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      <span>{promoMessage.text}</span>
                    </div>
                  )}
                </div>

                {/* AI Assistant Quick Action */}
                <button
                  onClick={handleAskAICart}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Ask ShopMind AI about cart items</span>
                </button>
              </>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promo Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-medium">
                    {shippingFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (18%)</span>
                  <span className="text-white font-medium">₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-extrabold text-white">
                  <span>Total Payable</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    ₹{totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
