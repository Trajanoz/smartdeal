import { useEffect, useState } from "react";
import {
  BellRing,
  TrendingDown,
  Ticket,
  Heart,
  Cpu,
  Monitor,
  Clock,
  ArrowRight,
  RefreshCw,
  Info,
} from "lucide-react";
import { NAV_ITEMS, type PageId } from "../navigation";
import { useWishlist, formatBRL } from "../lib/wishlist";
import { useCoupons, effectiveStatus } from "../lib/coupons";
import { usePcBuilds } from "../lib/builds";
import { BUILDS } from "../data/builds";

interface Props {
  onNavigate: (id: PageId) => void;
}

const SHORTCUT_IDS: PageId[] = ["ofertas", "builder", "fps", "streaming"];

function Card({
  title,
  icon,
  children,
  linkLabel,
  onLink,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  linkLabel: string;
  onLink: () => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#171d2a] p-5">
      <div className="flex items-center gap-2">
        <span className="text-[#8b5cf6]">{icon}</span>
        <p className="font-semibold">{title}</p>
      </div>
      <div className="mt-3 flex-1 text-sm">{children}</div>
      <button
        onClick={onLink}
        className="mt-4 inline-flex items-center gap-1 self-start text-xs text-[#3b82f6] hover:underline"
      >
        {linkLabel} <ArrowRight size={12} />
      </button>
    </div>
  );
}

const empty = (text: string) => <p className="text-[#94a3b8]">{text}</p>;

export default function Dashboard({ onNavigate }: Props) {
  const wl = useWishlist();
  const cp = useCoupons();
  const bd = usePcBuilds();
  const [updated, setUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!wl.loading && !cp.loading && !bd.loading) setUpdated(new Date());
  }, [
    wl.loading,
    cp.loading,
    bd.loading,
    wl.items.length,
    cp.coupons.length,
    bd.builds.length,
  ]);

  const shortcuts = NAV_ITEMS.filter((i) => SHORTCUT_IDS.includes(i.id));

  const last = (h: { price: number }[]) =>
    h.length ? h[h.length - 1].price : null;

  const reached = wl.items.filter((i) => {
    const l = last(i.history);
    return l !== null && i.targetPrice !== null && l <= i.targetPrice;
  });

  const drops = wl.items
    .filter((i) => {
      if (i.history.length < 2) return false;
      return i.history[i.history.length - 1].price < i.history[i.history.length - 2].price;
    })
    .map((i) => {
      const cur = i.history[i.history.length - 1].price;
      const prev = i.history[i.history.length - 2].price;
      return { item: i, cur, prev, pct: ((cur - prev) / prev) * 100 };
    });

  const activeCoupons = cp.coupons
    .filter((c) => effectiveStatus(c) !== "expired")
    .slice(0, 3);

  const when = updated.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fade-up">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Um resumo da sua conta e dos atalhos principais.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#94a3b8]">
          <span className="flex items-center gap-2">
            <Clock size={16} />
            Atualizado em {when}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/5"
          >
            <RefreshCw size={13} /> Atualizar
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          O SmartDeal ainda não busca promoções automaticamente, porque não
          existe uma fonte gratuita e permitida para isso. Os avisos abaixo
          vêm dos preços que você registra. Para procurar ofertas, use{" "}
          <button
            onClick={() => onNavigate("ofertas")}
            className="text-[#3b82f6] underline"
          >
            Buscar Ofertas
          </button>
          .
        </p>
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
                  <ArrowRight size={12} className="transition group-hover:translate-x-1" />
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
          <Card
            title="Metas de preço atingidas"
            icon={<BellRing size={18} />}
            linkLabel="Abrir Lista de Desejos"
            onLink={() => onNavigate("desejos")}
          >
            {reached.length === 0 ? (
              empty("Nenhum produto da sua lista atingiu a meta.")
            ) : (
              <ul className="space-y-2">
                {reached.slice(0, 3).map((i) => (
                  <li key={i.id}>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-[#22c55e]">
                      {formatBRL(last(i.history) as number)} (meta{" "}
                      {formatBRL(i.targetPrice as number)})
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Quedas de preço registradas"
            icon={<TrendingDown size={18} />}
            linkLabel="Ver histórico de preços"
            onLink={() => onNavigate("desejos")}
          >
            {drops.length === 0 ? (
              empty("Nenhuma queda entre os seus dois últimos registros.")
            ) : (
              <ul className="space-y-2">
                {drops.slice(0, 3).map((d) => (
                  <li key={d.item.id}>
                    <p className="font-medium">{d.item.name}</p>
                    <p className="text-xs text-[#22c55e]">
                      {formatBRL(d.prev)} para {formatBRL(d.cur)} (
                      {(Math.round(d.pct * 10) / 10).toString().replace(".", ",")}%)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Cupons recentes"
            icon={<Ticket size={18} />}
            linkLabel="Abrir Cupons"
            onLink={() => onNavigate("cupons")}
          >
            {!cp.loggedIn ? (
              empty("Entre na sua conta para ver seus cupons.")
            ) : activeCoupons.length === 0 ? (
              empty("Nenhum cupom ativo cadastrado.")
            ) : (
              <ul className="space-y-2">
                {activeCoupons.map((c) => {
                  const s = effectiveStatus(c);
                  return (
                    <li key={c.id}>
                      <p className="font-medium">
                        {c.store}:{" "}
                        <span className="font-mono">{c.code}</span>
                      </p>
                      <p
                        className={`text-xs ${
                          s === "valid" ? "text-[#22c55e]" : "text-[#f59e0b]"
                        }`}
                      >
                        {s === "valid" ? "Válido (confirmado)" : "Não verificado"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Produtos acompanhados"
            icon={<Heart size={18} />}
            linkLabel="Abrir Lista de Desejos"
            onLink={() => onNavigate("desejos")}
          >
            {wl.items.length === 0 ? (
              empty("Sua lista de desejos está vazia.")
            ) : (
              <>
                <p className="text-2xl font-bold">{wl.items.length}</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[#94a3b8]">
                  {wl.items.slice(0, 3).map((i) => (
                    <li key={i.id}>{i.name}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          <Card
            title="Montagens salvas"
            icon={<Cpu size={18} />}
            linkLabel="Abrir PC Builder"
            onLink={() => onNavigate("builder")}
          >
            {!bd.loggedIn ? (
              empty("Entre na sua conta para ver suas montagens.")
            ) : bd.builds.length === 0 ? (
              empty("Nenhuma montagem salva ainda.")
            ) : (
              <>
                <p className="text-2xl font-bold">{bd.builds.length}</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[#94a3b8]">
                  {bd.builds.slice(0, 3).map((b) => (
                    <li key={b.id}>{b.name}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          <Card
            title="PCs recomendados"
            icon={<Monitor size={18} />}
            linkLabel="Ver as 7 faixas"
            onLink={() => onNavigate("recomendados")}
          >
            <ul className="space-y-0.5 text-xs text-[#94a3b8]">
              {BUILDS.slice(0, 4).map((b) => (
                <li key={b.id}>{b.tier}</li>
              ))}
              <li>e mais {BUILDS.length - 4} faixas</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
