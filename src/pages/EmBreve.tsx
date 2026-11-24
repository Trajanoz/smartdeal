import type { NavItem } from "../navigation";

interface Props {
  item: NavItem;
}

export default function EmBreve({ item }: Props) {
  const Icon = item.icon;
  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">{item.label}</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">{item.description}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center">
        <Icon size={36} className="mx-auto text-[#8b5cf6]" />
        <p className="mt-4 text-lg font-semibold">Em construção</p>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Esta seção será construída na {item.phase} do projeto.
        </p>
      </div>
    </div>
  );
}
