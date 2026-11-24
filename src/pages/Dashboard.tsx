import {
  Flame,
  TrendingDown,
  Ticket,
  Cpu,
  Monitor,
  Heart,
  Clock,
  ArrowRight,
} from "lucide-react";
import { NAV_ITEMS, type PageId } from "../navigation";

interface Props {
  onNavigate: (id: PageId) => void;
}

const CARDS = [
  { title: "Melhores promoções", icon: Flame, phase: "Fase 2" },
  { title: "Quedas de preço", icon: TrendingDown, phase: "Fase 2" },
  { title: "Cupons recentes", icon: Ticket, phase: "Fase 3" },
  { title: "Hardware em destaque", icon: Cpu, phase: "Fase 4" },
  { title: "PCs recomendados", icon: Monitor, phase: "Fase 4" },
  { title: "Produtos acompanhados", icon: Heart, phase: "Fase 2" },
];

const SHORTCUT_IDS: PageId[] = ["ofertas", "builder", "fps", "streaming"];

export default function Dashboard({ onNavigate }: Props) {
  const shortcuts = NAV_ITEMS.filter((i) => SHORTCUT_IDS.includes(i.id));

  return (
    <div className="fade-up">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            As melhores oportunidades vão aparecer aqui.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
          <Clock size={16} />
          Última atualização: nenhuma ainda
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8b5cf6]">
          Atalhos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group rounded-2xl border border-white/10 bg-[#171d2a] p-4 text-left transition hover:border-[#8b5cf6]/50 hover:bg-[#1b2232]"
              >
                <Icon size={22} className="text-[#3b82f6]" />
                <p className="mt-3 font-semibold">{item.label}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#94a3b8]">
                  Abrir
                  <ArrowRight
                    size={12}
                    className="transition group-hover:translate-x-1"
                  />
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8b5cf6]">
          Visão geral
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-[#171d2a] p-5"
              >
                <div className="flex items-center justify-between">
                  <Icon size={20} className="text-[#8b5cf6]" />
                  <span className="rounded-full bg-[#f59e0b]/15 px-2.5 py-0.5 text-xs text-[#f59e0b]">
                    Disponível na {card.phase}
                  </span>
                </div>
                <p className="mt-4 font-semibold">{card.title}</p>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  Nenhum dado ainda.
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
