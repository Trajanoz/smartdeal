import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useSession } from "./useSession";

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

interface Row {
  id: string;
  name: string;
  category: string;
  store: string;
  url: string;
  target_price: number | string | null;
  wishlist_prices: { price: number | string; recorded_at: string }[] | null;
}

const KEY = "smartdeal:wishlist:v1";

function loadLocal(): WishItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WishItem[]) : [];
  } catch {
    return [];
  }
}

function toWishItem(row: Row): WishItem {
  const history = [...(row.wishlist_prices ?? [])]
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
    .map((p) => ({ price: Number(p.price), date: p.recorded_at }));
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    store: row.store,
    url: row.url,
    targetPrice: row.target_price === null ? null : Number(row.target_price),
    history,
  };
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
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const cloud = supabase !== null && userId !== null;

  const [localItems, setLocalItems] = useState<WishItem[]>(loadLocal);
  const [cloudItems, setCloudItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(localItems));
    } catch {
      // sem armazenamento disponível: a lista continua funcionando nesta visita
    }
  }, [localItems]);

  const reload = useCallback(async () => {
    if (!supabase || !userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist_items")
      .select(
        "id, name, category, store, url, target_price, created_at, wishlist_prices(price, recorded_at)"
      )
      .order("created_at", { ascending: false });
    if (error) {
      setMessage("Não foi possível carregar sua lista: " + error.message);
    } else {
      setCloudItems(((data ?? []) as unknown as Row[]).map(toWishItem));
      setMessage("");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (cloud) {
      reload();
    } else {
      setCloudItems([]);
    }
  }, [cloud, reload]);

  async function addItem(data: NewWishItem) {
    if (cloud && supabase) {
      const { data: row, error } = await supabase
        .from("wishlist_items")
        .insert({
          name: data.name,
          category: data.category,
          store: data.store,
          url: data.url,
          target_price: data.targetPrice,
        })
        .select("id")
        .single();
      if (error || !row) {
        setMessage("Não foi possível salvar o produto: " + (error?.message ?? ""));
        return;
      }
      if (data.currentPrice !== null) {
        const { error: priceError } = await supabase
          .from("wishlist_prices")
          .insert({ item_id: row.id, price: data.currentPrice });
        if (priceError) {
          setMessage("O produto foi salvo, mas o preço não: " + priceError.message);
        }
      }
      await reload();
      return;
    }

    const item: WishItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: data.name,
      category: data.category,
      store: data.store,
      url: data.url,
      targetPrice: data.targetPrice,
      history:
        data.currentPrice !== null
          ? [{ price: data.currentPrice, date: new Date().toISOString() }]
          : [],
    };
    setLocalItems((prev) => [item, ...prev]);
  }

  async function removeItem(id: string) {
    if (cloud && supabase) {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", id);
      if (error) {
        setMessage("Não foi possível remover o produto: " + error.message);
        return;
      }
      await reload();
      return;
    }
    setLocalItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function addPrice(id: string, price: number) {
    if (cloud && supabase) {
      const { error } = await supabase
        .from("wishlist_prices")
        .insert({ item_id: id, price });
      if (error) {
        setMessage("Não foi possível registrar o preço: " + error.message);
        return;
      }
      await reload();
      return;
    }
    const point: PricePoint = { price, date: new Date().toISOString() };
    setLocalItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, history: [...i.history, point] } : i
      )
    );
  }

  async function importLocal() {
    if (!cloud || !supabase || localItems.length === 0) return;
    setLoading(true);
    for (const item of localItems) {
      const { data: row, error } = await supabase
        .from("wishlist_items")
        .insert({
          name: item.name,
          category: item.category,
          store: item.store,
          url: item.url,
          target_price: item.targetPrice,
        })
        .select("id")
        .single();
      if (error || !row) {
        setMessage(
          "A importação parou em \"" + item.name + "\": " + (error?.message ?? "")
        );
        setLoading(false);
        await reload();
        return;
      }
      if (item.history.length > 0) {
        const { error: priceError } = await supabase
          .from("wishlist_prices")
          .insert(
            item.history.map((p) => ({
              item_id: row.id,
              price: p.price,
              recorded_at: p.date,
            }))
          );
        if (priceError) {
          setMessage(
            "O produto \"" + item.name + "\" foi importado, mas o histórico não: " + priceError.message
          );
        }
      }
      setLocalItems((prev) => prev.filter((i) => i.id !== item.id));
    }
    await reload();
  }

  return {
    items: cloud ? cloudItems : localItems,
    cloud,
    loading,
    message,
    pendingLocal: cloud ? localItems.length : 0,
    addItem,
    removeItem,
    addPrice,
    importLocal,
  };
}
