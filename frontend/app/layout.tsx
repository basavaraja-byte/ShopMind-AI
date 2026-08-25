import './globals.css';
import React from 'react';

export const metadata = {
  title: 'ShopMind AI — Intelligent AI Shopping Companion',
  description: 'Multi-agent e-commerce assistant powered by RAG, LangGraph, and Tool Calling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
                S
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">ShopMind <span className="text-emerald-400 font-extrabold">AI</span></span>
                <span className="hidden sm:inline-block ml-3 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                  Multi-Agent Assistant
                </span>
              </div>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-300">
              <a href="#chat" className="hover:text-emerald-400 transition-colors">AI Shopping Assistant</a>
              <a href="#catalog" className="hover:text-emerald-400 transition-colors">Product Catalog</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          ShopMind AI — Multi-Agent E-Commerce Architecture Demonstration (FastAPI + LangGraph + FAISS + Next.js)
        </footer>
      </body>
    </html>
  );
}
