import './globals.css';
import React from 'react';
import { CartProvider } from '@/lib/CartContext';
import Header from '@/components/Header';

export const metadata = {
  title: 'ShopMind AI — Intelligent AI Shopping Companion',
  description: 'Multi-agent e-commerce assistant powered by RAG, LangGraph, and Tool Calling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <CartProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
            ShopMind AI — Multi-Agent E-Commerce Architecture Demonstration (FastAPI + RAG + Next.js 14)
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
