import { useEffect, useState } from "react";

export interface PricePoint {
  price: number;
  date: string;
}

export interface WishItem {
  id: string;
  name: string;
  category: string;
  store: string;
  url: string;
  targetPrice: number | null;
  history: PricePoint[];
}

export interface NewWishItem {
  name: string;
  category: string;
  store: string;
  url: string;
  targetPrice: number | null;
  currentPrice: number | null;
}

const KEY = "smartdeal:wishlist:v1";

function load(): WishItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WishItem[]) : [];
  } catch {
    return [];
  }
}

export function parsePrice(text: string): number | null {
  let s = text.replace(/R\$/gi, "").replace(/\s/g, "");
  if (s === "") return null;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useWishlist() {
  const [items, setItems] = useState<WishItem[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // sem armazenamento disponível: a lista continua funcionando nesta visita
    }
  }, [items]);

  function addItem(data: NewWishItem) {
    const now = new Date().toISOString();
    const item: WishItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: data.name,
      category: data.category,
      store: data.store,
      url: data.url,
      targetPrice: data.targetPrice,
      history:
        data.currentPrice !== null
          ? [{ price: data.currentPrice, date: now }]
          : [],
    };
    setItems((prev) => [item, ...prev]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addPrice(id: string, price: number) {
    const point: PricePoint = { price, date: new Date().toISOString() };
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, history: [...i.history, point] } : i
      )
    );
  }

  return { items, addItem, removeItem, addPrice };
}
