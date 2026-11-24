import { CPUS, GPUS, RAMS } from "../data/parts";

export type Rating =
  | "Excelente"
  | "Boa"
  | "Limitada"
  | "Não recomendada"
  | "Indisponível";
export type RealEncoder = "nvenc" | "amf" | "qsv" | "x264";
export type Encoder = "auto" | RealEncoder;
export type Platform = "twitch" | "youtube";

export interface StreamInput {
  cpu: string;
  gpu: string;
  ram: string;
  encoder: Encoder;
  platform: Platform;
  uploadMbps: number | null;
}

export interface Tier {
  label: string;
  bitrate: number;
}

export interface StreamResult {
  encoderName: string;
  encodeRating: Rating;
  encodeText: string;
  bothRating: Rating;
  bothText: string;
  netRating: Rating | null;
  netText: string;
  settings: [string, string][];
  bottlenecks: string[];
  resources: string[];
}

export const ENCODER_NAMES: Record<RealEncoder, string> = {
  nvenc: "NVIDIA NVENC H.264",
  amf: "AMD AMF H.264",
  qsv: "Intel Quick Sync H.264",
  x264: "x264 (processador)",
};

const LADDERS: Record<Platform, Tier[]> = {
  twitch: [
    { label: "1920x1080 a 60 FPS", bitrate: 6000 },
    { label: "1280x720 a 60 FPS", bitrate: 4500 },
    { label: "1280x720 a 30 FPS", bitrate: 3000 },
  ],
  youtube: [
    { label: "1920x1080 a 60 FPS", bitrate: 9000 },
    { label: "1280x720 a 60 FPS", bitrate: 6000 },
    { label: "1280x720 a 30 FPS", bitrate: 4000 },
  ],
};

const RANK: Record<Rating, number> = {
  Excelente: 3,
  Boa: 2,
  Limitada: 1,
  "Não recomendada": 0,
  Indisponível: -1,
};

function cap(r: Rating, max: Rating): Rating {
  return RANK[r] > RANK[max] ? max : r;
}

