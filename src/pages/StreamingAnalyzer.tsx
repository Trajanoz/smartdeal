import { useState } from "react";
import { Info, ExternalLink, RefreshCw } from "lucide-react";
import { CPUS, GPUS, RAMS } from "../data/parts";
import {
  analyzeStream,
  type Encoder,
  type Platform,
  type Rating,
} from "../lib/streaming";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

const RATING_STYLE: Record<Rating, string> = {
  Excelente: "bg-[#22c55e]/15 text-[#22c55e]",
  Boa: "bg-[#3b82f6]/15 text-[#60a5fa]",
  Limitada: "bg-[#f59e0b]/15 text-[#f59e0b]",
  "Não recomendada": "bg-[#ef4444]/15 text-[#ef4444]",
  Indisponível: "bg-white/10 text-[#94a3b8]",
};

function fromBuilder() {
  try {
    const raw = localStorage.getItem("smartdeal:builder:v1");
    if (raw) {
      const p = JSON.parse(raw) as { sel?: { cpu?: string; gpu?: string; ram?: string } };
      return {
        cpu: p.sel?.cpu ?? "",
        gpu: p.sel?.gpu ?? "",
        ram: p.sel?.ram ?? "",
      };
    }
  } catch {
    // começa vazio
  }
  return { cpu: "", gpu: "", ram: "" };
}

function parseMbps(text: string): number | null {
  const n = Number(text.replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

function RatingCard({
  title,
  rating,
  text,
}: {
  title: string;
  rating: Rating | null;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{title}</p>
        {rating && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RATING_STYLE[rating]}`}>
            {rating}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-[#cbd5e1]">{text}</p>
    </div>
  );
}

export default function StreamingAnalyzer() {
  const initial = fromBuilder();
  const [cpu, setCpu] = useState(initial.cpu);
  const [gpu, setGpu] = useState(initial.gpu);
  const [ram, setRam] = useState(initial.ram);
  const [encoder, setEncoder] = useState<Encoder>("auto");
  const [platform, setPlatform] = useState<Platform>("twitch");
  const [uploadText, setUploadText] = useState("");

  const result = analyzeStream({
    cpu,
    gpu,
    ram,
    encoder,
    platform,
    uploadMbps: parseMbps(uploadText),
  });

  function importBuilder() {
    const b = fromBuilder();
    setCpu(b.cpu);
    setGpu(b.gpu);
    setRam(b.ram);
  }

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">Streaming Analyzer</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Avalie se o PC consegue jogar e transmitir em Full HD a 60 FPS.
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          A análise usa regras baseadas em como cada encoder funciona e no que
          as plataformas recomendam. Ela <strong>não mede FPS</strong>: o
          impacto nos jogos é uma avaliação qualitativa, e o Simulador de FPS
          ainda não está disponível. As avaliações do x264 e da memória são
          regras práticas, não medições.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#171d2a] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">Seu computador e sua internet</p>
          <button
            onClick={importBuilder}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs transition hover:bg-white/5"
          >
            <RefreshCw size={13} /> Usar minha montagem do PC Builder
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select value={cpu} onChange={(e) => setCpu(e.target.value)} className={inputClass}>
            <option value="">Escolha o processador</option>
            {CPUS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={gpu} onChange={(e) => setGpu(e.target.value)} className={inputClass}>
            <option value="">Sem placa de vídeo dedicada</option>
            {GPUS.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select value={ram} onChange={(e) => setRam(e.target.value)} className={inputClass}>
            <option value="">Memória RAM (opcional)</option>
            {RAMS.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select
            value={encoder}
            onChange={(e) => setEncoder(e.target.value as Encoder)}
            className={inputClass}
          >
            <option value="auto">Encoder: automático (recomendado)</option>
            <option value="nvenc">Encoder: NVIDIA NVENC</option>
            <option value="amf">Encoder: AMD AMF</option>
            <option value="qsv">Encoder: Intel Quick Sync</option>
            <option value="x264">Encoder: x264 (processador)</option>
          </select>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className={inputClass}
          >
            <option value="twitch">Plataforma: Twitch</option>
            <option value="youtube">Plataforma: YouTube</option>
          </select>
          <input
            value={uploadText}
            onChange={(e) => setUploadText(e.target.value)}
            placeholder="Velocidade de upload em Mbps (ex.: 20)"
            inputMode="decimal"
            className={inputClass}
          />
        </div>
      </div>

      {!result ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
          Escolha o processador para ver a análise.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <RatingCard
            title={"Capacidade de transmitir (" + result.encoderName + ")"}
            rating={result.encodeRating}
            text={result.encodeText}
          />
          <RatingCard
            title="Jogar e transmitir ao mesmo tempo"
            rating={result.bothRating}
            text={result.bothText}
          />
          <RatingCard
            title="Sua internet"
            rating={result.netRating}
            text={result.netText}
          />

          <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
            <p className="font-semibold">Configurações recomendadas no OBS</p>
            <dl className="mt-3 divide-y divide-white/10 text-sm">
              {result.settings.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between">
                  <dt className="text-[#94a3b8]">{k}</dt>
                  <dd className="sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
              <p className="font-semibold">Uso de recursos (qualitativo)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#cbd5e1]">
                {result.resources.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5">
              <p className="font-semibold">Gargalos e limitações</p>
              {result.bottlenecks.length === 0 ? (
                <p className="mt-2 text-sm text-[#94a3b8]">
                  Nenhum gargalo encontrado pelas regras desta análise.
                </p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#cbd5e1]">
                  {result.bottlenecks.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171d2a] p-5 text-xs text-[#94a3b8]">
            <p className="mb-2 font-semibold text-[#cbd5e1]">Fontes e observações</p>
            <ul className="space-y-1">
              <li>
                Bitrates do Twitch (1080p60 a 6000 kbps, 720p60 a 4500 kbps,
                720p30 a 3000 kbps): recomendações do Twitch, citadas em guias
                como o do Streamlabs.
              </li>
              <li>
                Bitrates do YouTube: o app sugere valores dentro da faixa da
                página de ajuda, que muda com o tempo. Confira a página atual.
              </li>
              <li>
                Upload necessário: o app exige pelo menos 1,2 vez o bitrate e
                considera 1,5 vez uma margem confortável. É uma regra prática.
              </li>
              <li className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[#3b82f6]">
                <a href="https://www.nvidia.com/en-gb/geforce/news/broadcasting-guide/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  Guia NVIDIA <ExternalLink size={11} />
                </a>
                <a href="https://obsproject.com/kb/hardware-encoding" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  OBS: codificação por hardware <ExternalLink size={11} />
                </a>
                <a href="https://support.google.com/youtube/answer/2853702" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  Ajuda do YouTube <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
