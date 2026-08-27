'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, OrderConfirmation, validatePromoCode } from './api';

interface PromoInfo {
  code: string;
  discount_percent?: number;
  flat_discount?: number;
  free_shipping?: boolean;
  description: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  appliedPromo: PromoInfo | null;
  applyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromo: () => void;
  lastOrder: OrderConfirmation | null;
  setLastOrder: (order: OrderConfirmation | null) => void;
  totalItemsCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  tax: number;
  totalPayable: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoInfo | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderConfirmation | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shopmind_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shopmind_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromo = async (code: string) => {
    try {
      const res = await validatePromoCode(code);
      setAppliedPromo(res);
      return { success: true, message: `Promo applied: ${res.description}` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid promo code' };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  // Calculations
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.final_price || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  let discountAmount = 0;
  let shippingFee = subtotal > 0 && subtotal < 50000 ? 150 : 0;

  if (appliedPromo) {
    if (appliedPromo.discount_percent) {
      discountAmount = (subtotal * appliedPromo.discount_percent) / 100;
    } else if (appliedPromo.flat_discount) {
      discountAmount = Math.min(subtotal, appliedPromo.flat_discount);
    } else if (appliedPromo.free_shipping) {
      shippingFee = 0;
    }
  }

  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const totalPayable = Math.max(0, subtotal - discountAmount + shippingFee + tax);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        appliedPromo,
        applyPromo,
        removePromo,
        lastOrder,
        setLastOrder,
        totalItemsCount,
        subtotal,
        discountAmount,
        shippingFee,
        tax,
        totalPayable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
