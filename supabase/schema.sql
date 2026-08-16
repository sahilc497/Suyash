-- Supabase Schema for BuildPulse

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (for admins)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  content TEXT, -- Markdown or HTML content
  difficulty TEXT,
  status TEXT,
  progress INTEGER DEFAULT 0,
  github_url TEXT,
  architecture_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES public.profiles(id),
  category TEXT,
  content TEXT, -- Markdown or HTML
  reading_time INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build Logs table
CREATE TABLE public.build_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  log_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Posts table (Synced from YouTube/Instagram)
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram')),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  content_url TEXT NOT NULL,
  content_type TEXT, -- 'video', 'short', 'reel', 'live'
  published_at TIMESTAMPTZ,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor Inquiries table
CREATE TABLE public.sponsor_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  campaign_type TEXT,
  product TEXT,
  budget TEXT,
  timeline TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) setup

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Anyone can read published projects. Admins can do everything.
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

-- Articles: Anyone can read published articles. Admins can do everything.
CREATE POLICY "Public can view published articles" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (auth.role() = 'authenticated');

-- Build Logs: Anyone can read logs for published projects.
CREATE POLICY "Public can view build logs" ON public.build_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = build_logs.project_id AND projects.is_published = true)
);
CREATE POLICY "Admins can manage build logs" ON public.build_logs FOR ALL USING (auth.role() = 'authenticated');

-- Social Posts: Anyone can read. Admins can manage.
CREATE POLICY "Public can view social posts" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Admins can manage social posts" ON public.social_posts FOR ALL USING (auth.role() = 'authenticated');

-- Sponsor Inquiries: Anyone can insert. Only admins can read/update.
CREATE POLICY "Public can insert sponsor inquiries" ON public.sponsor_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage sponsor inquiries" ON public.sponsor_inquiries FOR ALL USING (auth.role() = 'authenticated');
