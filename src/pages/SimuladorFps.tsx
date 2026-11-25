import { useState } from "react";
import { Info, ExternalLink, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { GPUS } from "../data/parts";
import { COMPARISONS } from "../data/comparisons";
import { MEASURED, FPS_SOURCE, GAMES, type FpsRes } from "../data/fps";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

const RESOLUTIONS: FpsRes[] = ["1080p", "1440p", "4K"];

const nameOf = (id: string) => GPUS.find((g) => g.id === id)?.name ?? id;

function measured(gpuId: string, res: FpsRes): number | null {
  return MEASURED.find((m) => m.gpu === gpuId)?.fps[res] ?? null;
}

interface Estimate {
  avg: number;
  low: number;
  high: number;
  baseName: string;
  count: number;
  sources: { name: string; url: string }[];
}

function estimate(gpuId: string, res: FpsRes): Estimate | null {
  for (const c of COMPARISONS) {
    let baseId: string | null = null;
    let targetIsA = false;
    if (c.a === gpuId && measured(c.b, res) !== null) {
      baseId = c.b;
      targetIsA = true;
    } else if (c.b === gpuId && measured(c.a, res) !== null) {
      baseId = c.a;
      targetIsA = false;
    }
    if (!baseId) continue;

    const used = c.reports.filter(
      (r) =>
        r.value !== null &&
        r.mode === "padrão" &&
        (r.res === res || r.res === "misto")
    );
    if (used.length === 0) continue;

    const base = measured(baseId, res) as number;
    const values = used.map((r) => {
      const factor = 1 + (r.value as number) / 100;
      return targetIsA ? base * factor : base / factor;
    });
    return {
      avg: values.reduce((s, v) => s + v, 0) / values.length,
      low: Math.min(...values),
      high: Math.max(...values),
      baseName: nameOf(baseId),
      count: used.length,
      sources: used.map((r) => ({ name: r.source, url: r.url })),
    };
  }
  return null;
}

function fmt(v: number): string {
  return (Math.round(v * 10) / 10).toString().replace(".", ",");
}

export default function SimuladorFps() {
  const [gpuId, setGpuId] = useState("");
  const [res, setRes] = useState<FpsRes>("1080p");

  const gpu = GPUS.find((g) => g.id === gpuId) ?? null;
  const direct = gpu ? measured(gpu.id, res) : null;
  const est = gpu && direct === null ? estimate(gpu.id, res) : null;

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">Simulador de FPS</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Estimativas de FPS baseadas em benchmarks reais.
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          O SmartDeal só mostra FPS que vêm de benchmarks publicados, sempre
          com a fonte. Resultados <strong>medidos</strong> e{" "}
          <strong>estimados</strong> aparecem separados. Quando não há dado,
          o app diz "dados insuficientes" em vez de inventar. Nenhum número
          aqui garante o desempenho exato no seu computador.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#171d2a] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={gpuId} onChange={(e) => setGpuId(e.target.value)} className={inputClass}>
            <option value="">Escolha a placa de vídeo</option>
            {GPUS.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select value={res} onChange={(e) => setRes(e.target.value as FpsRes)} className={inputClass}>
            {RESOLUTIONS.map((r) => (
              <option key={r} value={r}>Resolução: {r}</option>
            ))}
          </select>
        </div>
      </div>

      {!gpu ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
          Escolha uma placa de vídeo para ver o desempenho.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {direct !== null ? (
            <div className="rounded-2xl border border-[#22c55e]/30 bg-[#171d2a] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#22c55e]">
                <CheckCircle2 size={16} /> Resultado medido
              </p>
              <p className="mt-2 text-3xl font-bold">{fmt(direct)} FPS</p>
              <p className="text-sm text-[#94a3b8]">
                média em {res} com a {gpu.name}
              </p>
              <p className="mt-3 text-xs text-[#cbd5e1]">{FPS_SOURCE.what}</p>
              <a
                href={FPS_SOURCE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#3b82f6] hover:underline"
              >
                {FPS_SOURCE.name}, {FPS_SOURCE.period} (consultado em {FPS_SOURCE.consulted}){" "}
                <ExternalLink size={11} />
              </a>
            </div>
          ) : est ? (
            <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#171d2a] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#f59e0b]">
                <AlertTriangle size={16} /> Estimativa, não é medição
              </p>
              <p className="mt-2 text-3xl font-bold">{fmt(est.avg)} FPS</p>
              <p className="text-sm text-[#94a3b8]">
                margem de incerteza: de {fmt(est.low)} a {fmt(est.high)} FPS
              </p>
              <p className="mt-3 text-xs text-[#cbd5e1]">
                Calculada a partir do FPS medido da {est.baseName} em {res} e
                de {est.count === 1 ? "1 comparativo publicado" : est.count + " comparativos publicados"} entre as duas placas.
                {est.count === 1 &&
                  " Há só uma fonte, então a faixa não mostra a divergência real entre testes."}{" "}
                Os comparativos medem outros jogos e outras configurações, então o
                erro real pode ser maior que a faixa mostrada.
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {est.sources.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#3b82f6] hover:underline">
                      {s.name} <ExternalLink size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#94a3b8]">
                <HelpCircle size={16} /> Dados insuficientes
              </p>
              <p className="mt-2 text-sm text-[#cbd5e1]">
                Não há benchmark medido nem comparativo publicado que permita
                estimar a {gpu.name} em {res} no banco do SmartDeal.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
            <p className="font-semibold">O que este resultado não inclui</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#cbd5e1]">
              <li>FPS por jogo: nenhum benchmark por jogo registrado.</li>
              <li>1% low (queda de desempenho): sem dados.</li>
              <li>DLSS, FSR, XeSS, Frame Generation e ray tracing: sem dados nesta fonte.</li>
              <li>Efeito do processador e da memória: sem dados.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
            <p className="font-semibold">Jogos</p>
            <p className="mt-1 text-xs text-[#94a3b8]">
              Situação dos benchmarks por jogo para {gpu.name} em {res}.
            </p>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {GAMES.map((g) => (
                <li key={g} className="flex items-center justify-between rounded-lg bg-[#121622] px-3 py-2">
                  <span>{g}</span>
                  <span className="text-xs text-[#94a3b8]">dados insuficientes</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[#94a3b8]">
              O GTA VI ainda não tem benchmarks de PC que eu conheça.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
