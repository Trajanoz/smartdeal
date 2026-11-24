import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useSession } from "./useSession";
import { formatBRL } from "./wishlist";

export type CouponStatus = "valid" | "unverified" | "expired";
export type DiscountType = "percent" | "fixed";

export interface Coupon {
  id: string;
  store: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  rules: string;
  sourceUrl: string;
  validUntil: string | null;
  status: CouponStatus;
  lastCheckedAt: string | null;
}

export interface NewCoupon {
  store: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  rules: string;
  sourceUrl: string;
  validUntil: string | null;
}

interface Row {
  id: string;
  store: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number | string;
  min_purchase: number | string | null;
  max_discount: number | string | null;
  rules: string;
  source_url: string;
  valid_until: string | null;
  status: CouponStatus;
  last_checked_at: string | null;
}

const num = (v: number | string | null): number | null =>
  v === null ? null : Number(v);

function toCoupon(r: Row): Coupon {
  return {
    id: r.id,
    store: r.store,
    code: r.code,
    discountType: r.discount_type,
    discountValue: Number(r.discount_value),
    minPurchase: num(r.min_purchase),
    maxDiscount: num(r.max_discount),
    rules: r.rules,
    sourceUrl: r.source_url,
    validUntil: r.valid_until,
    status: r.status,
    lastCheckedAt: r.last_checked_at,
  };
}

export function todayLocal(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function effectiveStatus(c: Coupon): CouponStatus {
  if (c.validUntil !== null && c.validUntil < todayLocal()) return "expired";
  return c.status;
}

export interface FinalPrice {
  applicable: boolean;
  reason: string;
  discount: number;
  final: number;
}

export function computeFinalPrice(price: number, c: Coupon): FinalPrice {
  if (effectiveStatus(c) === "expired") {
    return { applicable: false, reason: "Cupom expirado.", discount: 0, final: price };
  }
  if (c.minPurchase !== null && price < c.minPurchase) {
    return {
      applicable: false,
      reason: "Exige compra mínima de " + formatBRL(c.minPurchase) + ".",
      discount: 0,
      final: price,
    };
  }
  let discount =
    c.discountType === "percent"
      ? (price * c.discountValue) / 100
      : c.discountValue;
  if (c.maxDiscount !== null) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, price);
  discount = Math.round(discount * 100) / 100;
  return {
    applicable: true,
    reason: "",
    discount,
    final: Math.round((price - discount) * 100) / 100,
  };
}

export function useCoupons() {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user.id ?? null;
  const loggedIn = supabase !== null && userId !== null;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const reload = useCallback(async () => {
    if (!supabase || !userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setMessage("Não foi possível carregar seus cupons: " + error.message);
    } else {
      setCoupons(((data ?? []) as unknown as Row[]).map(toCoupon));
      setMessage("");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (loggedIn) {
      reload();
    } else {
      setCoupons([]);
    }
  }, [loggedIn, reload]);

  async function addCoupon(data: NewCoupon): Promise<boolean> {
    if (!supabase || !loggedIn) return false;
    const { error } = await supabase.from("coupons").insert({
      store: data.store,
      code: data.code,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      min_purchase: data.minPurchase,
      max_discount: data.maxDiscount,
      rules: data.rules,
      source_url: data.sourceUrl,
      valid_until: data.validUntil,
    });
    if (error) {
      setMessage("Não foi possível salvar o cupom: " + error.message);
      return false;
    }
    await reload();
    return true;
  }

  async function setStatus(id: string, status: CouponStatus) {
    if (!supabase || !loggedIn) return;
    const { error } = await supabase
      .from("coupons")
      .update({ status, last_checked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setMessage("Não foi possível atualizar o cupom: " + error.message);
      return;
    }
    await reload();
  }

  async function removeCoupon(id: string) {
    if (!supabase || !loggedIn) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      setMessage("Não foi possível remover o cupom: " + error.message);
      return;
    }
    await reload();
  }

  return {
    loggedIn,
    sessionLoading,
    coupons,
    loading,
    message,
    addCoupon,
    setStatus,
    removeCoupon,
  };
}
