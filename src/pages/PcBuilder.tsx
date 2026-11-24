import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  CPUS,
  GPUS,
  MOBOS,
  RAMS,
  STORAGE,
  PSUS,
  CASES,
  COOLERS,
} from "../data/parts";
import {
  analyze,
  EMPTY_SELECTION,
  type Level,
  type Selection,
} from "../lib/compat";
import { STORES } from "../stores";
import { parsePrice, formatBRL } from "../lib/wishlist";

type RowKey =
  | "cpu"
  | "mobo"
  | "gpu"
  | "ram"
  | "storage0"
  | "storage1"
  | "psu"
  | "case"
  | "cooler";

interface Option {
  id: string;
  name: string;
  search: string;
}

interface Row {
  key: RowKey;
  label: string;
  emptyLabel: string;
  options: Option[];
}

const ROWS: Row[] = [
  { key: "cpu", label: "Processador", emptyLabel: "Escolha o processador", options: CPUS },
  { key: "mobo", label: "Placa-mãe", emptyLabel: "Escolha a placa-mãe", options: MOBOS },
  { key: "gpu", label: "Placa de vídeo", emptyLabel: "Nenhuma (usar vídeo integrado)", options: GPUS },
  { key: "ram", label: "Memória RAM", emptyLabel: "Escolha a memória", options: RAMS },
  { key: "storage0", label: "Armazenamento 1", emptyLabel: "Escolha o armazenamento", options: STORAGE },
  { key: "storage1", label: "Armazenamento 2 (opcional)", emptyLabel: "Nenhum", options: STORAGE },
  { key: "psu", label: "Fonte", emptyLabel: "Escolha a fonte", options: PSUS },
  { key: "case", label: "Gabinete", emptyLabel: "Escolha o gabinete", options: CASES },
  { key: "cooler", label: "Cooler / refrigeração", emptyLabel: "Usar o cooler do processador (se houver)", options: COOLERS },
];

const SEARCH_STORES = STORES.filter((s) =>
  ["kabum", "pichau", "terabyte"].includes(s.id)
);

const KEY = "smartdeal:builder:v1";

interface Saved {
  sel: Selection;
  prices: Record<string, string>;
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Saved>;
      return {
        sel: {
          ...EMPTY_SELECTION,
          ...(p.sel ?? {}),
          storage: [
            p.sel?.storage?.[0] ?? "",
            p.sel?.storage?.[1] ?? "",
          ],
        },
        prices: p.prices ?? {},
      };
    }
  } catch {
    // ignora e começa uma montagem vazia
  }
  return { sel: EMPTY_SELECTION, prices: {} };
}

function getVal(sel: Selection, key: RowKey): string {
  if (key === "storage0") return sel.storage[0];
  if (key === "storage1") return sel.storage[1];
  return sel[key];
}

function setVal(sel: Selection, key: RowKey, value: string): Selection {
  if (key === "storage0") return { ...sel, storage: [value, sel.storage[1]] };
  if (key === "storage1") return { ...sel, storage: [sel.storage[0], value] };
  return { ...sel, [key]: value };
}

