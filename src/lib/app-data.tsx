import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { blobToDataUrl, compressImage, dataUrlToBlob } from "./image";
import {
  defaultPrefs,
  type Collection,
  type ComfortItem,
  type ComfortKind,
  type Memory,
  type NewMemoryInput,
  type Prefs,
  type Reflection,
} from "./types";

/**
 * Single data layer for the app. Guests keep everything on this device (localStorage);
 * signed-in users read/write their private rows in Lovable Cloud (RLS: owner only).
 * Memory sources are abstracted via `source` so a future Google Photos import can add rows here.
 */

const LS = {
  memories: "alh:memories",
  collections: "alh:collections",
  comfort: "alh:comfort",
  reflections: "alh:reflections",
  prefs: "alh:prefs",
};

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("This device is out of space for more photos. Create a free account to keep saving.");
  }
}
const uid = () => crypto.randomUUID();

type MemoryRow = {
  id: string;
  photo_path: string | null;
  caption: string | null;
  memory_date: string;
  location: string | null;
  tags: string[];
  collection_ids: string[];
  feeling: string;
  archived: boolean;
  source: string;
  created_at: string;
};

interface AppData {
  ready: boolean;
  session: Session | null;
  isGuest: boolean;
  memories: Memory[];
  collections: Collection[];
  comfort: ComfortItem[];
  reflections: Reflection[];
  prefs: Prefs;
  deviceMemoryCount: number;
  addMemory: (input: NewMemoryInput) => Promise<void>;
  updateMemory: (id: string, patch: Partial<Pick<Memory, "caption" | "date" | "location" | "tags" | "collectionIds" | "feeling" | "archived">>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  addCollection: (name: string) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  addComfort: (kind: ComfortKind, value: string) => Promise<void>;
  removeComfort: (id: string) => Promise<void>;
  addReflection: (goodThing: string, intention: string) => Promise<void>;
  setPrefs: (patch: Partial<Prefs>) => void;
  moveDeviceDataToAccount: () => Promise<number>;
  exportData: () => Promise<void>;
  deleteAllData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AppData | null>(null);

export function useAppData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppData must be used inside AppDataProvider");
  return v;
}

function rowToMemory(r: MemoryRow, url: string | null): Memory {
  return {
    id: r.id,
    photoPath: r.photo_path,
    photoUrl: url,
    caption: r.caption ?? "",
    date: r.memory_date,
    location: r.location ?? "",
    tags: r.tags ?? [],
    collectionIds: r.collection_ids ?? [],
    feeling: (r.feeling as Memory["feeling"]) ?? "comforting",
    archived: r.archived,
    source: (r.source as Memory["source"]) ?? "upload",
    createdAt: r.created_at,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [comfort, setComfort] = useState<ComfortItem[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [prefs, setPrefsState] = useState<Prefs>(defaultPrefs);
  const [deviceMemoryCount, setDeviceMemoryCount] = useState(0);
  const userId = session?.user.id ?? null;

  // auth
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setReady(true);
    });
    setPrefsState({ ...defaultPrefs, ...readLS<Partial<Prefs>>(LS.prefs, {}) });
    return () => data.subscription.unsubscribe();
  }, []);

  const loadLocal = useCallback(() => {
    const m = readLS<Memory[]>(LS.memories, []);
    setDeviceMemoryCount(m.length);
    return m;
  }, []);

  const loadCloud = useCallback(async (id: string) => {
    const [m, c, k, r, p] = await Promise.all([
      supabase.from("memories").select("*").order("memory_date", { ascending: false }),
      supabase.from("collections").select("id,name").order("created_at"),
      supabase.from("comfort_items").select("id,kind,value").order("created_at"),
      supabase.from("reflections").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("preferences").select("data").eq("user_id", id).maybeSingle(),
    ]);
    const rows = (m.data ?? []) as MemoryRow[];
    const paths = rows.map((r) => r.photo_path).filter((x): x is string => !!x);
    const urls = new Map<string, string>();
    if (paths.length) {
      const { data } = await supabase.storage.from("memories").createSignedUrls(paths, 60 * 60 * 6);
      data?.forEach((d) => d.path && d.signedUrl && urls.set(d.path, d.signedUrl));
    }
    setMemories(rows.map((r) => rowToMemory(r, r.photo_path ? urls.get(r.photo_path) ?? null : null)));
    setCollections((c.data ?? []) as Collection[]);
    setComfort((k.data ?? []) as ComfortItem[]);
    setReflections(
      (r.data ?? []).map((x) => ({ id: x.id, goodThing: x.good_thing ?? "", intention: x.intention ?? "", createdAt: x.created_at })),
    );
    if (p.data?.data) {
      const merged = { ...defaultPrefs, ...(p.data.data as Partial<Prefs>) };
      setPrefsState(merged);
      writeLS(LS.prefs, merged);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const local = loadLocal();
    if (userId) {
      loadCloud(userId).catch(() => undefined);
    } else {
      setMemories(local);
      setCollections(readLS(LS.collections, []));
      setComfort(readLS(LS.comfort, []));
      setReflections(readLS(LS.reflections, []));
    }
  }, [ready, userId, loadCloud, loadLocal]);

  // theme + motion
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", prefs.theme === "dark");
    el.classList.toggle("reduce-motion", prefs.reduceMotion);
  }, [prefs.theme, prefs.reduceMotion]);

  const refresh = useCallback(async () => {
    if (userId) await loadCloud(userId);
  }, [userId, loadCloud]);

  const persistLocal = (key: string, next: unknown) => writeLS(key, next);

  const addMemory: AppData["addMemory"] = async (input) => {
    const blob = input.file ? await compressImage(input.file) : null;
    if (!blob && !input.caption.trim()) throw new Error("Add a photo or a few words to save this moment.");
    if (userId) {
      let path: string | null = null;
      if (blob) {
        path = `${userId}/${uid()}.jpg`;
        const up = await supabase.storage.from("memories").upload(path, blob, { contentType: "image/jpeg" });
        if (up.error) throw new Error("Your photo didn't upload. Please check your connection and try again.");
      }
      const { error } = await supabase.from("memories").insert({
        user_id: userId,
        photo_path: path,
        caption: input.caption.trim() || null,
        memory_date: input.date,
        location: input.location.trim() || null,
        tags: input.tags,
        collection_ids: input.collectionIds,
      });
      if (error) throw new Error("We couldn't save this memory just now. Please try again.");
      await refresh();
    } else {
      const m: Memory = {
        id: uid(),
        photoUrl: blob ? await blobToDataUrl(blob) : null,
        photoPath: null,
        caption: input.caption.trim(),
        date: input.date,
        location: input.location.trim(),
        tags: input.tags,
        collectionIds: input.collectionIds,
        feeling: "comforting",
        archived: false,
        source: "upload",
        createdAt: new Date().toISOString(),
      };
      const next = [m, ...memories];
      persistLocal(LS.memories, next);
      setMemories(next);
      setDeviceMemoryCount(next.length);
    }
  };

  const updateMemory: AppData["updateMemory"] = async (id, patch) => {
    if (userId) {
      const row: Database["public"]["Tables"]["memories"]["Update"] = {};
      if (patch.caption !== undefined) row.caption = patch.caption;
      if (patch.date !== undefined) row.memory_date = patch.date;
      if (patch.location !== undefined) row.location = patch.location;
      if (patch.tags !== undefined) row.tags = patch.tags;
      if (patch.collectionIds !== undefined) row.collection_ids = patch.collectionIds;
      if (patch.feeling !== undefined) row.feeling = patch.feeling;
      if (patch.archived !== undefined) row.archived = patch.archived;
      const { error } = await supabase.from("memories").update(row).eq("id", id);
      if (error) throw new Error("Changes weren't saved. Please try again.");
      setMemories((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    } else {
      const next = memories.map((m) => (m.id === id ? { ...m, ...patch } : m));
      persistLocal(LS.memories, next);
      setMemories(next);
    }
  };

  const deleteMemory: AppData["deleteMemory"] = async (id) => {
    const m = memories.find((x) => x.id === id);
    if (userId) {
      if (m?.photoPath) await supabase.storage.from("memories").remove([m.photoPath]);
      const { error } = await supabase.from("memories").delete().eq("id", id);
      if (error) throw new Error("We couldn't delete that. Please try again.");
      setMemories((ms) => ms.filter((x) => x.id !== id));
    } else {
      const next = memories.filter((x) => x.id !== id);
      persistLocal(LS.memories, next);
      setMemories(next);
      setDeviceMemoryCount(next.length);
    }
  };

  const addCollection: AppData["addCollection"] = async (name) => {
    const clean = name.trim().slice(0, 60);
    if (!clean) throw new Error("Give your collection a name.");
    if (userId) {
      const { data, error } = await supabase.from("collections").insert({ user_id: userId, name: clean }).select("id,name").single();
      if (error || !data) throw new Error("Couldn't create that collection.");
      setCollections((c) => [...c, data]);
      return data;
    }
    const c = { id: uid(), name: clean };
    const next = [...collections, c];
    persistLocal(LS.collections, next);
    setCollections(next);
    return c;
  };

  const deleteCollection: AppData["deleteCollection"] = async (id) => {
    if (userId) {
      await supabase.from("collections").delete().eq("id", id);
    } else {
      persistLocal(LS.collections, collections.filter((c) => c.id !== id));
    }
    setCollections((c) => c.filter((x) => x.id !== id));
  };

  const addComfort: AppData["addComfort"] = async (kind, value) => {
    const v = value.trim().slice(0, 280);
    if (!v) return;
    if (userId) {
      const { error } = await supabase.from("comfort_items").insert({ user_id: userId, kind, value: v });
      if (error) throw new Error("Couldn't add that to your kit.");
      await refresh();
    } else {
      const next = [...comfort, { id: uid(), kind, value: v }];
      persistLocal(LS.comfort, next);
      setComfort(next);
    }
  };

  const removeComfort: AppData["removeComfort"] = async (id) => {
    if (userId) await supabase.from("comfort_items").delete().eq("id", id);
    else persistLocal(LS.comfort, comfort.filter((c) => c.id !== id));
    setComfort((c) => c.filter((x) => x.id !== id));
  };

  const addReflection: AppData["addReflection"] = async (goodThing, intention) => {
    if (!goodThing.trim() && !intention.trim()) return;
    if (userId) {
      const { error } = await supabase
        .from("reflections")
        .insert({ user_id: userId, good_thing: goodThing.trim() || null, intention: intention.trim() || null });
      if (error) throw new Error("Couldn't save your reflection.");
      await refresh();
    } else {
      const next = [{ id: uid(), goodThing, intention, createdAt: new Date().toISOString() }, ...reflections];
      persistLocal(LS.reflections, next);
      setReflections(next);
    }
  };

  const setPrefs: AppData["setPrefs"] = (patch) => {
    setPrefsState((p) => {
      const next = { ...p, ...patch };
      writeLS(LS.prefs, next);
      if (userId) {
        supabase.from("preferences").upsert({ user_id: userId, data: next as never, updated_at: new Date().toISOString() }).then();
      }
      return next;
    });
  };

  const moveDeviceDataToAccount = async () => {
    if (!userId) return 0;
    const local = readLS<Memory[]>(LS.memories, []);
    const localCols = readLS<Collection[]>(LS.collections, []);
    const idMap = new Map<string, string>();
    for (const c of localCols) {
      const { data } = await supabase.from("collections").insert({ user_id: userId, name: c.name }).select("id").single();
      if (data) idMap.set(c.id, data.id);
    }
    let moved = 0;
    for (const m of local) {
      let path: string | null = null;
      if (m.photoUrl) {
        path = `${userId}/${uid()}.jpg`;
        const up = await supabase.storage.from("memories").upload(path, await dataUrlToBlob(m.photoUrl), { contentType: "image/jpeg" });
        if (up.error) continue;
      }
      const { error } = await supabase.from("memories").insert({
        user_id: userId,
        photo_path: path,
        caption: m.caption || null,
        memory_date: m.date,
        location: m.location || null,
        tags: m.tags,
        collection_ids: m.collectionIds.map((x) => idMap.get(x)).filter((x): x is string => !!x),
        feeling: m.feeling,
        archived: m.archived,
      });
      if (!error) moved++;
    }
    for (const k of readLS<ComfortItem[]>(LS.comfort, [])) {
      await supabase.from("comfort_items").insert({ user_id: userId, kind: k.kind, value: k.value });
    }
    [LS.memories, LS.collections, LS.comfort, LS.reflections].forEach((k) => localStorage.removeItem(k));
    setDeviceMemoryCount(0);
    await refresh();
    return moved;
  };

  const exportData = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Your A Little Happier data. Photo links from your account expire after a few hours.",
      memories,
      collections,
      comfortKit: comfort,
      reflections,
      preferences: prefs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `a-little-happier-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const deleteAllData = async () => {
    if (userId) {
      const paths = memories.map((m) => m.photoPath).filter((x): x is string => !!x);
      if (paths.length) await supabase.storage.from("memories").remove(paths);
      await Promise.all([
        supabase.from("memories").delete().eq("user_id", userId),
        supabase.from("collections").delete().eq("user_id", userId),
        supabase.from("comfort_items").delete().eq("user_id", userId),
        supabase.from("reflections").delete().eq("user_id", userId),
        supabase.from("preferences").delete().eq("user_id", userId),
      ]);
    }
    Object.values(LS).forEach((k) => localStorage.removeItem(k));
    setMemories([]);
    setCollections([]);
    setComfort([]);
    setReflections([]);
    setPrefsState(defaultPrefs);
    setDeviceMemoryCount(0);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMemories(readLS(LS.memories, []));
  };

  const value = useMemo<AppData>(
    () => ({
      ready,
      session,
      isGuest: !session,
      memories,
      collections,
      comfort,
      reflections,
      prefs,
      deviceMemoryCount,
      addMemory,
      updateMemory,
      deleteMemory,
      addCollection,
      deleteCollection,
      addComfort,
      removeComfort,
      addReflection,
      setPrefs,
      moveDeviceDataToAccount,
      exportData,
      deleteAllData,
      signOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, session, memories, collections, comfort, reflections, prefs, deviceMemoryCount],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Memories that are OK to resurface: not archived, not marked as "don't show me". */
export function resurfaceable(ms: Memory[]) {
  return ms.filter((m) => !m.archived && m.feeling !== "avoid");
}
