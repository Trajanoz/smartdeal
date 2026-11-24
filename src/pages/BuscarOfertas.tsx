import { useState, type FormEvent } from "react";
import {
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { STORES } from "../stores";

const EXAMPLES = [
  "RTX 5070",
  "Ryzen 7 5700X",
  "Monitor 144 Hz",
  "SSD NVMe 1 TB",
  "Samsung Galaxy S25",
  "Teclado mecânico",
];

export default function BuscarOfertas() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    setQuery(text.trim());
  }

  function pick(example: string) {
    setText(example);
    setQuery(example);
  }

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">Buscar Ofertas</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Pesquise um produto e abra a busca direto nas lojas.
      </p>

      <form onSubmit={submit} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex.: RTX 5070, Ryzen 7 5700X, monitor 144 Hz"
            className="w-full rounded-xl border border-white/10 bg-[#171d2a] py-3 pl-10 pr-3 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[#8b5cf6] px-5 text-sm font-semibold transition hover:bg-[#7c4ee8]"
        >
          Buscar
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => pick(ex)}
            className="rounded-full border border-white/10 bg-[#121622] px-3 py-1 text-xs text-[#94a3b8] transition hover:border-[#8b5cf6]/50 hover:text-white"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
        <p className="text-[#cbd5e1]">
          Por enquanto o SmartDeal não mostra preços aqui. Ao clicar, você vai
          para o site da loja, que exibe o preço e a disponibilidade atuais.
          Os preços cadastrados com data de verificação chegam na próxima parte
          desta fase.
        </p>
      </div>

      {query === "" ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#171d2a] p-10 text-center text-sm text-[#94a3b8]">
          Digite um produto acima para ver os links de busca das lojas.
        </div>
      ) : (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8b5cf6]">
            Resultados para "{query}"
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {STORES.map((store) => (
              <a
                key={store.id}
                href={store.buildUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-[#171d2a] p-5 transition hover:border-[#8b5cf6]/50 hover:bg-[#1b2232]"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{store.name}</p>
                  <ExternalLink
                    size={16}
                    className="text-[#94a3b8] transition group-hover:text-white"
                  />
                </div>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  Abrir busca na loja
                </p>
                {store.confirmed ? (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#22c55e]/15 px-2.5 py-0.5 text-xs text-[#22c55e]">
                    <CheckCircle2 size={12} />
                    Formato confirmado
                  </span>
                ) : (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#f59e0b]/15 px-2.5 py-0.5 text-xs text-[#f59e0b]">
                    <AlertTriangle size={12} />
                    Formato não confirmado
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
