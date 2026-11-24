export type Socket = "AM4" | "AM5" | "LGA1700";
export type RamType = "DDR4" | "DDR5";
export type FormFactor = "ITX" | "mATX" | "ATX";

export const FORM_ORDER: Record<FormFactor, number> = {
  ITX: 1,
  mATX: 2,
  ATX: 3,
};

export interface Cpu {
  id: string;
  name: string;
  search: string;
  socket: Socket;
  cores: number;
  threads: number;
  power: number;
  coolingW: number;
  ramTypes: RamType[];
  igpu: boolean;
  boxCooler: boolean;
  generation: string;
}

export interface Gpu {
  id: string;
  name: string;
  search: string;
  tgp: number;
  recommendedPsu: number;
  vramGb: number;
}

export interface Mobo {
  id: string;
  name: string;
  search: string;
  socket: Socket;
  chipset: string;
  ramType: RamType;
  formFactor: FormFactor;
  ramSlots: number | null;
  maxRamGb: number | null;
  m2Slots: number | null;
  sataPorts: number | null;
}

export interface Ram {
  id: string;
  name: string;
  search: string;
  type: RamType;
  capacityGb: number;
  modules: number;
}

export interface Storage {
  id: string;
  name: string;
  search: string;
  kind: "nvme" | "sata";
}

export interface Psu {
  id: string;
  name: string;
  search: string;
  watts: number;
}

export interface Case {
  id: string;
  name: string;
  search: string;
  maxFormFactor: FormFactor;
}

export interface Cooler {
  id: string;
  name: string;
  search: string;
  ratedW: number;
  sockets: Socket[] | null;
}

// Processadores: dados de referência dos fabricantes.
// power = consumo máximo sustentado de referência (PPT na AMD, potência turbo máxima na Intel).
// coolingW = capacidade de refrigeração pedida (TDP na AMD; potência base na Intel, e a máxima nos modelos K).
export const CPUS: Cpu[] = [
  { id: "r5-5600", name: "AMD Ryzen 5 5600", search: "Ryzen 5 5600", socket: "AM4", cores: 6, threads: 12, power: 88, coolingW: 65, ramTypes: ["DDR4"], igpu: false, boxCooler: true, generation: "Ryzen 5000" },
  { id: "r5-5600g", name: "AMD Ryzen 5 5600G", search: "Ryzen 5 5600G", socket: "AM4", cores: 6, threads: 12, power: 88, coolingW: 65, ramTypes: ["DDR4"], igpu: true, boxCooler: true, generation: "Ryzen 5000" },
  { id: "r7-5700x", name: "AMD Ryzen 7 5700X", search: "Ryzen 7 5700X", socket: "AM4", cores: 8, threads: 16, power: 88, coolingW: 65, ramTypes: ["DDR4"], igpu: false, boxCooler: false, generation: "Ryzen 5000" },
  { id: "r7-5700x3d", name: "AMD Ryzen 7 5700X3D", search: "Ryzen 7 5700X3D", socket: "AM4", cores: 8, threads: 16, power: 142, coolingW: 105, ramTypes: ["DDR4"], igpu: false, boxCooler: false, generation: "Ryzen 5000" },
  { id: "r5-7600", name: "AMD Ryzen 5 7600", search: "Ryzen 5 7600", socket: "AM5", cores: 6, threads: 12, power: 88, coolingW: 65, ramTypes: ["DDR5"], igpu: true, boxCooler: true, generation: "Ryzen 7000" },
  { id: "r7-7700", name: "AMD Ryzen 7 7700", search: "Ryzen 7 7700", socket: "AM5", cores: 8, threads: 16, power: 88, coolingW: 65, ramTypes: ["DDR5"], igpu: true, boxCooler: true, generation: "Ryzen 7000" },
  { id: "r7-7800x3d", name: "AMD Ryzen 7 7800X3D", search: "Ryzen 7 7800X3D", socket: "AM5", cores: 8, threads: 16, power: 162, coolingW: 120, ramTypes: ["DDR5"], igpu: true, boxCooler: false, generation: "Ryzen 7000" },
  { id: "r5-9600x", name: "AMD Ryzen 5 9600X", search: "Ryzen 5 9600X", socket: "AM5", cores: 6, threads: 12, power: 88, coolingW: 65, ramTypes: ["DDR5"], igpu: true, boxCooler: false, generation: "Ryzen 9000" },
  { id: "r7-9800x3d", name: "AMD Ryzen 7 9800X3D", search: "Ryzen 7 9800X3D", socket: "AM5", cores: 8, threads: 16, power: 162, coolingW: 120, ramTypes: ["DDR5"], igpu: true, boxCooler: false, generation: "Ryzen 9000" },
  { id: "i5-12400f", name: "Intel Core i5-12400F", search: "i5-12400F", socket: "LGA1700", cores: 6, threads: 12, power: 117, coolingW: 65, ramTypes: ["DDR4", "DDR5"], igpu: false, boxCooler: true, generation: "Intel 12ª geração" },
  { id: "i5-13400f", name: "Intel Core i5-13400F", search: "i5-13400F", socket: "LGA1700", cores: 10, threads: 16, power: 148, coolingW: 65, ramTypes: ["DDR4", "DDR5"], igpu: false, boxCooler: true, generation: "Intel 13ª/14ª geração" },
  { id: "i5-14400f", name: "Intel Core i5-14400F", search: "i5-14400F", socket: "LGA1700", cores: 10, threads: 16, power: 148, coolingW: 65, ramTypes: ["DDR4", "DDR5"], igpu: false, boxCooler: true, generation: "Intel 13ª/14ª geração" },
  { id: "i7-14700k", name: "Intel Core i7-14700K", search: "i7-14700K", socket: "LGA1700", cores: 20, threads: 28, power: 253, coolingW: 253, ramTypes: ["DDR4", "DDR5"], igpu: true, boxCooler: false, generation: "Intel 13ª/14ª geração" },
];

