const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  stock: boolean;
  delivery_days: number;
  discount: number;
  final_price: number;
  description: string;
  specifications?: Record<string, any>;
  score_reason?: string;
  match_score?: number;
  data_source_label?: string;
  inventory_info?: {
    in_stock: boolean;
    status: string;
    delivery_estimate: string;
  };
}

export interface SourceItem {
  source: string;
  product_id?: string;
  snippet: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  products: Product[];
  agents_used: string[];
  logs: string[];
  sources?: SourceItem[];
  is_cached?: boolean;
  conversation_id: string;
}

export async function sendChatMessage(message: string, conversationId?: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });
  if (!res.ok) throw new Error('Failed to connect to ShopMind AI backend.');
  return res.json();
}

export async function sendFeedback(conversationId: string, rating: 'positive' | 'negative', comment?: string) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: conversationId, rating, comment }),
  });
  return res.json();
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  const url = category ? `${API_BASE}/products?category=${encodeURIComponent(category)}` : `${API_BASE}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}
