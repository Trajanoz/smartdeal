import { useState, type FormEvent } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  Info,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ticket,
} from "lucide-react";
import { STORES } from "../stores";
import type { PageId } from "../navigation";
import { parsePrice, formatBRL, formatDate } from "../lib/wishlist";
import {
  useCoupons,
  effectiveStatus,
  computeFinalPrice,
  type Coupon,
  type CouponStatus,
  type DiscountType,
} from "../lib/coupons";

const STORE_OPTIONS = [...STORES.map((s) => s.name), "Outra loja"];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

type Filter = "all" | CouponStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "valid", label: "Válidos" },
  { id: "unverified", label: "Não verificados" },
  { id: "expired", label: "Expirados" },
];

function StatusBadge({ status }: { status: CouponStatus }) {
  if (status === "valid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/15 px-2.5 py-0.5 text-xs text-[#22c55e]">
        <CheckCircle2 size={12} />
        Válido (confirmado)
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/15 px-2.5 py-0.5 text-xs text-[#ef4444]">
        <XCircle size={12} />
        Expirado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f59e0b]/15 px-2.5 py-0.5 text-xs text-[#f59e0b]">
      <AlertTriangle size={12} />
      Não verificado
    </span>
  );
}

interface CardProps {
  coupon: Coupon;
  price: number | null;
  onStatus: (id: string, status: CouponStatus) => void;
  onRemove: (id: string) => void;
}

function CouponCard({ coupon, price, onStatus, onRemove }: CardProps) {
  const [copied, setCopied] = useState(false);
  const status = effectiveStatus(coupon);
  const result = price !== null ? computeFinalPrice(price, coupon) : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copie o código:", coupon.code);
    }
  }

  function remove() {
    if (window.confirm("Remover este cupom?")) onRemove(coupon.id);
  }

  const discountText =
    coupon.discountType === "percent"
      ? coupon.discountValue + "% de desconto"
      : formatBRL(coupon.discountValue) + " de desconto";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#94a3b8]">{coupon.store}</p>
          <button
            onClick={copy}
            className="mt-1 inline-flex items-center gap-2 rounded-lg border border-dashed border-[#8b5cf6]/50 bg-[#8b5cf6]/10 px-3 py-1.5 font-mono text-sm font-semibold tracking-wider transition hover:bg-[#8b5cf6]/20"
            aria-label="Copiar código do cupom"
          >
            {coupon.code}
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <button
          onClick={remove}
          aria-label="Remover cupom"
          className="rounded-lg p-2 text-[#94a3b8] transition hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-3">
        <StatusBadge status={status} />
      </div>

      <p className="mt-3 font-semibold">{discountText}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-[#94a3b8]">
        {coupon.minPurchase !== null && (
          <li>Compra mínima: {formatBRL(coupon.minPurchase)}</li>
        )}
        {coupon.maxDiscount !== null && (
          <li>Desconto máximo: {formatBRL(coupon.maxDiscount)}</li>
        )}
        <li>
          Validade:{" "}
          {coupon.validUntil
            ? coupon.validUntil.split("-").reverse().join("/")
            : "não informada"}
        </li>
        <li>
          Última verificação:{" "}
          {coupon.lastCheckedAt
            ? formatDate(coupon.lastCheckedAt)
            : "nunca verificado"}
        </li>
      </ul>

      {coupon.rules !== "" && (
        <p className="mt-3 text-sm text-[#cbd5e1]">{coupon.rules}</p>
      )}

      {result && (
        <div className="mt-4 rounded-xl bg-[#121622] p-3 text-sm">
          {result.applicable ? (
            <>
              <p className="text-xs text-[#94a3b8]">
                Preço final estimado com este cupom
              </p>
              <p className="text-lg font-bold text-[#22c55e]">
                {formatBRL(result.final)}
              </p>
              <p className="text-xs text-[#94a3b8]">
                Desconto de {formatBRL(result.discount)}
              </p>
              {status === "unverified" && (
                <p className="mt-1 text-xs text-[#f59e0b]">
                  Estimativa: este cupom ainda não foi verificado.
                </p>
              )}
            </>
          ) : (
            <p className="text-[#f59e0b]">Não se aplica: {result.reason}</p>
          )}
        </div>
      )}

      {coupon.sourceUrl !== "" && (
        <a
          href={coupon.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm text-[#3b82f6] hover:underline"
        >
          Ver onde encontrei <ExternalLink size={14} />
        </a>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {status !== "valid" && (
          <button
            onClick={() => onStatus(coupon.id, "valid")}
            className="rounded-lg border border-[#22c55e]/40 px-3 py-1.5 text-[#22c55e] transition hover:bg-[#22c55e]/10"
          >
            Confirmei que funciona
          </button>
        )}
        {coupon.status !== "expired" && (
          <button
            onClick={() => onStatus(coupon.id, "expired")}
            className="rounded-lg border border-[#ef4444]/40 px-3 py-1.5 text-[#ef4444] transition hover:bg-[#ef4444]/10"
          >
            Não funcionou
          </button>
        )}
        {coupon.status !== "unverified" && (
          <button
            onClick={() => onStatus(coupon.id, "unverified")}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-[#94a3b8] transition hover:bg-white/5"
          >
            Voltar para não verificado
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  onNavigate: (id: PageId) => void;
}

export default function Cupons({ onNavigate }: Props) {
  const {
    loggedIn,
    sessionLoading,
    coupons,
    loading,
    message,
    addCoupon,
    setStatus,
    removeCoupon,
  } = useCoupons();

  const [store, setStore] = useState(STORE_OPTIONS[0]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percent");
  const [value, setValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rules, setRules] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [priceText, setPriceText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const price = parsePrice(priceText);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const discountValue = parsePrice(value);
    if (code.trim() === "") {
      setFormError("Digite o código do cupom.");
      return;
    }
    if (discountValue === null) {
      setFormError("Digite um valor de desconto válido.");
      return;
    }
    if (type === "percent" && discountValue > 100) {
      setFormError("Desconto em porcentagem não pode passar de 100.");
      return;
    }
    if (minPurchase.trim() !== "" && parsePrice(minPurchase) === null) {
      setFormError("A compra mínima não é válida. Exemplo: 500,00");
      return;
    }
    if (maxDiscount.trim() !== "" && parsePrice(maxDiscount) === null) {
      setFormError("O desconto máximo não é válido. Exemplo: 100,00");
      return;
    }
    setFormError("");
    setSaving(true);
    const ok = await addCoupon({
      store,
      code: code.trim().toUpperCase(),
      discountType: type,
      discountValue,
      minPurchase: parsePrice(minPurchase),
      maxDiscount: parsePrice(maxDiscount),
      rules: rules.trim(),
      sourceUrl: /^https?:\/\//i.test(sourceUrl.trim()) ? sourceUrl.trim() : "",
      validUntil: validUntil === "" ? null : validUntil,
    });
    setSaving(false);
    if (ok) {
      setCode("");
      setValue("");
      setMinPurchase("");
      setMaxDiscount("");
      setValidUntil("");
      setSourceUrl("");
      setRules("");
    }
  }

  const visible = coupons.filter(
    (c) => filter === "all" || effectiveStatus(c) === filter
  );

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">Cupons</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Cupons com status de verificação e cálculo do preço final.
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          Nenhum serviço gratuito consegue testar sozinho se um cupom funciona.
          Por isso, todo cupom cadastrado começa como{" "}
          <strong>não verificado</strong>. Ele só passa a{" "}
          <strong>válido</strong> quando você confirma que funcionou na loja, e
          o SmartDeal guarda a data. Cupons com a validade vencida aparecem
          como <strong>expirados</strong>.
        </p>
      </div>

      {sessionLoading ? (
        <p className="mt-8 text-sm text-[#94a3b8]">Carregando...</p>
      ) : !loggedIn ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-8 text-center">
          <Ticket size={32} className="mx-auto text-[#8b5cf6]" />
          <p className="mt-3 font-semibold">Entre para usar os cupons</p>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Seus cupons ficam guardados na sua conta.
          </p>
          <button
            onClick={() => onNavigate("perfil")}
            className="mt-4 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#7c4ee8]"
          >
            Ir para Meu Perfil
          </button>
        </div>
      ) : (
        <>
          {message !== "" && (
            <p className="mt-4 text-sm text-[#ef4444]">{message}</p>
          )}

          <form
            onSubmit={submit}
            className="mt-6 rounded-2xl border border-white/10 bg-[#171d2a] p-5"
          >
            <p className="mb-4 font-semibold">Cadastrar cupom</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className={inputClass}
              >
                {STORE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código do cupom"
                className={inputClass}
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DiscountType)}
                className={inputClass}
              >
                <option value="percent">Desconto em porcentagem (%)</option>
                <option value="fixed">Desconto em valor (R$)</option>
              </select>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  type === "percent" ? "Valor (ex.: 10)" : "Valor (ex.: 50,00)"
                }
                inputMode="decimal"
                className={inputClass}
              />
              <input
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                placeholder="Compra mínima (opcional)"
                inputMode="decimal"
                className={inputClass}
              />
              <input
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Desconto máximo (opcional)"
                inputMode="decimal"
                className={inputClass}
              />
              <div>
                <label className="mb-1 block text-xs text-[#94a3b8]">
                  Validade (opcional)
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#94a3b8]">
                  Onde encontrei (opcional)
                </label>
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="Link, começa com https://"
                  className={inputClass}
                />
              </div>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Regras de uso (opcional): categorias, pagamento, primeira compra..."
                rows={2}
                className={`${inputClass} sm:col-span-2`}
              />
            </div>
            {formError !== "" && (
              <p className="mt-3 text-sm text-[#ef4444]">{formError}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#7c4ee8] disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? "Salvando..." : "Cadastrar cupom"}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#171d2a] p-5">
            <p className="font-semibold">Calcular preço final</p>
            <p className="mt-1 text-sm text-[#94a3b8]">
              Digite o preço de um produto para ver quanto ele ficaria com cada
              cupom.
            </p>
            <input
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder="Preço do produto (ex.: 1.299,90)"
              inputMode="decimal"
              className={`${inputClass} mt-3 sm:max-w-xs`}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  filter === f.id
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/15 text-white"
                    : "border-white/10 text-[#94a3b8] hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && coupons.length === 0 ? (
            <p className="mt-6 text-sm text-[#94a3b8]">
              Carregando seus cupons...
            </p>
          ) : visible.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
              {coupons.length === 0
                ? "Nenhum cupom cadastrado ainda."
                : "Nenhum cupom neste filtro."}
            </div>
          ) : (
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {visible.map((c) => (
                <CouponCard
                  key={c.id}
                  coupon={c}
                  price={price}
                  onStatus={setStatus}
                  onRemove={removeCoupon}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