// Placas de vídeo: TGP/TBP e fonte recomendada de referência dos fabricantes.
// Comprimento e conectores variam conforme o modelo de cada marca e não estão no catálogo.
export const GPUS: Gpu[] = [
  { id: "rtx-4060", name: "NVIDIA GeForce RTX 4060 (8 GB)", search: "RTX 4060", tgp: 115, recommendedPsu: 550, vramGb: 8 },
  { id: "rtx-4060ti", name: "NVIDIA GeForce RTX 4060 Ti (8 GB)", search: "RTX 4060 Ti", tgp: 160, recommendedPsu: 550, vramGb: 8 },
  { id: "rtx-5060", name: "NVIDIA GeForce RTX 5060 (8 GB)", search: "RTX 5060", tgp: 145, recommendedPsu: 550, vramGb: 8 },
  { id: "rtx-5060ti-16", name: "NVIDIA GeForce RTX 5060 Ti (16 GB)", search: "RTX 5060 Ti 16GB", tgp: 180, recommendedPsu: 600, vramGb: 16 },
  { id: "rtx-4070s", name: "NVIDIA GeForce RTX 4070 SUPER (12 GB)", search: "RTX 4070 SUPER", tgp: 220, recommendedPsu: 650, vramGb: 12 },
  { id: "rtx-5070", name: "NVIDIA GeForce RTX 5070 (12 GB)", search: "RTX 5070", tgp: 250, recommendedPsu: 650, vramGb: 12 },
  { id: "rtx-5070ti", name: "NVIDIA GeForce RTX 5070 Ti (16 GB)", search: "RTX 5070 Ti", tgp: 300, recommendedPsu: 750, vramGb: 16 },
  { id: "rtx-5080", name: "NVIDIA GeForce RTX 5080 (16 GB)", search: "RTX 5080", tgp: 360, recommendedPsu: 850, vramGb: 16 },
  { id: "rtx-5090", name: "NVIDIA GeForce RTX 5090 (32 GB)", search: "RTX 5090", tgp: 575, recommendedPsu: 1000, vramGb: 32 },
  { id: "rx-7600", name: "AMD Radeon RX 7600 (8 GB)", search: "RX 7600", tgp: 165, recommendedPsu: 550, vramGb: 8 },
  { id: "rx-7800xt", name: "AMD Radeon RX 7800 XT (16 GB)", search: "RX 7800 XT", tgp: 263, recommendedPsu: 700, vramGb: 16 },
  { id: "rx-9070xt", name: "AMD Radeon RX 9070 XT (16 GB)", search: "RX 9070 XT", tgp: 304, recommendedPsu: 750, vramGb: 16 },
];

