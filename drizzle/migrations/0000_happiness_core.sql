CREATE TABLE public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  photo_path text,
  caption text,
  memory_date date NOT NULL DEFAULT current_date,
  location text,
  tags text[] NOT NULL DEFAULT '{}',
  collection_ids uuid[] NOT NULL DEFAULT '{}',
  feeling text NOT NULL DEFAULT 'comforting',
  archived boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'upload',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memories TO authenticated;
GRANT ALL ON public.memories TO service_role;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memories" ON public.memories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own collections" ON public.collections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.comfort_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comfort_items TO authenticated;
GRANT ALL ON public.comfort_items TO service_role;
ALTER TABLE public.comfort_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own comfort" ON public.comfort_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  good_thing text,
  intention text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflections TO authenticated;
GRANT ALL ON public.reflections TO service_role;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reflections" ON public.reflections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.preferences (
  user_id uuid PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preferences TO authenticated;
GRANT ALL ON public.preferences TO service_role;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs" ON public.preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own photos read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own photos insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own photos update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own photos delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);