import { useState, type FormEvent } from "react";
import {
  LogIn,
  LogOut,
  UserPlus,
  MailCheck,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSession } from "../lib/useSession";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121622] px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#8b5cf6]";

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Procure a mensagem na caixa de entrada ou no spam.";
  if (m.includes("already registered"))
    return "Este e-mail já tem cadastro. Use a opção Entrar.";
  if (m.includes("rate limit"))
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  if (m.includes("password"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  return "Não foi possível concluir: " + message;
}

export default function MeuPerfil() {
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setInfo("");
    setBusy(true);

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) setError(translate(err.message));
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (err) {
        setError(translate(err.message));
      } else if (!data.session) {
        setInfo(
          "Cadastro feito! Enviamos um e-mail de confirmação. Clique no link dele e depois volte aqui para entrar."
        );
      }
    }
    setBusy(false);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
  }

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold sm:text-3xl">Meu Perfil</h1>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Cadastro, login e suas preferências.
      </p>

      {!supabase ? (
        <div className="mt-8 flex gap-3 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-5 text-sm">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#f59e0b]" />
          <p className="text-[#cbd5e1]">
            O login está indisponível porque a conexão com o Supabase não foi
            configurada neste site. O restante do SmartDeal continua
            funcionando normalmente.
          </p>
        </div>
      ) : loading ? (
        <p className="mt-8 text-sm text-[#94a3b8]">Carregando...</p>
      ) : session ? (
        <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-[#171d2a] p-6">
          <p className="text-xs uppercase tracking-widest text-[#8b5cf6]">
            Conta conectada
          </p>
          <p className="mt-2 break-all font-semibold">{session.user.email}</p>
          <p className="mt-3 text-sm text-[#94a3b8]">
            A sincronização da Lista de Desejos com a sua conta será ativada
            na próxima etapa.
          </p>
          <button
            onClick={signOut}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm transition hover:bg-white/5"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="mt-8 max-w-md rounded-2xl border border-white/10 bg-[#171d2a] p-6"
        >
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-[#121622] p-1 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setInfo("");
              }}
              className={`rounded-lg py-2 transition ${
                mode === "login"
                  ? "bg-[#8b5cf6]/20 text-white"
                  : "text-[#94a3b8]"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setInfo("");
              }}
              className={`rounded-lg py-2 transition ${
                mode === "signup"
                  ? "bg-[#8b5cf6]/20 text-white"
                  : "text-[#94a3b8]"
              }`}
            >
              Criar conta
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              autoComplete="email"
              className={inputClass}
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mínimo 6 caracteres)"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className={inputClass}
            />
          </div>

          {error !== "" && (
            <p className="mt-3 text-sm text-[#ef4444]">{error}</p>
          )}
          {info !== "" && (
            <p className="mt-3 flex gap-2 text-sm text-[#22c55e]">
              <MailCheck size={16} className="mt-0.5 shrink-0" />
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#7c4ee8] disabled:opacity-60"
          >
            {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {busy
              ? "Aguarde..."
              : mode === "login"
              ? "Entrar"
              : "Criar conta"}
          </button>
        </form>
      )}
    </div>
  );
}