// Placas-mãe por categoria (chipset + formato + tipo de memória).
// Campos nulos = varia conforme o modelo; o motor mostra "informação insuficiente".
export const MOBOS: Mobo[] = [
  { id: "am4-a520m", name: "Placa-mãe A520M (AM4, mATX, DDR4)", search: "placa mae A520M AM4", socket: "AM4", chipset: "A520", ramType: "DDR4", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "am4-b450m", name: "Placa-mãe B450M (AM4, mATX, DDR4)", search: "placa mae B450M AM4", socket: "AM4", chipset: "B450", ramType: "DDR4", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "am4-b550m", name: "Placa-mãe B550M (AM4, mATX, DDR4)", search: "placa mae B550M AM4", socket: "AM4", chipset: "B550", ramType: "DDR4", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "am4-b550-atx", name: "Placa-mãe B550 (AM4, ATX, DDR4)", search: "placa mae B550 ATX AM4", socket: "AM4", chipset: "B550", ramType: "DDR4", formFactor: "ATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "am5-a620m", name: "Placa-mãe A620M (AM5, mATX, DDR5)", search: "placa mae A620M AM5", socket: "AM5", chipset: "A620", ramType: "DDR5", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "am5-b650m", name: "Placa-mãe B650M (AM5, mATX, DDR5)", search: "placa mae B650M AM5", socket: "AM5", chipset: "B650", ramType: "DDR5", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "am5-b650-atx", name: "Placa-mãe B650 (AM5, ATX, DDR5)", search: "placa mae B650 ATX AM5", socket: "AM5", chipset: "B650", ramType: "DDR5", formFactor: "ATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "am5-b850-atx", name: "Placa-mãe B850 (AM5, ATX, DDR5)", search: "placa mae B850 AM5", socket: "AM5", chipset: "B850", ramType: "DDR5", formFactor: "ATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "lga-h610m-d4", name: "Placa-mãe H610M (LGA1700, mATX, DDR4)", search: "placa mae H610M DDR4", socket: "LGA1700", chipset: "H610", ramType: "DDR4", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "lga-b660m-d4", name: "Placa-mãe B660M (LGA1700, mATX, DDR4)", search: "placa mae B660M DDR4", socket: "LGA1700", chipset: "B660", ramType: "DDR4", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "lga-b760m-d4", name: "Placa-mãe B760M (LGA1700, mATX, DDR4)", search: "placa mae B760M DDR4", socket: "LGA1700", chipset: "B760", ramType: "DDR4", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "lga-b760m-d5", name: "Placa-mãe B760M (LGA1700, mATX, DDR5)", search: "placa mae B760M DDR5", socket: "LGA1700", chipset: "B760", ramType: "DDR5", formFactor: "mATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
  { id: "lga-z790-d5", name: "Placa-mãe Z790 (LGA1700, ATX, DDR5)", search: "placa mae Z790 DDR5", socket: "LGA1700", chipset: "Z790", ramType: "DDR5", formFactor: "ATX", ramSlots: null, maxRamGb: null, m2Slots: null, sataPorts: null },
];

export const RAMS: Ram[] = [
  { id: "d4-8-1", name: "Memória DDR4 8 GB (1 pente de 8 GB)", search: "memoria DDR4 8GB", type: "DDR4", capacityGb: 8, modules: 1 },
  { id: "d4-16-2", name: "Memória DDR4 16 GB (2 pentes de 8 GB)", search: "memoria DDR4 16GB kit 2x8", type: "DDR4", capacityGb: 16, modules: 2 },
  { id: "d4-32-2", name: "Memória DDR4 32 GB (2 pentes de 16 GB)", search: "memoria DDR4 32GB kit 2x16", type: "DDR4", capacityGb: 32, modules: 2 },
  { id: "d5-16-2", name: "Memória DDR5 16 GB (2 pentes de 8 GB)", search: "memoria DDR5 16GB kit 2x8", type: "DDR5", capacityGb: 16, modules: 2 },
  { id: "d5-32-2", name: "Memória DDR5 32 GB (2 pentes de 16 GB)", search: "memoria DDR5 32GB kit 2x16", type: "DDR5", capacityGb: 32, modules: 2 },
  { id: "d5-64-2", name: "Memória DDR5 64 GB (2 pentes de 32 GB)", search: "memoria DDR5 64GB kit 2x32", type: "DDR5", capacityGb: 64, modules: 2 },
];

export const STORAGE: Storage[] = [
  { id: "nvme-500", name: "SSD NVMe M.2 500 GB", search: "SSD NVMe 500GB", kind: "nvme" },
  { id: "nvme-1t", name: "SSD NVMe M.2 1 TB", search: "SSD NVMe 1TB", kind: "nvme" },
  { id: "nvme-2t", name: "SSD NVMe M.2 2 TB", search: "SSD NVMe 2TB", kind: "nvme" },
  { id: "sata-480", name: "SSD SATA 480 GB", search: "SSD SATA 480GB", kind: "sata" },
  { id: "sata-1t", name: "SSD SATA 1 TB", search: "SSD SATA 1TB", kind: "sata" },
  { id: "hd-1t", name: "HD 1 TB (SATA)", search: "HD 1TB", kind: "sata" },
  { id: "hd-2t", name: "HD 2 TB (SATA)", search: "HD 2TB", kind: "sata" },
];

export const PSUS: Psu[] = [
  { id: "psu-450", name: "Fonte de 450 W reais", search: "fonte 450W", watts: 450 },
  { id: "psu-500", name: "Fonte de 500 W reais", search: "fonte 500W", watts: 500 },
  { id: "psu-550", name: "Fonte de 550 W reais", search: "fonte 550W", watts: 550 },
  { id: "psu-650", name: "Fonte de 650 W reais", search: "fonte 650W", watts: 650 },
  { id: "psu-750", name: "Fonte de 750 W reais", search: "fonte 750W", watts: 750 },
  { id: "psu-850", name: "Fonte de 850 W reais", search: "fonte 850W", watts: 850 },
  { id: "psu-1000", name: "Fonte de 1000 W reais", search: "fonte 1000W", watts: 1000 },
];

export const CASES: Case[] = [
  { id: "case-itx", name: "Gabinete mini-ITX (compacto)", search: "gabinete mini ITX", maxFormFactor: "ITX" },
  { id: "case-matx", name: "Gabinete mATX (aceita mATX e ITX)", search: "gabinete mATX", maxFormFactor: "mATX" },
  { id: "case-atx", name: "Gabinete ATX (aceita ATX, mATX e ITX)", search: "gabinete ATX mid tower", maxFormFactor: "ATX" },
];

// ratedW = faixa de refrigeração típica da categoria (referência, varia por modelo).
export const COOLERS: Cooler[] = [
  { id: "cool-basic", name: "Cooler de ar básico (indicado até ~100 W)", search: "cooler processador", ratedW: 100, sockets: null },
  { id: "cool-tower", name: "Cooler de ar torre (indicado até ~150 W)", search: "cooler torre processador", ratedW: 150, sockets: null },
  { id: "cool-aio240", name: "Water cooler 240 mm (indicado até ~220 W)", search: "water cooler 240mm", ratedW: 220, sockets: null },
  { id: "cool-aio360", name: "Water cooler 360 mm (indicado até ~300 W)", search: "water cooler 360mm", ratedW: 300, sockets: null },
];
