'use client';

import React, { useState, useEffect } from 'react';
import { sendChatMessage, sendFeedback, fetchProducts, Product, ChatResponse } from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutModal from '@/components/cart/CheckoutModal';
import { Sparkles, Send, Bot, User, CheckCircle2, ChevronDown, ChevronUp, Layers, ArrowRightLeft, ThumbsUp, ThumbsDown, BookOpen, Info, ShoppingBag, Plus } from 'lucide-react';

export default function HomePage() {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: ChatResponse; feedbackGiven?: string }>>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { addToCart, cart } = useCart();

  useEffect(() => {
    fetchProducts().then(setCatalog).catch(console.error);
  }, []);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputQuery('');
    setLoading(true);

    try {
      const resp = await sendChatMessage(text, conversationId);
      setConversationId(resp.conversation_id);
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: resp.answer, data: resp }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Error connecting to ShopMind AI backend. Please ensure FastAPI server is running on port 8000.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgIdx: number, rating: 'positive' | 'negative') => {
    if (!conversationId) return;
    try {
      await sendFeedback(conversationId, rating);
      setMessages((prev) =>
        prev.map((m, i) => (i === msgIdx ? { ...m, feedbackGiven: rating } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompare = (prod: Product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.id === prod.id);
      if (exists) return prev.filter((p) => p.id !== prod.id);
      if (prev.length >= 3) return prev;
      return [...prev, prod];
    });
  };

  const suggestedQueries = [
    "I need a phone under ₹120,000 with a good camera, discount and fast delivery.",
    "Is Samsung Galaxy M14 in stock?",
    "Is there a discount on Samsung Galaxy M14?",
    "What do customers say about Samsung Galaxy M14?",
    "Does Samsung Galaxy M14 have NFC?",
    "Which promo codes can I use for my shopping cart?",
    "Find running shoes under ₹15,000."
  ];

  return (
    <div className="space-y-10">
      <CartDrawer onAskAIAboutCart={(prompt) => handleSend(prompt)} />
      <CheckoutModal onAskAIAboutOrder={(prompt) => handleSend(prompt)} />

      {/* Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
        <span className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span><strong>Notice:</strong> Prototype environment utilizing <strong>Simulated Pricing, Order & Inventory APIs</strong> over a <strong>Prototype Catalog</strong>.</span>
        </span>
        <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">Mock API & Cart Active</span>
      </div>

      {/* Hero Section */}
      <section className="text-center py-6 space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> Multi-Agent Orchestration & Smart Cart Assistant
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Shop Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">ShopMind AI</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Search, compare, verify stock, calculate discounts, add to cart, and checkout powered by 6 collaborating agents.
        </p>
      </section>

      {/* Suggested Queries */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        <span className="text-xs font-semibold text-slate-400 mr-1">Try Asking:</span>
        {suggestedQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="text-xs bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Product Comparison Bar */}
      {comparedProducts.length > 0 && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Compare Products ({comparedProducts.length}/3)
            </h3>
            <button onClick={() => setComparedProducts([])} className="text-xs text-slate-400 hover:text-white">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {comparedProducts.map((p) => (
              <div key={p.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white line-clamp-1">{p.name}</h4>
                  <button onClick={() => toggleCompare(p)} className="text-slate-500 hover:text-rose-400"></button>
                </div>
                <p className="text-emerald-400 font-extrabold">₹{p.final_price.toLocaleString()}</p>
                <p className="text-slate-400">Rating: ⭐ {p.rating} | Category: {p.category}</p>
                <button
                  onClick={() => addToCart(p)}
                  className="w-full mt-2 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <ShoppingBag className="h-3 w-3" /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant Section */}
      <section id="chat" className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 backdrop-blur shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Live AI Assistant</h2>
              <p className="text-xs text-slate-400">Interactive Multi-Agent Session</p>
            </div>
          </div>
          {conversationId && (
            <span className="text-[10px] font-mono bg-slate-950 text-emerald-400 px-2.5 py-1 rounded-full border border-slate-800">
              Session: {conversationId.substring(0, 8)}...
            </span>
          )}
        </div>

        {/* Messages Stream */}
        <div className="space-y-4 min-h-[300px] max-h-[550px] overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-slate-500">
              <Bot className="h-10 w-10 mx-auto text-slate-600" />
              <p className="text-sm">Ask ShopMind AI about products, discounts, stock, reviews, or your cart!</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-2xl rounded-2xl p-4 space-y-3 text-sm ${m.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                  
                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                  {/* Agent Execution Timeline Logs */}
                  {m.data?.agents_used && m.data.agents_used.length > 0 && (
                    <div className="border-t border-slate-800 pt-2 space-y-2">
                      <button
                        onClick={() => setExpandedLogs((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 hover:underline"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Agents Utilized ({m.data.agents_used.length}): {m.data.agents_used.join(' → ')}</span>
                        {expandedLogs[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {expandedLogs[idx] && m.data.logs && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono space-y-1 text-slate-300 max-h-48 overflow-y-auto">
                          {m.data.logs.map((log, lIdx) => (
                            <div key={lIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grounded RAG Sources */}
                  {m.data?.sources && m.data.sources.length > 0 && (
                    <div className="border-t border-slate-800 pt-2 space-y-2">
                      <button
                        onClick={() => setExpandedSources((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        className="text-xs font-semibold text-teal-400 flex items-center gap-1.5 hover:underline"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Grounded RAG Knowledge Sources ({m.data.sources.length})</span>
                        {expandedSources[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {expandedSources[idx] && (
                        <div className="space-y-2 pt-1">
                          {m.data.sources.map((src, sIdx) => (
                            <div key={sIdx} className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-teal-300 text-[11px] uppercase">{src.source}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Similarity {(src.score * 100).toFixed(0)}%</span>
                              </div>
                              <p className="text-slate-400 text-[11px] italic">"{src.snippet}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommended Products Grid */}
                  {m.data?.products && m.data.products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {m.data.products.map((p) => {
                        const inCart = cart.some((ci) => ci.product.id === p.id);
                        return (
                          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 hover:border-emerald-500/50 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">{p.brand}</span>
                                <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                              </div>
                              <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                ⭐ {p.rating}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-extrabold text-white">₹{p.final_price.toLocaleString()}</span>
                              {p.discount > 0 && (
                                <span className="text-xs text-slate-500 line-through">₹{p.price.toLocaleString()}</span>
                              )}
                            </div>

                            {p.score_reason && (
                              <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800/60">
                                Match score {p.match_score}%: {p.score_reason}
                              </p>
                            )}

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => addToCart(p)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                                  inCart
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                                }`}
                              >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
                              </button>
                              <button
                                onClick={() => toggleCompare(p)}
                                className={`px-2.5 py-1.5 text-xs rounded font-medium border transition-colors flex items-center gap-1 ${
                                  comparedProducts.some((cp) => cp.id === p.id)
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <ArrowRightLeft className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Feedback Controls */}
                  {m.sender === 'assistant' && (
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs text-slate-500">
                      <span>Was this response helpful?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback(idx, 'positive')}
                          className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${m.feedbackGiven === 'positive' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400'}`}
                          title="Helpful"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, 'negative')}
                          className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${m.feedbackGiven === 'negative' ? 'text-rose-400 font-bold bg-rose-500/10' : 'text-slate-400'}`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        {m.feedbackGiven && (
                          <span className="text-[10px] text-emerald-400">Feedback saved!</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-3 text-emerald-400 text-xs font-semibold py-4 animate-pulse">
              <Bot className="h-5 w-5" /> ShopMind AI is running multi-step task decomposition & agent tool calls...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask ShopMind AI to recommend products, calculate cart discounts, check stock..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
      </section>

      {/* Prototype Product Catalog Grid */}
      <section id="catalog" className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold text-white">Prototype Product Catalog</h3>
            <p className="text-xs text-slate-400">Browse simulated products or add directly to your cart</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {catalog.map((p) => {
            const inCart = cart.some((ci) => ci.product.id === p.id);
            return (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">{p.category}</span>
                    <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">⭐ {p.rating}</span>
                  </div>
                  <h4 className="font-bold text-white text-base">{p.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-white">₹{p.final_price.toLocaleString()}</span>
                    {p.discount > 0 && <span className="text-xs text-slate-500 line-through">₹{p.price.toLocaleString()}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSend(`Tell me more about ${p.name}`)}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors"
                    >
                      Ask AI
                    </button>
                    <button
                      onClick={() => addToCart(p)}
                      className={`py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                        inCart
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
