'use client';

import React, { useState, useEffect } from 'react';
import { sendChatMessage, sendFeedback, fetchProducts, Product, ChatResponse } from '@/lib/api';
import { Sparkles, Send, Bot, User, CheckCircle2, ChevronDown, ChevronUp, Layers, ArrowRightLeft, ThumbsUp, ThumbsDown, BookOpen, Info } from 'lucide-react';

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
    "I need a phone under ₹20,000 with a good camera, discount and fast delivery.",
    "Is Samsung M14 in stock?",
    "Is there a discount on Samsung M14?",
    "What do customers say about Samsung M14?",
    "Does this phone have NFC?",
    "Which is better between Samsung M14 and Redmi Note 13?",
    "Find a laptop under ₹70,000 and check delivery and discounts."
  ];

  return (
    <div className="space-y-10">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
        <span className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span><strong>Notice:</strong> Prototype environment utilizing <strong>Simulated Pricing & Inventory APIs</strong> over a <strong>Prototype Product Catalog</strong>.</span>
        </span>
        <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">Mock API Layer Active</span>
      </div>

      {/* Hero Section */}
      <section className="text-center py-6 space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> Multi-Agent Orchestration & RAG Assistant
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Shop Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">ShopMind AI</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Search, compare, verify stock, calculate discounts, and discover recommendations powered by 6 collaborating agents.
        </p>
      </section>

      {/* Suggested Queries Pills */}
      <section className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 px-3.5 py-2 rounded-full transition-all duration-150 shadow-sm"
          >
            {q}
          </button>
        ))}
      </section>

      {/* AI Chat Container */}
      <section id="chat" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Shopping Assistant Chat</h2>
              <p className="text-xs text-slate-400">Multi-Agent Dialogue, RAG Context Injection & Tool Calling</p>
            </div>
          </div>
          {conversationId && (
            <span className="text-xs text-slate-500 font-mono bg-slate-950 px-2.5 py-1 rounded">
              Session ID: {conversationId}
            </span>
          )}
        </div>

        {/* Messages Feed */}
        <div className="space-y-6 min-h-[300px] max-h-[600px] overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-slate-500">
              <Bot className="h-12 w-12 mx-auto text-slate-700 animate-pulse" />
              <p className="text-sm">Enter any shopping request to initiate multi-agent execution.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    AI
                  </div>
                )}
                <div className={`max-w-2xl rounded-2xl p-4 text-sm space-y-4 ${m.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                  {/* Cache Indicator */}
                  {m.data?.is_cached && (
                    <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      ⚡ Cache Hit (Response Served from InMemoryCacheService)
                    </span>
                  )}

                  {/* Agent Execution Activity Timeline */}
                  {m.data?.logs && (
                    <div className="border-t border-slate-800/80 pt-3 space-y-2">
                      <button
                        onClick={() => setExpandedLogs((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        className="flex items-center justify-between w-full text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg hover:bg-emerald-900/30 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" /> Agent Activity ({m.data.agents_used.length} Agents)
                        </span>
                        {expandedLogs[idx] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      
                      {expandedLogs[idx] && (
                        <div className="bg-slate-900/90 rounded-lg p-3 text-xs space-y-1.5 border border-slate-800">
                          {m.data.logs.map((log, lIdx) => (
                            <div key={lIdx} className="flex items-center gap-2 text-slate-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* RAG Sources Indicator (Requirement #7) */}
                  {m.data?.sources && m.data.sources.length > 0 && (
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setExpandedSources((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        className="flex items-center justify-between w-full text-xs font-semibold text-teal-300 bg-teal-950/30 border border-teal-800/30 px-3 py-1.5 rounded-lg hover:bg-teal-900/20 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5" /> RAG Grounding Sources ({m.data.sources.length} Documents)
                        </span>
                        {expandedSources[idx] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      
                      {expandedSources[idx] && (
                        <div className="bg-slate-900 rounded-lg p-3 text-xs space-y-2 border border-slate-800">
                          {m.data.sources.map((src, sIdx) => (
                            <div key={sIdx} className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                              <div className="flex justify-between text-[11px] text-teal-400 font-mono">
                                <span>Source: {src.source}</span>
                                <span>Similarity: {Math.round(src.score * 100)}%</span>
                              </div>
                              <p className="text-slate-400 line-clamp-2 italic">"{src.snippet}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommended Products Grid */}
                  {m.data?.products && m.data.products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {m.data.products.map((p) => (
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
                              onClick={() => setSelectedProduct(p)}
                              className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition-colors"
                            >
                              Specs
                            </button>
                            <button
                              onClick={() => toggleCompare(p)}
                              className={`px-3 py-1.5 text-xs rounded font-medium border transition-colors flex items-center gap-1 ${comparedProducts.some(cp => cp.id === p.id) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                            >
                              <ArrowRightLeft className="h-3 w-3" /> Compare
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Feedback Controls (Requirement #10) */}
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
            placeholder="Search products, check discounts, stock or delivery..."
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

      {/* Product Catalog Grid */}
      <section id="catalog" className="space-y-4">
        <h3 className="text-xl font-bold text-white">Prototype Catalog Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {catalog.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">{p.category}</span>
                <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">⭐ {p.rating}</span>
              </div>
              <h4 className="font-bold text-white text-base">{p.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">₹{p.final_price.toLocaleString()}</span>
                {p.discount > 0 && <span className="text-xs text-slate-500 line-through">₹{p.price.toLocaleString()}</span>}
              </div>
              <button
                onClick={() => handleSend(`Tell me more about ${p.name}`)}
                className="w-full py-2 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl transition-colors"
              >
                Ask ShopMind AI
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
