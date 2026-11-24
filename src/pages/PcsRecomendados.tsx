import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
  Wrench,
  ArrowUpCircle,
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
import { BUILDS, type RecBuild } from "../data/builds";
import { analyze } from "../lib/compat";
import { parsePrice, formatBRL } from "../lib/wishlist";
import type { PageId } from "../navigation";

const PRICES_KEY = "smartdeal:recommended-prices:v1";
const BUILDER_KEY = "smartdeal:builder:v1";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

const nameOf = (list: { id: string; name: string }[], id: string) =>
  list.find((x) => x.id === id)?.name ?? "";

function loadPrices(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PRICES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

interface CardProps {
  build: RecBuild;
  price: string;
  onPrice: (value: string) => void;
  onCustomize: () => void;
}

function BuildCard({ build, price, onPrice, onCustomize }: CardProps) {
  const result = analyze(build.sel);
  const count = (level: string) =>
    result.checks.filter((c) => c.level === level).length;
  const reds = count("red");
  const yellows = count("yellow");
  const grays = count("gray");
  const greens = count("green");
  const total = parsePrice(price);

  const parts: [string, string][] = [
    ["Processador", nameOf(CPUS, build.sel.cpu)],
    ["Placa-mãe", nameOf(MOBOS, build.sel.mobo)],
    [
      "Placa de vídeo",
      build.sel.gpu
        ? nameOf(GPUS, build.sel.gpu)
        : "Vídeo integrado do processador",
    ],
    ["Memória", nameOf(RAMS, build.sel.ram)],
    ...build.sel.storage
      .filter((id) => id !== "")
      .map((id, i): [string, string] => [
        "Armazenamento " + (i + 1),
        nameOf(STORAGE, id),
      ]),
    ["Fonte", nameOf(PSUS, build.sel.psu)],
    ["Gabinete", nameOf(CASES, build.sel.case)],
    [
      "Refrigeração",
      build.sel.cooler
        ? nameOf(COOLERS, build.sel.cooler)
        : "Cooler que acompanha o processador",
    ],
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#8b5cf6]">
        {build.tier}
      </p>
      <p className="mt-2 text-sm text-[#cbd5e1]">{build.tagline}</p>

      <ul className="mt-4 space-y-1.5 text-sm">
        {parts.map(([label, name], i) => (
          <li key={i} className="flex flex-col sm:flex-row sm:gap-3">
            <span className="w-36 shrink-0 text-xs text-[#94a3b8] sm:pt-0.5">
              {label}
            </span>
            <span>{name}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-[#94a3b8]">Consumo máximo estimado</p>
          <p className="font-semibold">{result.estimatedPeakW} W</p>
        </div>
        <div>
          <p className="text-xs text-[#94a3b8]">Fonte recomendada</p>
          <p className="font-semibold">{result.recommendedPsuW} W ou mais</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#121622] p-3 text-xs">
        <p className="mb-2 text-[#94a3b8]">Compatibilidade</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1 text-[#22c55e]">
            <CheckCircle2 size={13} /> {greens} compatíveis
          </span>
          <span className="inline-flex items-center gap-1 text-[#f59e0b]">
            <AlertTriangle size={13} /> {yellows} com ressalvas
          </span>
          <span className="inline-flex items-center gap-1 text-[#94a3b8]">
            <HelpCircle size={13} /> {grays} a conferir
          </span>
          <span className="inline-flex items-center gap-1 text-[#ef4444]">
            <XCircle size={13} /> {reds} incompatíveis
          </span>
        </div>
        <p className="mt-2 text-[#cbd5e1]">
          {reds === 0
            ? "Nenhuma incompatibilidade encontrada. Abra no PC Builder para ver os pontos a conferir."
            : "Há incompatibilidades. Abra no PC Builder para ver os detalhes."}
        </p>
      </div>

      <div className="mt-4">
        <p className="mb-1 flex items-center gap-1 text-xs text-[#94a3b8]">
          <ArrowUpCircle size={13} /> Possibilidades de upgrade
        </p>
        <ul className="list-disc space-y-0.5 pl-5 text-xs text-[#cbd5e1]">
          {build.upgrades.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs text-[#94a3b8]">
          Preço total que encontrei nas lojas (opcional)
        </label>
        <input
          value={price}
          onChange={(e) => onPrice(e.target.value)}
          placeholder="Ex.: 4.500,00"
          inputMode="decimal"
          className={inputClass}
        />
        {total !== null && (
          <p className="mt-1 text-sm font-semibold text-[#22c55e]">
            {formatBRL(total)}
          </p>
        )}
      </div>

      <button
        onClick={onCustomize}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#7c4ee8]"
      >
        <Wrench size={16} />
        Personalizar no PC Builder
      </button>
    </div>
  );
}

interface Props {
  onNavigate: (id: PageId) => void;
}

export default function PcsRecomendados({ onNavigate }: Props) {
  const [prices, setPrices] = useState<Record<string, string>>(loadPrices);
  const [budgetText, setBudgetText] = useState("");
  const [order, setOrder] = useState<"tier" | "price">("tier");

  useEffect(() => {
    try {
      localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
    } catch {
      // sem armazenamento disponível
    }
  }, [prices]);

  const budget = parsePrice(budgetText);

  let list = BUILDS.map((b) => ({
    build: b,
    price: parsePrice(prices[b.id] ?? ""),
  }));
  if (budget !== null) {
    list = list.filter((x) => x.price === null || x.price <= budget);
  }
  if (order === "price") {
    list = [...list].sort((a, b) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return a.price - b.price;
    });
  }
  const hiddenWithoutPrice =
    budget !== null ? list.filter((x) => x.price === null).length : 0;

  function customize(b: RecBuild) {
    if (
      !window.confirm(
        "Isto substitui a montagem atual do PC Builder. Continuar?"
      )
    ) {
      return;
    }
    try {
      localStorage.setItem(
        BUILDER_KEY,
        JSON.stringify({ sel: b.sel, prices: {} })
      );
    } catch {
      // sem armazenamento disponível
    }
    onNavigate("builder");
  }

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">PCs Recomendados</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Montagens sugeridas por faixa de desempenho.
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          As montagens usam as peças do catálogo do PC Builder e passam pelo
          mesmo motor de compatibilidade. O SmartDeal ainda não consulta preços
          automaticamente: some as peças nas lojas e informe o total em cada
          montagem. Só assim dá para ordenar por preço e filtrar pelo
          orçamento. Sem preço informado, a montagem aparece no fim da lista.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[#94a3b8]">
            Orçamento máximo (opcional)
          </label>
          <input
            value={budgetText}
            onChange={(e) => setBudgetText(e.target.value)}
            placeholder="Ex.: 6.000,00"
            inputMode="decimal"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#94a3b8]">Ordenar por</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "tier" | "price")}
            className={inputClass}
          >
            <option value="tier">Faixa de desempenho (padrão)</option>
            <option value="price">Menor preço informado</option>
          </select>
        </div>
      </div>

      {budget !== null && (
        <p className="mt-3 text-xs text-[#94a3b8]">
          O filtro esconde as montagens cujo preço informado passa do orçamento.
          {hiddenWithoutPrice > 0 &&
            " " +
              hiddenWithoutPrice +
              " montagem(ns) sem preço informado continua(m) na lista, pois não dá para comparar."}
        </p>
      )}

      {list.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
          Nenhuma montagem cabe nesse orçamento, entre as que têm preço
          informado.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {list.map(({ build }) => (
            <BuildCard
              key={build.id}
              build={build}
              price={prices[build.id] ?? ""}
              onPrice={(v) => setPrices((p) => ({ ...p, [build.id]: v }))}
              onCustomize={() => customize(build)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
