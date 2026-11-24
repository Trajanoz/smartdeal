import { NAV_ITEMS, type PageId } from "../navigation";

interface Props {
  current: PageId;
  onNavigate: (id: PageId) => void;
}

export default function Sidebar({ current, onNavigate }: Props) {
  return (
    <nav className="w-full overflow-y-auto border-b border-white/10 bg-[#121622] p-4 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="hidden px-3 pb-6 pt-2 lg:block">
        <p className="text-xl font-bold tracking-wide">
          Smart<span className="text-[#8b5cf6]">Deal</span>
        </p>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Ofertas, hardware e PCs
        </p>
      </div>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.id === current;
          return (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-[#8b5cf6]/15 text-white ring-1 ring-[#8b5cf6]/40"
                    : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "text-[#8b5cf6]" : ""}
                />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
