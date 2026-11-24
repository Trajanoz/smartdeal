import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useSession } from "./useSession";
import type { Selection } from "./compat";

export interface SavedBuild {
  id: string;
  name: string;
  selection: Selection;
  prices: Record<string, string>;
  updatedAt: string;
}

interface Row {
  id: string;
  name: string;
  selection: Selection;
  prices: Record<string, string> | null;
  updated_at: string;
}

export function usePcBuilds() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const loggedIn = supabase !== null && userId !== null;

  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const reload = useCallback(async () => {
    if (!supabase || !userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("pc_builds")
      .select("id, name, selection, prices, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      setMessage("Não foi possível carregar suas montagens: " + error.message);
    } else {
      setBuilds(
        ((data ?? []) as unknown as Row[]).map((r) => ({
          id: r.id,
          name: r.name,
          selection: r.selection,
          prices: r.prices ?? {},
          updatedAt: r.updated_at,
        }))
      );
      setMessage("");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (loggedIn) {
      reload();
    } else {
      setBuilds([]);
    }
  }, [loggedIn, reload]);

  async function create(
    name: string,
    selection: Selection,
    prices: Record<string, string>
  ): Promise<string | null> {
    if (!supabase || !loggedIn) return null;
    const { data, error } = await supabase
      .from("pc_builds")
      .insert({ name, selection, prices })
      .select("id")
      .single();
    if (error || !data) {
      setMessage("Não foi possível salvar a montagem: " + (error?.message ?? ""));
      return null;
    }
    await reload();
    return data.id as string;
  }

  async function update(
    id: string,
    name: string,
    selection: Selection,
    prices: Record<string, string>
  ): Promise<boolean> {
    if (!supabase || !loggedIn) return false;
    const { error } = await supabase
      .from("pc_builds")
      .update({ name, selection, prices, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setMessage("Não foi possível atualizar a montagem: " + error.message);
      return false;
    }
    await reload();
    return true;
  }

  async function duplicate(b: SavedBuild): Promise<string | null> {
    return create(b.name + " (cópia)", b.selection, b.prices);
  }

  async function remove(id: string): Promise<boolean> {
    if (!supabase || !loggedIn) return false;
    const { error } = await supabase.from("pc_builds").delete().eq("id", id);
    if (error) {
      setMessage("Não foi possível excluir a montagem: " + error.message);
      return false;
    }
    await reload();
    return true;
  }

  return { loggedIn, builds, loading, message, create, update, duplicate, remove };
}
