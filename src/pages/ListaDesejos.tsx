import { useState, type FormEvent } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  BellRing,
  Info,
  TrendingDown,
  CloudUpload,
} from "lucide-react";
import { STORES } from "../stores";
import {
  useWishlist,
  parsePrice,
  formatBRL,
  formatDate,
  type PricePoint,
  type WishItem,
} from "../lib/wishlist";

const CATEGORIES = [
  "Placa de vídeo",
  "Processador",
  "Placa-mãe",
  "Memória RAM",
  "Armazenamento",
  "Fonte",
  "Gabinete",
  "Refrigeração",
  "Monitor",
  "Periféricos",
  "Outros",
];

const STORE_OPTIONS = [...STORES.map((s) => s.name), "Outra loja"];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

function Sparkline({ points }: { points: PricePoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-xs text-[#94a3b8]">
        Registre mais um preço para ver o gráfico de variação.
      </p>
    );
  }
  const w = 280;
  const h = 60;
  const pad = 4;
  const values = points.map((p) => p.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.price - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-16 w-full"
      role="img"
      aria-label="Variação do preço registrado"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface CardProps {
  item: WishItem;
  onAddPrice: (id: string, price: number) => void;
  onRemove: (id: string) => void;
}

function WishCard({ item, onAddPrice, onRemove }: CardProps) {
  const [priceText, setPriceText] = useState("");
  const [error, setError] = useState("");

  const last = item.history.length
    ? item.history[item.history.length - 1]
    : null;
  const lowest = item.history.length
    ? item.history.reduce((a, b) => (b.price < a.price ? b : a))
    : null;
  const reached =
    last !== null && item.targetPrice !== null && last.price <= item.targetPrice;

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = parsePrice(priceText);
    if (value === null) {
      setError("Digite um preço válido, por exemplo 1.299,90");
      return;
    }
    setError("");
    onAddPrice(item.id, value);
    setPriceText("");
  }

  function remove() {
    if (window.confirm("Remover este produto da lista?")) {
      onRemove(item.id);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{item.name}</p>
          <p className="mt-0.5 text-xs text-[#94a3b8]">{item.store}</p>
        </div>
        <button
          onClick={remove}
          aria-label="Remover produto"
          className="rounded-lg p-2 text-[#94a3b8] transition hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {reached && (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#22c55e]/15 px-2.5 py-0.5 text-xs text-[#22c55e]">
          <BellRing size={12} />
          Meta atingida
        </span>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-[#94a3b8]">Último preço</p>
          <p className="font-semibold">
            {last ? formatBRL(last.price) : "não registrado"}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94a3b8]">Menor registrado</p>
          <p className="flex items-center gap-1 font-semibold text-[#22c55e]">
            {lowest ? (
              <>
                <TrendingDown size={14} />
                {formatBRL(lowest.price)}
              </>
            ) : (
              <span className="text-[#94a3b8]">não registrado</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94a3b8]">Preço desejado</p>
          <p className="font-semibold">
            {item.targetPrice !== null
              ? formatBRL(item.targetPrice)
              : "não definido"}
          </p>
        </div>
      </div>

      {last && (
        <p className="mt-2 text-xs text-[#94a3b8]">
          Último registro em {formatDate(last.date)}
        </p>
      )}

      <div className="mt-4">
        <Sparkline points={item.history} />
      </div>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={priceText}
          onChange={(e) => setPriceText(e.target.value)}
          placeholder="Novo preço visto na loja"
          inputMode="decimal"
          className={inputClass}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#8b5cf6] px-4 text-sm font-semibold transition hover:bg-[#7c4ee8]"
        >
          Registrar
        </button>
      </form>
      {error !== "" && (
        <p className="mt-2 text-xs text-[#ef4444]">{error}</p>
      )}

      {item.url !== "" && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm text-[#3b82f6] hover:underline"
        >
          Abrir na loja <ExternalLink size={14} />
        </a>
      )}

      {item.history.length > 0 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-[#94a3b8]">
            Histórico de preços ({item.history.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-[#94a3b8]">
            {[...item.history].reverse().map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{formatDate(p.date)}</span>
                <span className="text-white">{formatBRL(p.price)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export default function ListaDesejos() {
  const {
    items,
    cloud,
    loading,
    message,
    pendingLocal,
    addItem,
    removeItem,
    addPrice,
    importLocal,
  } = useWishlist();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [store, setStore] = useState(STORE_OPTIONS[0]);
  const [url, setUrl] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [formError, setFormError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() === "") {
      setFormError("Digite o nome do produto.");
      return;
    }
    if (current.trim() !== "" && parsePrice(current) === null) {
      setFormError("O preço atual não é válido. Exemplo: 1.299,90");
      return;
    }
    if (target.trim() !== "" && parsePrice(target) === null) {
      setFormError("O preço desejado não é válido. Exemplo: 1.100,00");
      return;
    }
    setFormError("");
    addItem({
      name: name.trim(),
      category,
      store,
      url: /^https?:\/\//i.test(url.trim()) ? url.trim() : "",
      targetPrice: parsePrice(target),
      currentPrice: parsePrice(current),
    });
    setName("");
    setUrl("");
    setCurrent("");
    setTarget("");
  }

  const groups = CATEGORIES.map((c) => ({
    category: c,
    items: items.filter((i) => i.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">Lista de Desejos</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Acompanhe os preços dos produtos que você quer comprar.
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          {cloud
            ? "Sua lista está salva na sua conta e aparece em qualquer aparelho em que você entrar. "
            : "A lista fica salva neste navegador e neste aparelho. Para guardá-la na sua conta e ver em qualquer aparelho, entre em Meu Perfil. "}
          Os preços são os que você registra, conferindo no site da loja. O
          aviso de meta atingida aparece aqui dentro do site.
        </p>
      </div>

      {pendingLocal > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[#cbd5e1]">
            Você tem {pendingLocal}{" "}
            {pendingLocal === 1 ? "produto salvo" : "produtos salvos"} neste
            navegador, ainda fora da sua conta.
          </p>
          <button
            onClick={importLocal}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-4 py-2 font-semibold transition hover:bg-[#7c4ee8] disabled:opacity-60"
          >
            <CloudUpload size={16} />
            Importar para minha conta
          </button>
        </div>
      )}

      {message !== "" && (
        <p className="mt-4 text-sm text-[#ef4444]">{message}</p>
      )}

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-white/10 bg-[#171d2a] p-5"
      >
        <p className="mb-4 font-semibold">Adicionar produto</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do produto (ex.: RTX 5070 12 GB)"
            className={`${inputClass} sm:col-span-2`}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Preço atual (opcional)"
            inputMode="decimal"
            className={inputClass}
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Preço desejado (opcional)"
            inputMode="decimal"
            className={inputClass}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link do produto na loja (opcional, começa com https://)"
            className={`${inputClass} sm:col-span-2`}
          />
        </div>
        {formError !== "" && (
          <p className="mt-3 text-sm text-[#ef4444]">{formError}</p>
        )}
        <button
          type="submit"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#7c4ee8]"
        >
          <Plus size={16} />
          Adicionar à lista
        </button>
      </form>

      {loading && items.length === 0 ? (
        <p className="mt-8 text-sm text-[#94a3b8]">Carregando sua lista...</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
          Sua lista está vazia. Adicione o primeiro produto acima.
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.category} className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8b5cf6]">
              {g.category}
            </h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {g.items.map((item) => (
                <WishCard
                  key={item.id}
                  item={item}
                  onAddPrice={addPrice}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
