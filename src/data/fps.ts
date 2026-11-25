export type FpsRes = "1080p" | "1440p" | "4K";

export interface MeasuredFps {
  gpu: string;
  fps: Record<FpsRes, number | null>;
}

export const FPS_SOURCE = {
  name: "Tom's Hardware",
  url: "https://www.tomshardware.com/reviews/best-graphics-card/",
  period: "junho de 2026",
  consulted: "24/11/2026",
  what: "Média de FPS em 11 jogos, com configurações alto/ultra conforme o jogo, medida no computador de teste do site. Um processador diferente, outro jogo ou outra configuração podem mudar o resultado.",
};

export const MEASURED: MeasuredFps[] = [
  { gpu: "rtx-5090", fps: { "1080p": 166.3, "1440p": 135.15, "4K": 88.02 } },
  { gpu: "rtx-5070ti", fps: { "1080p": 123.7, "1440p": 92.0, "4K": 52.8 } },
  { gpu: "rx-9070xt", fps: { "1080p": 116.7, "1440p": 85.3, "4K": 47.4 } },
  { gpu: "rtx-5070", fps: { "1080p": 103.8, "1440p": 74.0, "4K": 37.6 } },
  { gpu: "rtx-5060", fps: { "1080p": 64.0, "1440p": 41.2, "4K": null } },
];

export const GAMES = [
  "Counter-Strike 2",
  "Valorant",
  "GTA V",
  "GTA VI",
  "Cyberpunk 2077",
  "Red Dead Redemption 2",
  "Fortnite",
  "Call of Duty",
  "Warzone",
  "Elden Ring",
  "Minecraft",
  "Black Myth: Wukong",
];
