-- ═══════════════════════════════════════════════════════
--  FlixTN Production Schema v3.0
--  Run entirely in Supabase → SQL Editor → Run
--  This replaces ALL previous tables
-- ═══════════════════════════════════════════════════════

-- Drop existing
DROP TABLE IF EXISTS watch_history CASCADE;
DROP TABLE IF EXISTS favorites     CASCADE;
DROP TABLE IF EXISTS episodes      CASCADE;
DROP TABLE IF EXISTS seasons       CASCADE;
DROP TABLE IF EXISTS content       CASCADE;
DROP TABLE IF EXISTS profiles      CASCADE;

-- ── PROFILES ─────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  is_admin    BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTENT ──────────────────────────────────────────
CREATE TABLE content (
  id           BIGSERIAL PRIMARY KEY,
  type         TEXT NOT NULL CHECK (type IN ('movie','series')),
  title        TEXT NOT NULL,
  title_en     TEXT,
  year         INT,
  rating       NUMERIC(3,1),
  genre        TEXT[] DEFAULT '{}',
  category     TEXT DEFAULT 'international',
  poster_url   TEXT,
  backdrop_url TEXT,
  description  TEXT,
  cast_list    TEXT[] DEFAULT '{}',
  director     TEXT,
  duration     TEXT,
  video_url    TEXT,
  trailer_url  TEXT,
  is_trending  BOOLEAN DEFAULT false,
  is_featured  BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  match_pct    INT DEFAULT 90,
  views        BIGINT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── SEASONS ──────────────────────────────────────────
CREATE TABLE seasons (
  id          BIGSERIAL PRIMARY KEY,
  content_id  BIGINT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  season_num  INT NOT NULL DEFAULT 1,
  title       TEXT NOT NULL,
  description TEXT,
  poster_url  TEXT,
  year        INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── EPISODES ─────────────────────────────────────────
CREATE TABLE episodes (
  id          BIGSERIAL PRIMARY KEY,
  season_id   BIGINT NOT NULL REFERENCES seasons(id)  ON DELETE CASCADE,
  content_id  BIGINT NOT NULL REFERENCES content(id)  ON DELETE CASCADE,
  ep_num      INT NOT NULL DEFAULT 1,
  title       TEXT NOT NULL,
  description TEXT,
  duration    TEXT,
  thumb_url   TEXT,
  video_url   TEXT,
  is_free     BOOLEAN DEFAULT false,
  views       BIGINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── FAVORITES ────────────────────────────────────────
CREATE TABLE favorites (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id  BIGINT NOT NULL REFERENCES content(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- ── WATCH HISTORY ─────────────────────────────────────
CREATE TABLE watch_history (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id   BIGINT NOT NULL REFERENCES content(id)  ON DELETE CASCADE,
  episode_id   BIGINT REFERENCES episodes(id) ON DELETE SET NULL,
  progress_sec INT DEFAULT 0,
  duration_sec INT DEFAULT 0,
  completed    BOOLEAN DEFAULT false,
  watched_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────
CREATE INDEX ON content(type);
CREATE INDEX ON content(category);
CREATE INDEX ON content(is_trending) WHERE is_trending = true;
CREATE INDEX ON content(is_featured) WHERE is_featured = true;
CREATE INDEX ON seasons(content_id);
CREATE INDEX ON episodes(season_id);
CREATE INDEX ON episodes(content_id);
CREATE INDEX ON favorites(user_id);
CREATE INDEX ON watch_history(user_id);
CREATE INDEX ON watch_history(content_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE content       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "profiles_read"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Content: public read (published), admin write
CREATE POLICY "content_read"   ON content FOR SELECT USING (is_published = true OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND is_admin=true));
CREATE POLICY "content_insert" ON content FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND is_admin=true));
CREATE POLICY "content_update" ON content FOR UPDATE USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND is_admin=true));
CREATE POLICY "content_delete" ON content FOR DELETE USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND is_admin=true));

-- Seasons + Episodes: public read, admin write
CREATE POLICY "seasons_read"    ON seasons  FOR SELECT USING (true);
CREATE POLICY "seasons_write"   ON seasons  FOR ALL    USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND is_admin=true));
CREATE POLICY "episodes_read"   ON episodes FOR SELECT USING (true);
CREATE POLICY "episodes_write"  ON episodes FOR ALL    USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND is_admin=true));

