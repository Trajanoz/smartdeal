// Cada relatório: "value" = quanto o item A é MAIS RÁPIDO que o item B, em porcentagem.
// Valor negativo = A é mais lento. null = sem número, só o texto.
// Fonte: sites de teste, consultados em 24/11/2026. A data de publicação de cada teste não foi registrada.

export type Res = "1080p" | "1440p" | "4K" | "misto";
export type Mode = "padrão" | "ray tracing";

export interface Report {
  res: Res;
  mode: Mode;
  value: number | null;
  text: string;
  source: string;
  url: string;
}

export interface Comparison {
  a: string;
  b: string;
  reports: Report[];
}

const GN_5060 = "https://gamersnexus.net/gpus/forbidden-review-nvidia-rtx-5060-gpu-benchmarks";
const TS_5060 = "https://www.techspot.com/review/2992-nvidia-rtx-5060/";
const IGN_5060 = "https://www.aol.com/news/nvidia-geforce-rtx-5060-review-205239953.html";
const GN_5060TI = "https://gamersnexus.net/gpus/more-marketing-bs-nvidia-geforce-rtx-5060-ti-review-benchmarks-vs-gtx-1060-4060-ti-more";
const TOMS_5060TI = "https://www.tomshardware.com/pc-components/gpus/nvidia-geforce-rtx-5060-ti-16gb-review/6";
const KG_5060TI = "https://www.kitguru.net/components/graphic-cards/dominic-moass/nvidia-rtx-5060-ti-16gb-review-ft-gigabyte-palit/17";
const TS_9070XT = "https://www.techspot.com/review/3130-geforce-rtx-5070-ti-vs-radeon-rx-9070-xt/";
const TS_5070 = "https://www.techspot.com/review/2970-nvidia-geforce-rtx-5070/";
const TS_7600 = "https://www.techspot.com/review/2718-geforce-rtx-4060-vs-radeon-7600";
const DT_7600 = "https://digitaltrends.com/computing/nvidia-rtx-4060-vs-amd-rx-7600";
const TS_6V8 = "https://www.techspot.com/review/2488-pc-gaming-6-vs-8-cores/";
const KG_5700X = "https://www.kitguru.net/components/cpu/luke-hill/amd-ryzen-7-5700x-ryzen-5-5600-review/10";

export const COMPARISONS: Comparison[] = [
  {
    a: "rtx-5060",
    b: "rtx-4060",
    reports: [
      { res: "misto", mode: "padrão", value: 20, text: "Tipicamente cerca de 20% mais rápida, com faixa de 6% a 27% conforme o jogo e a resolução.", source: "GamersNexus", url: GN_5060 },
      { res: "misto", mode: "padrão", value: 22, text: "22% mais rápida na média de 18 jogos.", source: "TechSpot", url: TS_5060 },
      { res: "misto", mode: "padrão", value: 15, text: "15% mais rápida em média nos testes do IGN (13% sem o 3DMark).", source: "IGN", url: IGN_5060 },
    ],
  },
  {
    a: "rtx-5060ti-16",
    b: "rtx-4060ti",
    reports: [
      { res: "1080p", mode: "padrão", value: 19, text: "Tipicamente de 18% a 20% mais rápida, com faixa de 11% a 24%.", source: "GamersNexus", url: GN_5060TI },
      { res: "1440p", mode: "padrão", value: 22, text: "Tipicamente de 20% a 25% mais rápida, com faixa de 13% a 27%.", source: "GamersNexus", url: GN_5060TI },
      { res: "1080p", mode: "padrão", value: 15, text: "15% mais rápida em 18 jogos (comparada à 4060 Ti de 8 GB).", source: "Tom's Hardware", url: TOMS_5060TI },
      { res: "1440p", mode: "padrão", value: 25, text: "25% mais rápida em 18 jogos (comparada à 4060 Ti de 8 GB).", source: "Tom's Hardware", url: TOMS_5060TI },
      { res: "4K", mode: "padrão", value: 65, text: "65% mais rápida em 18 jogos (a diferença cresce em 4K, onde a memória pesa mais).", source: "Tom's Hardware", url: TOMS_5060TI },
    ],
  },
  {
    a: "rtx-5060ti-16",
    b: "rtx-5060",
    reports: [
      { res: "misto", mode: "padrão", value: 22, text: "22% mais rápida na média dos testes, tipicamente entre 15% e 25% em 1080p, 1440p e 4K.", source: "GamersNexus", url: GN_5060 },
    ],
  },
  {
    a: "rtx-5060ti-16",
    b: "rx-7800xt",
    reports: [
      { res: "1080p", mode: "padrão", value: -8, text: "8% mais lenta na média de 12 jogos.", source: "KitGuru", url: KG_5060TI },
    ],
  },
  {
    a: "rx-9070xt",
    b: "rtx-5070ti",
    reports: [
      { res: "1440p", mode: "padrão", value: -5, text: "Cerca de 5% mais lenta na média de 55 jogos.", source: "TechSpot", url: TS_9070XT },
      { res: "4K", mode: "padrão", value: -5, text: "Cerca de 5% mais lenta na média de 55 jogos.", source: "TechSpot", url: TS_9070XT },
      { res: "1440p", mode: "padrão", value: -6, text: "6% mais lenta na análise de lançamento, com 18 jogos.", source: "TechSpot", url: TS_5070 },
    ],
  },
  {
    a: "rx-7600",
    b: "rtx-4060",
    reports: [
      { res: "1080p", mode: "padrão", value: -2, text: "Sem ray tracing, cerca de 2% mais lenta na média.", source: "TechSpot", url: TS_7600 },
      { res: "1080p", mode: "padrão", value: -7, text: "7% mais lenta na média de 40 jogos e configurações, incluindo ray tracing.", source: "TechSpot", url: TS_7600 },
      { res: "1080p", mode: "ray tracing", value: -20, text: "Com ray tracing ativado, 20% mais lenta na média.", source: "TechSpot", url: TS_7600 },
      { res: "1440p", mode: "padrão", value: -9, text: "9% mais lenta na média.", source: "TechSpot", url: TS_7600 },
      { res: "1080p", mode: "padrão", value: -11, text: "A RTX 4060 ficou cerca de 12% à frente (equivale à RX 7600 ficar cerca de 11% atrás). Segundo o teste, a diferença vem principalmente do ray tracing.", source: "Digital Trends", url: DT_7600 },
      { res: "1440p", mode: "padrão", value: -11, text: "A diferença de cerca de 12% se manteve em 1440p.", source: "Digital Trends", url: DT_7600 },
    ],
  },
  {
    a: "r7-5700x",
    b: "r5-5600",
    reports: [
      { res: "1080p", mode: "padrão", value: 5, text: "No máximo 5% mais rápido em 1080p com uma placa de vídeo topo de linha (RX 6950 XT). Em geral, a diferença nos jogos é bem pequena.", source: "TechSpot", url: TS_6V8 },
    ],
  },
  {
    a: "r5-5600",
    b: "i5-12400f",
    reports: [
      { res: "1080p", mode: "padrão", value: null, text: "O Ryzen 5 5600 ficou marginalmente à frente na média de FPS. O teste considera um empate prático.", source: "KitGuru", url: KG_5700X },
    ],
  },
];
