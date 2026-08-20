-- ========================================================
-- BuildPulse / Ideas by Suyash - Complete Supabase Schema
-- Run this script in the Supabase SQL Editor for new accounts.
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Admin & Team Members)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE (Hardware Build Logs & Schematics)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  content TEXT, -- Markdown or HTML
  category TEXT DEFAULT 'Arduino & ESP32',
  difficulty TEXT DEFAULT 'Intermediate',
  status TEXT DEFAULT 'In Progress',
  progress INTEGER DEFAULT 0,
  github_url TEXT,
  architecture_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ARTICLES TABLE (Technical Blog Posts & Guides)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'Hardware Design',
  content TEXT,
  reading_time INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BUILD LOGS TABLE (Project Updates)
CREATE TABLE IF NOT EXISTS public.build_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  log_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SOCIAL POSTS TABLE (YouTube & Instagram Sync)
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram')),
  external_id TEXT UNIQUE,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'Tutorial',
  thumbnail_url TEXT,
  content_url TEXT NOT NULL,
  content_type TEXT DEFAULT 'video',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SPONSOR INQUIRIES TABLE (Contact & Sponsorships)
CREATE TABLE IF NOT EXISTS public.sponsor_inquiries (
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

-- 7. HERO SLIDESHOW SLIDES TABLE (Homepage Hero Carousel)
CREATE TABLE IF NOT EXISTS public.slideshow_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'EMBEDDED HARDWARE',
  image_url TEXT NOT NULL,
  video_url TEXT,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RECOMMENDED TOOLS & GEAR TABLE (Hardware & Software Links)
CREATE TABLE IF NOT EXISTS public.recommended_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Lab Equipment',
  description TEXT NOT NULL,
  link_url TEXT,
  image_url TEXT,
  price TEXT,
  is_recommended BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_tools ENABLE ROW LEVEL SECURITY;

-- Public Select Policies
CREATE POLICY "Public Read Access to Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Access to Published Projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Access to Published Articles" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Access to Build Logs" ON public.build_logs FOR SELECT USING (true);
CREATE POLICY "Public Read Access to Social Posts" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Public Read Access to Active Slideshow Slides" ON public.slideshow_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Access to Recommended Tools" ON public.recommended_tools FOR SELECT USING (is_recommended = true);

-- Public Insert Policies
CREATE POLICY "Public Can Submit Sponsor Inquiries" ON public.sponsor_inquiries FOR INSERT WITH CHECK (true);

-- Authenticated Full Access Policies
CREATE POLICY "Admins Full Access to Profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Admins Full Access to Projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Admins Full Access to Articles" ON public.articles FOR ALL USING (true);
CREATE POLICY "Admins Full Access to Build Logs" ON public.build_logs FOR ALL USING (true);
CREATE POLICY "Admins Full Access to Social Posts" ON public.social_posts FOR ALL USING (true);
CREATE POLICY "Admins Full Access to Sponsor Inquiries" ON public.sponsor_inquiries FOR ALL USING (true);
CREATE POLICY "Admins Full Access to Slideshow Slides" ON public.slideshow_slides FOR ALL USING (true);
CREATE POLICY "Admins Full Access to Recommended Tools" ON public.recommended_tools FOR ALL USING (true);

-- ========================================================
-- SUPABASE STORAGE BUCKETS & POLICIES
-- ========================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('slideshow-images', 'slideshow-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tool-images', 'tool-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('project-covers', 'project-covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Read slideshow-images" ON storage.objects FOR SELECT USING (bucket_id = 'slideshow-images');
CREATE POLICY "Public Storage Read tool-images" ON storage.objects FOR SELECT USING (bucket_id = 'tool-images');
CREATE POLICY "Public Storage Read project-covers" ON storage.objects FOR SELECT USING (bucket_id = 'project-covers');

CREATE POLICY "Public Storage Insert slideshow-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'slideshow-images');
CREATE POLICY "Public Storage Insert tool-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tool-images');
CREATE POLICY "Public Storage Insert project-covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-covers');

-- ========================================================
-- DEFAULT SEED DATA
-- ========================================================

-- Seed Hero Slides
INSERT INTO public.slideshow_slides (title, description, category, image_url, video_url, display_order, is_active)
VALUES
  (
    'ESP32 Handheld Game Console',
    'Custom perfboard gaming handheld powered by ESP32 with SPI display & physical controls.',
    'EMBEDDED HARDWARE',
    '/slideshow/slide1.png',
    'https://www.youtube.com/@IdeasbySuyashDesai',
    1,
    true
  ),
  (
    'Ideas by Suyash Studio & YouTube',
    'Over 110+ engineering videos documenting robotics, IoT, and custom circuits.',
    'LAB SETUP & YOUTUBE',
    '/slideshow/slide2.png',
    'https://www.youtube.com/@IdeasbySuyashDesai',
    2,
    true
  ),
  (
    'Autonomous 4WD Mobile Rover',
    '4-wheel drive robotic platform equipped with smartphone gimbal vision & motor driver shield.',
    'AUTONOMOUS ROBOTICS',
    '/slideshow/slide3.jpg',
    'https://www.youtube.com/@IdeasbySuyashDesai',
    3,
    true
  ),
  (
    'Long Range RF Transceiver Module',
    'Custom wireless telemetry transmitter board designed for real-time sensor data link.',
    'RADIO TELEMETRY',
    '/slideshow/slide4.png',
    'https://www.youtube.com/@IdeasbySuyashDesai',
    4,
    true
  )
ON CONFLICT DO NOTHING;

-- Seed Recommended Tools & Gear
INSERT INTO public.recommended_tools (name, category, description, link_url, price, is_recommended, display_order)
VALUES
  ('TS101 Smart Soldering Iron', 'Lab Equipment', 'Portable USB-C powered soldering iron with PID temperature control.', 'https://amazon.com', '$59', true, 1),
  ('STM32F4 / STM32H7 Microcontrollers', 'Microcontrollers', 'High-performance ARM Cortex-M microcontrollers for real-time control.', 'https://st.com', '$12', true, 2),
  ('ESP32-S3 Dual-Core Wireless SoC', 'Microcontrollers', 'Wi-Fi 4 + BLE 5, vector instructions for on-device ML.', 'https://espressif.com', '$6', true, 3),
  ('KiCad 8 EDA Suite', 'Software', 'Open-source schematic capture and 3D PCB layout toolchain.', 'https://kicad.org', 'Free', true, 4),
  ('Rigol DS1054Z Oscilloscope', 'Lab Equipment', '4-channel 50MHz digital storage oscilloscope.', 'https://rigol.com', '$370', true, 5),
  ('Bambu Lab X1-Carbon 3D Printer', 'Fabrication', 'High-speed FDM printer for carbon fiber and structural enclosures.', 'https://bambulab.com', '$1449', true, 6)
ON CONFLICT DO NOTHING;
