import {
  LayoutDashboard,
  Search,
  Heart,
  Ticket,
  Cpu,
  Monitor,
  Gauge,
  Radio,
  Scale,
  User,
  type LucideIcon,
} from "lucide-react";

export type PageId =
  | "dashboard"
  | "ofertas"
  | "desejos"
  | "cupons"
  | "builder"
  | "recomendados"
  | "fps"
  | "streaming"
  | "comparador"
  | "perfil";

export interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
  phase: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    phase: "Fase 1",
    description: "Visão geral das melhores oportunidades.",
  },
  {
    id: "ofertas",
    label: "Buscar Ofertas",
    icon: Search,
    phase: "Fase 2",
    description: "Pesquise produtos e compare preços entre lojas.",
  },
  {
    id: "desejos",
    label: "Lista de Desejos",
    icon: Heart,
    phase: "Fase 2",
    description: "Acompanhe preços e receba aviso quando chegarem ao valor desejado.",
  },
  {
    id: "cupons",
    label: "Cupons",
    icon: Ticket,
    phase: "Fase 3",
    description: "Cupons com status de verificação e cálculo do preço final.",
  },
  {
    id: "builder",
    label: "PC Builder",
    icon: Cpu,
    phase: "Fase 4",
    description: "Monte seu computador com verificação de compatibilidade.",
  },
  {
    id: "recomendados",
    label: "PCs Recomendados",
    icon: Monitor,
    phase: "Fase 4",
    description: "Montagens sugeridas por faixa de preço.",
  },
  {
    id: "fps",
    label: "Simulador de FPS",
    icon: Gauge,
    phase: "Fase 5",
    description: "Estimativas de FPS baseadas em benchmarks reais.",
  },
  {
    id: "streaming",
    label: "Streaming Analyzer",
    icon: Radio,
    phase: "Fase 5",
    description: "Avalie se o PC consegue jogar e transmitir ao mesmo tempo.",
  },
  {
    id: "comparador",
    label: "Comparador de Hardware",
    icon: Scale,
    phase: "Fase 5",
    description: "Compare componentes lado a lado.",
  },
  {
    id: "perfil",
    label: "Meu Perfil",
    icon: User,
    phase: "Fase 2",
    description: "Cadastro, login e suas preferências.",
  },
];
