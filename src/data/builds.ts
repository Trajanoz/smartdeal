import type { Selection } from "../lib/compat";

export interface RecBuild {
  id: string;
  tier: string;
  tagline: string;
  sel: Selection;
  upgrades: string[];
}

export const BUILDS: RecBuild[] = [
  {
    id: "entrada",
    tier: "PC de entrada",
    tagline:
      "Para navegar, estudar, trabalhar e jogos leves, usando o vídeo integrado do processador.",
    sel: {
      cpu: "r5-5600g",
      mobo: "am4-a520m",
      gpu: "",
      ram: "d4-16-2",
      storage: ["nvme-500", ""],
      psu: "psu-450",
      case: "case-matx",
      cooler: "",
    },
    upgrades: [
      "Adicionar uma placa de vídeo dedicada: reavalie a fonte no PC Builder antes de comprar.",
      "Subir a memória para 32 GB (confirme os slots da placa-mãe escolhida).",
      "Trocar o processador por outro AM4 da lista, como o Ryzen 7 5700X.",
    ],
  },
  {
    id: "economico",
    tier: "PC econômico",
    tagline: "Primeiro PC gamer, para jogos em Full HD com configurações médias.",
    sel: {
      cpu: "r5-5600",
      mobo: "am4-b550m",
      gpu: "rx-7600",
      ram: "d4-16-2",
      storage: ["nvme-500", ""],
      psu: "psu-550",
      case: "case-matx",
      cooler: "",
    },
    upgrades: [
      "Memória de 16 GB para 32 GB.",
      "Trocar o processador por um Ryzen 7 5700X ou 5700X3D (plataforma AM4).",
      "Uma placa de vídeo mais forte exigirá fonte maior: reavalie no PC Builder.",
    ],
  },
  {
    id: "custo-beneficio",
    tier: "PC gamer custo-benefício",
    tagline:
      "Plataforma nova (AM5 e DDR5) com placa de vídeo atual, para Full HD e 1440p.",
    sel: {
      cpu: "r5-7600",
      mobo: "am5-b650m",
      gpu: "rtx-5060",
      ram: "d5-16-2",
      storage: ["nvme-1t", ""],
      psu: "psu-650",
      case: "case-matx",
      cooler: "",
    },
    upgrades: [
      "Trocar para um processador AM5 mais forte, confirmando o suporte de BIOS da placa.",
      "Memória de 16 GB para 32 GB.",
      "Segundo SSD NVMe, se a placa-mãe escolhida tiver o slot M.2.",
    ],
  },
  {
    id: "intermediario",
    tier: "PC intermediário",
    tagline: "Equilíbrio para 1440p, com 16 GB de memória de vídeo e 32 GB de RAM.",
    sel: {
      cpu: "r7-7700",
      mobo: "am5-b650-atx",
      gpu: "rtx-5060ti-16",
      ram: "d5-32-2",
      storage: ["nvme-1t", ""],
      psu: "psu-650",
      case: "case-atx",
      cooler: "",
    },
    upgrades: [
      "Trocar a placa de vídeo por uma mais forte (reavalie a fonte).",
      "Adicionar um segundo SSD NVMe ou um HD para arquivos.",
      "Trocar o processador por um AM5 com cache 3D, como o Ryzen 7 7800X3D.",
    ],
  },
  {
    id: "avancado",
    tier: "PC avançado",
    tagline: "Foco em jogos de alto desempenho em 1440p, com processador de cache 3D.",
    sel: {
      cpu: "r7-7800x3d",
      mobo: "am5-b650-atx",
      gpu: "rtx-5070",
      ram: "d5-32-2",
      storage: ["nvme-1t", ""],
      psu: "psu-750",
      case: "case-atx",
      cooler: "cool-tower",
    },
    upgrades: [
      "Trocar a placa de vídeo por uma RTX 5070 Ti ou superior (a fonte de 750 W precisa ser reavaliada).",
      "Subir o SSD para 2 TB ou adicionar um segundo NVMe.",
      "Memória DDR5 de 32 GB para 64 GB.",
    ],
  },
  {
    id: "entusiasta",
    tier: "PC entusiasta",
    tagline: "Para jogos em 1440p de alta taxa de quadros e 4K, com refrigeração líquida.",
    sel: {
      cpu: "r7-9800x3d",
      mobo: "am5-b850-atx",
      gpu: "rtx-5070ti",
      ram: "d5-32-2",
      storage: ["nvme-2t", ""],
      psu: "psu-850",
      case: "case-atx",
      cooler: "cool-aio240",
    },
    upgrades: [
      "Trocar a placa de vídeo por uma RTX 5080, mantendo a fonte de 850 W (confira o recomendado do modelo).",
      "Memória de 32 GB para 64 GB.",
      "Segundo SSD NVMe, se a placa-mãe escolhida tiver o slot M.2.",
    ],
  },
  {
    id: "alto-desempenho",
    tier: "PC de alto desempenho",
    tagline: "Máximo desempenho para 4K, criação de conteúdo e transmissão.",
    sel: {
      cpu: "r7-9800x3d",
      mobo: "am5-b850-atx",
      gpu: "rtx-5080",
      ram: "d5-64-2",
      storage: ["nvme-2t", "nvme-1t"],
      psu: "psu-1000",
      case: "case-atx",
      cooler: "cool-aio360",
    },
    upgrades: [
      "Subir para uma RTX 5090 exige fonte maior que 1000 W: reavalie no PC Builder.",
      "Adicionar armazenamento extra (HD ou SSD SATA) para arquivos grandes.",
      "Conferir se a placa-mãe escolhida tem os 2 slots M.2 necessários.",
    ],
  },
];
