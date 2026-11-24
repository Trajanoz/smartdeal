import {
  CPUS,
  GPUS,
  MOBOS,
  RAMS,
  STORAGE,
  PSUS,
  CASES,
  COOLERS,
  FORM_ORDER,
  type Cpu,
  type Mobo,
} from "../data/parts";

export type Level = "green" | "yellow" | "red" | "gray";

export interface Check {
  id: string;
  title: string;
  level: Level;
  text: string;
}

export interface Selection {
  cpu: string;
  mobo: string;
  gpu: string;
  ram: string;
  storage: string[];
  psu: string;
  case: string;
  cooler: string;
}

export interface Analysis {
  checks: Check[];
  overall: Level;
  estimatedPeakW: number | null;
  recommendedPsuW: number | null;
}

export const EMPTY_SELECTION: Selection = {
  cpu: "",
  mobo: "",
  gpu: "",
  ram: "",
  storage: ["", ""],
  psu: "",
  case: "",
  cooler: "",
};

function find<T extends { id: string }>(list: T[], id: string): T | null {
  return list.find((x) => x.id === id) ?? null;
}

function biosNote(cpu: Cpu, mobo: Mobo): string | null {
  if (
    cpu.generation === "Ryzen 5000" &&
    ["A520", "B450", "B550"].includes(mobo.chipset)
  ) {
    return "Placas " + mobo.chipset + " mais antigas podem precisar de atualização de BIOS para rodar o Ryzen 5000. Pergunte à loja a versão de BIOS da placa.";
  }
  if (
    cpu.generation === "Ryzen 9000" &&
    ["A620", "B650", "X670"].includes(mobo.chipset)
  ) {
    return "Placas " + mobo.chipset + " mais antigas podem precisar de atualização de BIOS para rodar o Ryzen 9000. Pergunte à loja a versão de BIOS da placa.";
  }
  if (
    cpu.generation === "Intel 13ª/14ª geração" &&
    ["H610", "B660"].includes(mobo.chipset)
  ) {
    return "Placas " + mobo.chipset + " mais antigas podem precisar de atualização de BIOS para rodar processadores Intel de 13ª/14ª geração. Pergunte à loja a versão de BIOS da placa.";
  }
  return null;
}

const roundUp50 = (n: number) => Math.ceil(n / 50) * 50;

