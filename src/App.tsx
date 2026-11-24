import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, type PageId } from "./navigation";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import BuscarOfertas from "./pages/BuscarOfertas";
import EmBreve from "./pages/EmBreve";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV_ITEMS.find((i) => i.id === page)!;

  function go(id: PageId) {
    setPage(id);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }

  function renderPage() {
    if (page === "dashboard") return <Dashboard onNavigate={go} />;
    if (page === "ofertas") return <BuscarOfertas />;
    return <EmBreve item={current} />;
  }

  return (
    <div className="min-h-screen bg-[#090b12] text-[#f8fafc] lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#121622]/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-bold tracking-wide">
          Smart<span className="text-[#8b5cf6]">Deal</span>
        </span>
        <button
          aria-label="Abrir ou fechar o menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 hover:bg-white/10"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <div
        className={`${
          menuOpen ? "block" : "hidden"
        } lg:sticky lg:top-0 lg:block lg:h-screen`}
      >
        <Sidebar current={page} onNavigate={go} />
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-8">
        {renderPage()}
      </main>
    </div>
  );
}