const LEVEL_STYLE: Record<Level, { label: string; color: string; bg: string }> = {
  green: { label: "Compatível", color: "text-[#22c55e]", bg: "bg-[#22c55e]/15" },
  yellow: { label: "Compatível com ressalvas", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/15" },
  red: { label: "Incompatível", color: "text-[#ef4444]", bg: "bg-[#ef4444]/15" },
  gray: { label: "Informação insuficiente", color: "text-[#94a3b8]", bg: "bg-white/10" },
};

function LevelIcon({ level, size = 16 }: { level: Level; size?: number }) {
  const cls = LEVEL_STYLE[level].color;
  if (level === "green") return <CheckCircle2 size={size} className={cls} />;
  if (level === "yellow") return <AlertTriangle size={size} className={cls} />;
  if (level === "red") return <XCircle size={size} className={cls} />;
  return <HelpCircle size={size} className={cls} />;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

export default function PcBuilder() {
  const [saved, setSaved] = useState<Saved>(load);
  const { sel, prices } = saved;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      // sem armazenamento disponível
    }
  }, [saved]);

  const result = analyze(sel);

  function choose(key: RowKey, value: string) {
    setSaved((s) => ({ ...s, sel: setVal(s.sel, key, value) }));
  }

  function setPrice(key: RowKey, value: string) {
    setSaved((s) => ({ ...s, prices: { ...s.prices, [key]: value } }));
  }

  function reset() {
    if (window.confirm("Limpar toda a montagem atual?")) {
      setSaved({ sel: EMPTY_SELECTION, prices: {} });
    }
  }

  const chosenRows = ROWS.filter((r) => getVal(sel, r.key) !== "");
  const pricedRows = chosenRows.filter((r) => parsePrice(prices[r.key] ?? "") !== null);
  const total = pricedRows.reduce(
    (sum, r) => sum + (parsePrice(prices[r.key] ?? "") ?? 0),
    0
  );

  const overall = LEVEL_STYLE[result.overall];

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">PC Builder</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Monte seu computador com verificação de compatibilidade.
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          Processadores e placas de vídeo são modelos reais, com dados de
          referência dos fabricantes. Placa-mãe, memória, gabinete, cooler e
          fonte são escolhidos por categoria, porque os detalhes mudam de
          modelo para modelo. Depois de escolher a categoria, use os links para
          procurar um modelo específico nas lojas. Onde faltar dado, o
          resultado aparece em cinza, e nada é chutado. Os preços são os que
          você digita, conferindo na loja.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          {ROWS.map((row) => {
            const value = getVal(sel, row.key);
            const option = row.options.find((o) => o.id === value);
            return (
              <div
                key={row.key}
                className="rounded-2xl border border-white/10 bg-[#171d2a] p-4"
              >
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8b5cf6]">
                  {row.label}
                </label>
                <select
                  value={value}
                  onChange={(e) => choose(row.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">{row.emptyLabel}</option>
                  {row.options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>

                {option && (
                  <div className="mt-3 space-y-2">
                    <input
                      value={prices[row.key] ?? ""}
                      onChange={(e) => setPrice(row.key, e.target.value)}
                      placeholder="Preço visto na loja (opcional)"
                      inputMode="decimal"
                      className={inputClass}
                    />
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="text-[#94a3b8]">Procurar nas lojas:</span>
                      {SEARCH_STORES.map((s) => (
                        <a
                          key={s.id}
                          href={s.buildUrl(option.search)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#3b82f6] hover:underline"
                        >
                          {s.name} <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="lg:col-span-2">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#171d2a] p-5 lg:sticky lg:top-6">
            <div className={`rounded-xl p-3 ${overall.bg}`}>
              <p className="text-xs text-[#94a3b8]">Resultado geral</p>
              <p className={`flex items-center gap-2 font-semibold ${overall.color}`}>
                <LevelIcon level={result.overall} />
                {overall.label}
              </p>
            </div>

            {result.estimatedPeakW !== null && result.recommendedPsuW !== null && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#94a3b8]">Consumo máximo estimado</p>
                  <p className="font-semibold">{result.estimatedPeakW} W</p>
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8]">Fonte recomendada</p>
                  <p className="font-semibold">{result.recommendedPsuW} W ou mais</p>
                </div>
              </div>
            )}

            <ul className="space-y-3">
              {result.checks.map((c) => (
                <li key={c.id} className="flex gap-2 text-sm">
                  <span className="mt-0.5 shrink-0">
                    <LevelIcon level={c.level} />
                  </span>
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-xs text-[#94a3b8]">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-[#94a3b8]">Preço total informado</p>
              <p className="text-xl font-bold">{formatBRL(total)}</p>
              <p className="mt-1 text-xs text-[#94a3b8]">
                {pricedRows.length} de {chosenRows.length}{" "}
                {chosenRows.length === 1 ? "peça escolhida tem" : "peças escolhidas têm"}{" "}
                preço informado.
                {pricedRows.length < chosenRows.length &&
                  " O total não inclui as demais."}
              </p>
            </div>

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-[#94a3b8] transition hover:bg-white/5 hover:text-white"
            >
              <RotateCcw size={14} />
              Limpar montagem
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
