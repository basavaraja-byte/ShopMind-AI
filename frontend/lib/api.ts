const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  zip_code: string;
}

export interface CheckoutPayload {
  items: Array<{
    id: string;
    name: string;
    brand?: string;
    price: number;
    final_price?: number;
    quantity: number;
  }>;
  shipping_address: ShippingAddress;
  payment_method?: string;
  promo_code?: string;
}

export interface OrderConfirmation {
  order_id: string;
  status: string;
  created_at: string;
  items: Array<{
    product_id: string;
    name: string;
    brand: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }>;
  shipping_address: ShippingAddress;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total_payable: number;
  estimated_delivery: string;
  promo_applied?: string;
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

export async function validatePromoCode(code: string) {
  const res = await fetch(`${API_BASE}/cart/validate-promo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Invalid promo code');
  return res.json();
}

export async function checkoutOrder(payload: CheckoutPayload): Promise<OrderConfirmation> {
  const res = await fetch(`${API_BASE}/cart/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Checkout failed');
  return res.json();
}

export async function fetchOrder(orderId: string): Promise<OrderConfirmation> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