export function analyze(sel: Selection): Analysis {
  const cpu = find(CPUS, sel.cpu);
  const mobo = find(MOBOS, sel.mobo);
  const gpu = find(GPUS, sel.gpu);
  const ram = find(RAMS, sel.ram);
  const psu = find(PSUS, sel.psu);
  const pcCase = find(CASES, sel.case);
  const cooler = find(COOLERS, sel.cooler);
  const drives = sel.storage
    .map((id) => find(STORAGE, id))
    .filter((d): d is NonNullable<typeof d> => d !== null);

  const checks: Check[] = [];
  const add = (id: string, title: string, level: Level, text: string) =>
    checks.push({ id, title, level, text });

  // Processador x placa-mãe
  if (!cpu || !mobo) {
    add("cpu-mobo", "Processador e placa-mãe", "gray", "Escolha o processador e a placa-mãe para verificar.");
  } else if (cpu.socket !== mobo.socket) {
    add("cpu-mobo", "Processador e placa-mãe", "red", "O processador usa o socket " + cpu.socket + " e a placa-mãe usa o socket " + mobo.socket + ". Eles não encaixam.");
  } else {
    const note = biosNote(cpu, mobo);
    if (note) {
      add("cpu-mobo", "Processador e placa-mãe", "yellow", "Mesmo socket (" + cpu.socket + "). " + note);
    } else {
      add("cpu-mobo", "Processador e placa-mãe", "green", "Mesmo socket (" + cpu.socket + ") e geração compatível.");
    }
  }

  // Memória
  if (!ram || !mobo) {
    add("ram", "Memória RAM", "gray", "Escolha a placa-mãe e a memória para verificar.");
  } else if (ram.type !== mobo.ramType) {
    add("ram", "Memória RAM", "red", "A memória é " + ram.type + " e a placa-mãe usa " + mobo.ramType + ".");
  } else if (cpu && !cpu.ramTypes.includes(ram.type)) {
    add("ram", "Memória RAM", "red", "O processador não suporta memória " + ram.type + ".");
  } else if (mobo.maxRamGb !== null && ram.capacityGb > mobo.maxRamGb) {
    add("ram", "Memória RAM", "red", "A placa-mãe aceita no máximo " + mobo.maxRamGb + " GB.");
  } else if (ram.modules > 2 && mobo.ramSlots === null) {
    add("ram", "Memória RAM", "gray", "Tipo " + ram.type + " compatível, mas confirme que o modelo da placa tem " + ram.modules + " slots de memória.");
  } else if (mobo.ramSlots !== null && ram.modules > mobo.ramSlots) {
    add("ram", "Memória RAM", "red", "A placa-mãe tem " + mobo.ramSlots + " slots e a memória usa " + ram.modules + " pentes.");
  } else {
    add("ram", "Memória RAM", "green", "Memória " + ram.type + " compatível com a placa-mãe.");
  }

  // Vídeo
  if (gpu) {
    add("video", "Vídeo", "green", "Placa de vídeo dedicada selecionada.");
  } else if (!cpu) {
    add("video", "Vídeo", "gray", "Escolha o processador e a placa de vídeo.");
  } else if (cpu.igpu) {
    add("video", "Vídeo", "green", "Sem placa de vídeo dedicada: usará o vídeo integrado do processador, com desempenho gráfico limitado.");
  } else {
    add("video", "Vídeo", "red", "Este processador não tem vídeo integrado. Sem placa de vídeo dedicada, o PC não dá imagem.");
  }

  // Placa de vídeo x gabinete
  if (gpu && pcCase) {
    add("gpu-case", "Placa de vídeo e gabinete", "gray", "O comprimento da placa de vídeo varia por modelo. Compare a medida do modelo escolhido com o espaço do gabinete na ficha técnica.");
  } else if (gpu) {
    add("gpu-case", "Placa de vídeo e gabinete", "gray", "Escolha o gabinete. O comprimento da placa varia por modelo e precisa ser conferido na ficha técnica.");
  }

  // Fonte
  let peak: number | null = null;
  let recommended: number | null = null;
  if (cpu) {
    peak = cpu.power + (gpu ? gpu.tgp : 0) + 100;
    recommended = Math.max(gpu ? gpu.recommendedPsu : 0, roundUp50(peak * 1.3));
  }
  if (!psu) {
    add("psu", "Fonte", "gray", peak !== null && recommended !== null
      ? "Escolha a fonte. Consumo máximo estimado: " + peak + " W. Fonte recomendada: " + recommended + " W ou mais."
      : "Escolha o processador e a fonte para verificar.");
  } else if (peak === null || recommended === null) {
    add("psu", "Fonte", "gray", "Escolha o processador para estimar o consumo.");
  } else if (psu.watts < peak) {
    add("psu", "Fonte", "red", "A fonte de " + psu.watts + " W é menor que o consumo máximo estimado de " + peak + " W.");
  } else if (psu.watts < recommended) {
    add("psu", "Fonte", "yellow", "A fonte de " + psu.watts + " W cobre o consumo estimado (" + peak + " W), mas fica abaixo do recomendado (" + recommended + " W), sem margem de segurança.");
  } else {
    add("psu", "Fonte", "green", "A fonte de " + psu.watts + " W cobre o consumo máximo estimado (" + peak + " W) com margem de segurança.");
  }

  // Cooler
  if (!cpu) {
    add("cooler", "Refrigeração", "gray", "Escolha o processador para verificar.");
  } else if (!cooler) {
    if (cpu.boxCooler) {
      add("cooler", "Refrigeração", "green", "Usará o cooler que acompanha o processador.");
    } else {
      add("cooler", "Refrigeração", "yellow", "Este processador não vem com cooler. Escolha um cooler ou water cooler.");
    }
  } else if (cooler.sockets !== null && !cooler.sockets.includes(cpu.socket)) {
    add("cooler", "Refrigeração", "red", "O cooler não suporta o socket " + cpu.socket + ".");
  } else if (cooler.ratedW < cpu.coolingW) {
    add("cooler", "Refrigeração", "yellow", "Esta categoria de cooler é indicada até cerca de " + cooler.ratedW + " W e o processador pede " + cpu.coolingW + " W. Pode esquentar.");
  } else if (cooler.sockets === null) {
    add("cooler", "Refrigeração", "gray", "Capacidade adequada, mas confirme na ficha do modelo que ele suporta o socket " + cpu.socket + " e cabe no gabinete.");
  } else {
    add("cooler", "Refrigeração", "green", "Cooler compatível com o socket e com a potência do processador.");
  }

  // Gabinete x placa-mãe
  if (!pcCase || !mobo) {
    add("case", "Gabinete e placa-mãe", "gray", "Escolha a placa-mãe e o gabinete para verificar.");
  } else if (FORM_ORDER[mobo.formFactor] > FORM_ORDER[pcCase.maxFormFactor]) {
    add("case", "Gabinete e placa-mãe", "red", "A placa-mãe é " + mobo.formFactor + " e o gabinete aceita no máximo " + pcCase.maxFormFactor + ".");
  } else {
    add("case", "Gabinete e placa-mãe", "green", "O gabinete aceita o formato " + mobo.formFactor + ".");
  }

  // Armazenamento
  if (drives.length === 0) {
    add("storage", "Armazenamento", "gray", "Escolha ao menos uma unidade de armazenamento.");
  } else if (!mobo) {
    add("storage", "Armazenamento", "gray", "Escolha a placa-mãe para verificar os slots.");
  } else {
    const nvme = drives.filter((d) => d.kind === "nvme").length;
    const sata = drives.length - nvme;
    if (mobo.m2Slots !== null && nvme > mobo.m2Slots) {
      add("storage", "Armazenamento", "red", "A placa-mãe tem " + mobo.m2Slots + " slot(s) M.2 e você escolheu " + nvme + " SSD(s) NVMe.");
    } else if (mobo.sataPorts !== null && sata > mobo.sataPorts) {
      add("storage", "Armazenamento", "red", "A placa-mãe tem " + mobo.sataPorts + " porta(s) SATA e você escolheu " + sata + " unidade(s) SATA.");
    } else if (nvme > 0 && mobo.m2Slots === null) {
      add("storage", "Armazenamento", "gray", "Confira na ficha do modelo da placa-mãe se ela tem " + (nvme === 1 ? "um slot M.2" : nvme + " slots M.2") + " para o NVMe.");
    } else if (sata > 2 && mobo.sataPorts === null) {
      add("storage", "Armazenamento", "gray", "Confira se o modelo da placa-mãe tem portas SATA suficientes.");
    } else {
      add("storage", "Armazenamento", "green", "Armazenamento compatível com a placa-mãe.");
    }
  }

  let overall: Level = "green";
  if (checks.some((c) => c.level === "red")) overall = "red";
  else if (checks.some((c) => c.level === "yellow")) overall = "yellow";
  else if (checks.some((c) => c.level === "gray")) overall = "gray";

  return { checks, overall, estimatedPeakW: peak, recommendedPsuW: recommended };
}
