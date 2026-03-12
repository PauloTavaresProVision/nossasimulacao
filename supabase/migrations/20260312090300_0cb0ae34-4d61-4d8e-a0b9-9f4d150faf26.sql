
-- Settings table to store site password and calculation factors
CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  site_password TEXT NOT NULL DEFAULT 'Nossa2026',
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.app_settings (id, site_password, factors) 
VALUES ('main', 'Nossa2026', '{}'::jsonb);

-- Allow anonymous read/update (no auth required since site uses simple password)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anyone can update settings" ON public.app_settings
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
