'use client';

import React from 'react';
import { useCart } from '@/lib/CartContext';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function Header() {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            S
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              ShopMind <span className="text-emerald-400 font-extrabold">AI</span>
            </span>
            <span className="hidden sm:inline-block ml-3 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
              Multi-Agent Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
            <a href="#chat" className="hover:text-emerald-400 transition-colors">AI Shopping Assistant</a>
            <a href="#catalog" className="hover:text-emerald-400 transition-colors">Product Catalog</a>
          </nav>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Cart</span>
            {totalItemsCount > 0 && (
              <span className="h-5 min-w-5 px-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[11px] flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
