import { useState } from "react";
import { Info, ExternalLink, HelpCircle } from "lucide-react";
import { CPUS, GPUS } from "../data/parts";
import { COMPARISONS, type Report, type Res, type Mode } from "../data/comparisons";
import { parsePrice, formatBRL } from "../lib/wishlist";

type Kind = "gpu" | "cpu";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

const inv = (v: number) => (100 / (100 + v) - 1) * 100;

function pct(v: number): string {
  const r = Math.round(v * 10) / 10;
  return (r > 0 ? "+" : "") + r.toString().replace(".", ",") + "%";
}

interface SpecRow {
  label: string;
  a: string;
  b: string;
}

const RES_ORDER: Res[] = ["1080p", "1440p", "4K", "misto"];

function resLabel(r: Res): string {
  return r === "misto" ? "Resoluções variadas" : r;
}

export default function Comparador() {
  const [kind, setKind] = useState<Kind>("gpu");
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");
  const [priceA, setPriceA] = useState("");
  const [priceB, setPriceB] = useState("");

  const list = kind === "gpu" ? GPUS : CPUS;
  const itemA = list.find((x) => x.id === idA) ?? null;
  const itemB = list.find((x) => x.id === idB) ?? null;

  function changeKind(k: Kind) {
    setKind(k);
    setIdA("");
    setIdB("");
  }

  // Comparativos publicados, orientados de A para B
  let reports: Report[] = [];
  if (itemA && itemB && itemA.id !== itemB.id) {
    const direct = COMPARISONS.find((c) => c.a === itemA.id && c.b === itemB.id);
    const reverse = COMPARISONS.find((c) => c.a === itemB.id && c.b === itemA.id);
    if (direct) {
      reports = direct.reports;
    } else if (reverse) {
      reports = reverse.reports.map((r) => ({
        ...r,
        value: r.value === null ? null : inv(r.value),
      }));
    }
  }

  const groups = new Map<string, Report[]>();
  for (const r of reports) {
    const key = r.res + "|" + r.mode;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const groupKeys = [...groups.keys()].sort((x, y) => {
    const [rx, mx] = x.split("|") as [Res, Mode];
    const [ry, my] = y.split("|") as [Res, Mode];
    if (mx !== my) return mx === "padrão" ? -1 : 1;
    return RES_ORDER.indexOf(rx) - RES_ORDER.indexOf(ry);
  });

  const standardValues = reports
    .filter((r) => r.mode === "padrão" && r.value !== null)
    .map((r) => r.value as number);
  const avgStandard = standardValues.length
    ? standardValues.reduce((s, v) => s + v, 0) / standardValues.length
    : null;

  // Especificações
  let specs: SpecRow[] = [];
  let powerA: number | null = null;
  let powerB: number | null = null;
  if (itemA && itemB) {
    if (kind === "gpu") {
      const a = GPUS.find((x) => x.id === itemA.id)!;
      const b = GPUS.find((x) => x.id === itemB.id)!;
      powerA = a.tgp;
      powerB = b.tgp;
      specs = [
        { label: "Memória de vídeo", a: a.vramGb + " GB", b: b.vramGb + " GB" },
        { label: "Consumo de referência (TGP/TBP)", a: a.tgp + " W", b: b.tgp + " W" },
        { label: "Fonte recomendada pelo fabricante", a: a.recommendedPsu + " W", b: b.recommendedPsu + " W" },
      ];
    } else {
      const a = CPUS.find((x) => x.id === itemA.id)!;
      const b = CPUS.find((x) => x.id === itemB.id)!;
      powerA = a.power;
      powerB = b.power;
      specs = [
        { label: "Núcleos e threads", a: a.cores + " / " + a.threads, b: b.cores + " / " + b.threads },
        { label: "Socket", a: a.socket, b: b.socket },
        { label: "Memória aceita", a: a.ramTypes.join(" ou "), b: b.ramTypes.join(" ou ") },
        { label: "Consumo máximo de referência", a: a.power + " W", b: b.power + " W" },
        { label: "Vídeo integrado", a: a.igpu ? "Sim" : "Não", b: b.igpu ? "Sim" : "Não" },
        { label: "Cooler na caixa", a: a.boxCooler ? "Sim" : "Não", b: b.boxCooler ? "Sim" : "Não" },
      ];
    }
  }

  const pA = parsePrice(priceA);
  const pB = parsePrice(priceB);
  const priceDiff = pA !== null && pB !== null ? ((pA - pB) / pB) * 100 : null;
  const valueDiff =
    pA !== null && pB !== null && avgStandard !== null
      ? (1 + avgStandard / 100) * (pB / pA) * 100 - 100
      : null;
  const powerDiff =
    powerA !== null && powerB !== null ? ((powerA - powerB) / powerB) * 100 : null;

  const same = itemA !== null && itemB !== null && itemA.id === itemB.id;

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">Comparador de Hardware</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Compare componentes lado a lado.
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          As especificações vêm do catálogo. O desempenho vem de comparativos
          publicados por sites de teste, cada um com fonte e link, e só existe
          para alguns pares. Os resultados mudam conforme os jogos, a
          resolução e o computador usado em cada teste, por isso o app mostra
          todos os testes e a faixa entre eles. Consultados em 24/11/2026; a
          data de publicação de cada teste não foi registrada. Os preços são os
          que você digita.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#171d2a] p-5">
        <div className="mb-4 grid max-w-xs grid-cols-2 gap-1 rounded-xl bg-[#121622] p-1 text-sm">
          {(["gpu", "cpu"] as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => changeKind(k)}
              className={`rounded-lg py-2 transition ${
                kind === k ? "bg-[#8b5cf6]/20 text-white" : "text-[#94a3b8]"
              }`}
            >
              {k === "gpu" ? "Placas de vídeo" : "Processadores"}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <select value={idA} onChange={(e) => setIdA(e.target.value)} className={inputClass}>
              <option value="">Escolha o item A</option>
              {list.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
            <input
              value={priceA}
              onChange={(e) => setPriceA(e.target.value)}
              placeholder="Preço do item A (opcional)"
              inputMode="decimal"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <select value={idB} onChange={(e) => setIdB(e.target.value)} className={inputClass}>
              <option value="">Escolha o item B</option>
              {list.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
            <input
              value={priceB}
              onChange={(e) => setPriceB(e.target.value)}
              placeholder="Preço do item B (opcional)"
              inputMode="decimal"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {!itemA || !itemB ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
          Escolha dois itens para comparar.
        </div>
      ) : same ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
          Escolha dois itens diferentes.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
            <p className="font-semibold">Especificações</p>
            <div className="mt-3 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-2 text-xs text-[#94a3b8]">
                <span></span>
                <span className="font-semibold text-white">{itemA.name}</span>
                <span className="font-semibold text-white">{itemB.name}</span>
              </div>
              {specs.map((s) => (
                <div key={s.label} className="grid grid-cols-3 gap-2 border-b border-white/5 py-2">
                  <span className="text-xs text-[#94a3b8]">{s.label}</span>
                  <span>{s.a}</span>
                  <span>{s.b}</span>
                </div>
              ))}
            </div>
            {powerDiff !== null && (
              <p className="mt-3 text-xs text-[#94a3b8]">
                Consumo de referência do item A em relação ao B: {pct(powerDiff)}.
              </p>
            )}
            <p className="mt-2 flex items-center gap-1 text-xs text-[#94a3b8]">
              <HelpCircle size={12} /> Temperaturas: sem dados registrados no catálogo.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
            <p className="font-semibold">Desempenho publicado (A em relação a B)</p>
            {reports.length === 0 ? (
              <p className="mt-2 text-sm text-[#94a3b8]">
                Sem comparativo publicado para este par no banco do SmartDeal.
                Dados insuficientes para comparar desempenho.
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {groupKeys.map((key) => {
                  const [res, mode] = key.split("|") as [Res, Mode];
                  const rs = groups.get(key)!;
                  const nums = rs.filter((r) => r.value !== null).map((r) => r.value as number);
                  const min = nums.length ? Math.min(...nums) : null;
                  const max = nums.length ? Math.max(...nums) : null;
                  return (
                    <div key={key}>
                      <p className="text-sm font-semibold text-[#8b5cf6]">
                        {resLabel(res)}
                        {mode === "ray tracing" ? ", com ray tracing" : ""}
                        {min !== null && max !== null && (
                          <span className="ml-2 font-normal text-white">
                            {min === max ? pct(min) : pct(min) + " a " + pct(max)}
                          </span>
                        )}
                      </p>
                      <ul className="mt-1 space-y-1.5 text-xs text-[#cbd5e1]">
                        {rs.map((r, i) => (
                          <li key={i}>
                            {r.value !== null && (
                              <strong className="mr-1 text-white">{pct(r.value)}:</strong>
                            )}
                            {r.text}{" "}
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#3b82f6] hover:underline"
                            >
                              {r.source} <ExternalLink size={11} />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                <p className="text-xs text-[#94a3b8]">
                  Valores positivos: o item A é mais rápido que o B. Negativos:
                  mais lento. Quando o teste original comparava na ordem
                  inversa, o app converteu o valor.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
            <p className="font-semibold">Preço e custo-benefício</p>
            {pA === null || pB === null ? (
              <p className="mt-2 text-sm text-[#94a3b8]">
                Digite o preço dos dois itens acima para calcular a diferença.
              </p>
            ) : (
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  {formatBRL(pA)} contra {formatBRL(pB)}: o item A custa{" "}
                  <strong>{pct(priceDiff as number)}</strong> em relação ao B.
                </p>
                {valueDiff !== null ? (
                  <p>
                    Usando a média dos testes padrão ({pct(avgStandard as number)}), o
                    item A entrega <strong>{pct(valueDiff)}</strong> de desempenho
                    por real em relação ao B. É uma estimativa: ela herda a
                    margem de incerteza dos testes.
                  </p>
                ) : (
                  <p className="text-[#94a3b8]">
                    Sem desempenho publicado para este par, o custo-benefício
                    não pode ser calculado.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