export function analyzeStream(input: StreamInput): StreamResult | null {
  const cpu = CPUS.find((c) => c.id === input.cpu) ?? null;
  if (!cpu) return null;
  const gpu = GPUS.find((g) => g.id === input.gpu) ?? null;
  const ram = RAMS.find((r) => r.id === input.ram) ?? null;

  const vendor = gpu
    ? gpu.name.startsWith("NVIDIA")
      ? "nvidia"
      : gpu.name.startsWith("AMD")
      ? "amd"
      : null
    : null;
  const intelIgpu = cpu.name.startsWith("Intel") && cpu.igpu;

  const available: Record<RealEncoder, boolean> = {
    nvenc: vendor === "nvidia",
    amf: vendor === "amd",
    qsv: intelIgpu,
    x264: true,
  };

  const chosen: RealEncoder =
    input.encoder === "auto"
      ? available.nvenc
        ? "nvenc"
        : available.amf
        ? "amf"
        : available.qsv
        ? "qsv"
        : "x264"
      : input.encoder;

  const ladder = LADDERS[input.platform];
  const platformName = input.platform === "twitch" ? "Twitch" : "YouTube";

  // Internet
  let netRating: Rating | null = null;
  let netText = "Informe sua velocidade de upload para avaliar a internet.";
  let tier = ladder[0];
  const up = input.uploadMbps;
  if (up !== null) {
    const need = (t: Tier) => (t.bitrate / 1000) * 1.2;
    const comfortable = (ladder[0].bitrate / 1000) * 1.5;
    const minimum = need(ladder[0]);
    if (up >= comfortable) netRating = "Excelente";
    else if (up >= minimum) netRating = "Boa";
    else if (up >= ladder[0].bitrate / 1000) netRating = "Limitada";
    else netRating = "Não recomendada";

    if (netRating === "Excelente" || netRating === "Boa") {
      netText =
        "Seu upload de " + up + " Mbps sustenta " + ladder[0].label + " a " + ladder[0].bitrate + " kbps no " + platformName + ".";
      if (netRating === "Boa") {
        netText += " A margem é pequena: qualquer oscilação da conexão pode causar travamentos.";
      }
    } else {
      const fit = ladder.find((t) => up >= need(t)) ?? ladder[ladder.length - 1];
      tier = fit;
      netText =
        "Seu upload de " + up + " Mbps é curto para 1080p60 (" + ladder[0].bitrate + " kbps). A maior opção que cabe é " + fit.label + " a " + fit.bitrate + " kbps" +
        (up >= need(fit) ? "." : ", e ainda assim com pouca folga.");
    }
  }

  const threads = cpu.threads;
  const bottlenecks: string[] = [];
  const resources: string[] = [];

  let encodeRating: Rating;
  let encodeText: string;
  let bothRating: Rating;
  let bothText: string;

  if (!available[chosen]) {
    const why =
      chosen === "nvenc"
        ? "O NVENC exige uma placa de vídeo NVIDIA."
        : chosen === "amf"
        ? "O AMF exige uma placa de vídeo AMD."
        : "O Quick Sync exige um processador Intel com vídeo integrado.";
    encodeRating = "Indisponível";
    encodeText = why + " Escolha outro encoder ou o modo automático.";
    bothRating = "Indisponível";
    bothText = "Sem encoder disponível, não há como avaliar.";
  } else if (chosen === "nvenc") {
    encodeRating = "Excelente";
    encodeText =
      "O NVENC é um bloco dedicado da placa de vídeo NVIDIA, feito só para codificar vídeo. O nível de qualidade é o mesmo para todas as placas de uma mesma geração.";
    bothRating = "Boa";
    bothText =
      "Por ser um bloco dedicado, o NVENC costuma pesar pouco nos jogos, mas o impacto varia por jogo e por placa. Esta análise não mede FPS.";
    resources.push("CPU: uso extra baixo, pois a codificação sai do processador.", "GPU: usa o bloco de codificação dedicado, separado dos núcleos que renderizam o jogo.");
  } else if (chosen === "amf") {
    encodeRating = "Boa";
    encodeText =
      "O AMF é o codificador da placa AMD. Historicamente, a qualidade de imagem dele a bitrates baixos, como 6000 kbps, ficou atrás do NVENC. Compare no OBS antes de decidir.";
    bothRating = "Boa";
    bothText =
      "Por ser um encoder de hardware, tira pouca carga da CPU, mas o impacto nos jogos varia. Esta análise não mede FPS.";
    resources.push("CPU: uso extra baixo.", "GPU: usa o bloco de codificação da placa AMD.");
    bottlenecks.push("Qualidade do AMF a bitrates baixos: faça um teste de gravação ou transmissão e compare com o x264.");
  } else if (chosen === "qsv") {
    encodeRating = "Boa";
    encodeText =
      "O Quick Sync usa o vídeo integrado da Intel. O OBS recomenda usar o codificador da placa de vídeo principal quando existe uma placa dedicada.";
    if (gpu) {
      bothRating = "Boa";
      bothText =
        "O Quick Sync tira a carga de codificação da placa de vídeo e da CPU, mas o NVENC ou o AMF da placa dedicada costumam ser a escolha preferida.";
    } else {
      bothRating = "Limitada";
      bothText =
        "Sem placa de vídeo dedicada, o jogo e a codificação dividem o mesmo vídeo integrado, o que limita os dois.";
      bottlenecks.push("Sem placa de vídeo dedicada: jogos pesados ficam limitados, e a transmissão divide recursos com o jogo.");
    }
    resources.push("CPU: uso extra baixo a moderado.", "Vídeo integrado Intel: usado pela codificação.");
  } else {
    if (threads >= 12) encodeRating = "Boa";
    else if (threads >= 8) encodeRating = "Limitada";
    else encodeRating = "Não recomendada";
    encodeText =
      "O x264 codifica pela CPU. Para 1080p60 no preset veryfast, a regra prática é ter bastante folga de núcleos. Este processador tem " + cpu.cores + " núcleos e " + threads + " threads.";
    if (threads >= 20) bothRating = "Boa";
    else if (threads >= 16) bothRating = "Limitada";
    else bothRating = "Não recomendada";
    bothText =
      "Jogar e transmitir com x264 divide a CPU entre o jogo e o OBS. A classificação segue uma regra prática por número de threads, não uma medição.";
    resources.push("CPU: uso extra alto, pois a codificação ocupa vários núcleos.");
    if (threads < 16) {
      bottlenecks.push("Poucos núcleos para x264 junto com o jogo: o OBS pode acusar sobrecarga de codificação ou o jogo perder FPS. Prefira um encoder de hardware, se houver.");
    }
  }

  if (ram && ram.capacityGb < 16) {
    bothRating = cap(bothRating, "Limitada");
    bottlenecks.push("Memória abaixo de 16 GB: jogo, OBS e navegador tendem a faltar memória. Regra prática, não medição.");
  }
  if (!gpu && !cpu.igpu) {
    bottlenecks.push("Sem placa de vídeo dedicada e sem vídeo integrado: o PC não dá imagem.");
  }
  if (!gpu && cpu.igpu && chosen !== "qsv") {
    bottlenecks.push("Sem placa de vídeo dedicada: jogos pesados ficam limitados ao vídeo integrado.");
  }
  if (netRating === "Limitada" || netRating === "Não recomendada") {
    bottlenecks.push("Upload da internet abaixo do necessário para 1080p60.");
  }

  const settings: [string, string][] = [
    ["Encoder no OBS", ENCODER_NAMES[chosen]],
    ["Resolução e FPS", tier.label],
    ["Bitrate de vídeo", tier.bitrate + " kbps"],
    ["Controle de taxa", "CBR"],
    ["Intervalo de keyframe", "2 segundos"],
  ];
  if (chosen === "nvenc") {
    settings.push(["Preset", "Max Quality (se houver sobrecarga do encoder, use Quality)"], ["B-frames", "2"]);
  } else if (chosen === "amf") {
    settings.push(["Preset", "Qualidade (teste e compare com o x264)"]);
  } else if (chosen === "qsv") {
    settings.push(["Preset", "Equilibrado (teste no OBS)"]);
  } else {
    settings.push(["Preset", "veryfast (o Twitch indica de veryfast a medium; suba só se a CPU aguentar)"]);
  }

  return {
    encoderName: ENCODER_NAMES[chosen],
    encodeRating,
    encodeText,
    bothRating,
    bothText,
    netRating,
    netText,
    settings,
    bottlenecks,
    resources,
  };
}