-- Favorites & History: own only
CREATE POLICY "fav_own"     ON favorites     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "history_own" ON watch_history FOR ALL USING (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, username, full_name, avatar_url, is_admin)
  VALUES(
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email,
    false
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── INCREMENT VIEWS ───────────────────────────────────
CREATE OR REPLACE FUNCTION increment_views(content_id BIGINT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE content SET views = views + 1 WHERE id = content_id;
END;
$$;

-- ── SEED DATA ─────────────────────────────────────────
INSERT INTO content(type,title,title_en,year,rating,genre,category,poster_url,backdrop_url,description,cast_list,duration,video_url,is_trending,is_featured,match_pct) VALUES
('movie','الدار البيضاء','Casablanca Nights',2024,8.4,ARRAY['دراما','رومانسي'],'arabic',
 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&q=85',
 'قصة حب مؤلمة تدور في شوارع الدار البيضاء، بين طموح الشباب وواقع الحياة القاسي.',
 ARRAY['أحمد خليل','فاطمة الزهراء','عمر شريف'],'2س 15د','https://www.youtube.com/watch?v=dQw4w9WgXcQ',true,true,97),

('movie','Oppenheimer','Oppenheimer',2023,8.9,ARRAY['تاريخي','إثارة'],'international',
 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&q=80',
 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=85',
 'القصة الملحمية للعالم روبرت أوبنهايمر وإشرافه على مشروع مانهاتن لصنع القنبلة الذرية.',
 ARRAY['سيليان مورفي','إيميلي بلانت','مات ديمون'],'3س','https://www.youtube.com/watch?v=uYPbbksJxIg',true,true,98),

('movie','Bastarda','Bastarda',2023,7.9,ARRAY['دراما'],'tunisian',
 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&q=80',
 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1400&q=85',
 'مسيرة شاب تونسي بين الهوية والانتماء في تونس المعاصرة.',
 ARRAY['خالد برغل','سونيا شيخاوي'],'1س 52د','https://www.youtube.com/watch?v=dQw4w9WgXcQ',true,true,94),

('movie','Dune: Part Two','Dune Part Two',2024,8.7,ARRAY['خيال علمي','أكشن'],'international',
 'https://images.unsplash.com/photo-1509347528160-9329fd4a3dab?w=400&q=80',
 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1400&q=85',
 'بول أتريدس يتحد مع شعب الفريمن في رحلة انتقام ملحمية عبر رمال أراكيس.',
 ARRAY['تيموثي شالاميه','زنداياً','أوستن باتلر'],'2س 46د','https://www.youtube.com/watch?v=Way9Dexny3w',true,false,96),

('movie','Poor Things','أشياء سيئة',2023,8.0,ARRAY['كوميديا','خيال علمي'],'international',
 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1400&q=85',
 'مغامرة بيلا باكستر الساحرة عبر الأزمنة في عالم ستيمبانك رائع.',
 ARRAY['إيما ستون','مارك روفالو'],'2س 21د',NULL,false,false,88),

('series','Breaking Bad','Breaking Bad',2008,9.5,ARRAY['جريمة','إثارة'],'international',
 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=80',
 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1400&q=85',
 'أستاذ كيمياء يُشخَّص بالسرطان فيتحول إلى مصنّع مخدرات في أمريكا.',
 ARRAY['براين كرانستون','آرون بول'],NULL,NULL,true,true,99),

('series','House of the Dragon','House of the Dragon',2022,8.5,ARRAY['فانتازيا','درامي'],'international',
 'https://images.unsplash.com/photo-1555708982-8645ec9ce3cc?w=400&q=80',
 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=1400&q=85',
 'قصة عائلة تارغيريان والحرب الأهلية على عرش حديدة.',
 ARRAY['بادي كونسيدين','مات سميث','إيما داركي'],NULL,NULL,true,true,95),

('series','ولد الغلط','Weld El Ghalt',2022,8.1,ARRAY['كوميديا','درامي'],'tunisian',
 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1400&q=85',
 'مسلسل تونسي كوميدي درامي يصور حياة شاب في المجتمع التونسي المعاصر.',
 ARRAY['لطفي العبدلي','حياة الإدريسي'],NULL,NULL,true,false,92);

-- ═══════════════════════════════════════════════════════
--  MAKE YOURSELF ADMIN
--  After registering, run this (replace with your email):
-- ═══════════════════════════════════════════════════════
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR@EMAIL.COM');
