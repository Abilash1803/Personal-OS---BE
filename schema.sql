-- ==============================================================================
-- Personal OS — Complete PostgreSQL Schema & Row-Level Security (RLS) Policies
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Life Areas
CREATE TABLE IF NOT EXISTS public.life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📌',
  color TEXT DEFAULT '#2563EB',
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  life_area_id UUID REFERENCES public.life_areas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Task Templates
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  estimated_minutes INTEGER DEFAULT 30,
  priority TEXT DEFAULT 'Medium',
  recurrence TEXT DEFAULT 'Daily',
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Daily Tasks
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'Pending',
  completed_at TIMESTAMPTZ,
  actual_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Planner Events
CREATE TABLE IF NOT EXISTS public.planner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Task',
  date DATE NOT NULL,
  time TEXT DEFAULT '',
  description TEXT DEFAULT '',
  linked_task_id UUID REFERENCES public.daily_tasks(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Focus Sessions
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_task_id UUID REFERENCES public.daily_tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  actual_duration INTEGER DEFAULT 0,
  paused_duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Running',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Daily Reflections
CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 8. Timeline Events
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  entity_type TEXT DEFAULT 'General',
  entity_id UUID,
  life_area_id UUID REFERENCES public.life_areas(id) ON DELETE SET NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- Performance Indexes on Foreign Keys & Query Filter Columns
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_life_areas_user_id ON public.life_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_life_area_id ON public.goals(life_area_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_user_id ON public.task_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_goal_id ON public.task_templates(goal_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON public.daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON public.daily_tasks(date);
CREATE INDEX IF NOT EXISTS idx_planner_events_user_id ON public.planner_events(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_events_date ON public.planner_events(date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_daily_task_id ON public.focus_sessions(daily_task_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON public.daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_timestamp ON public.timeline_events(timestamp DESC);

-- ==============================================================================
-- Row Level Security (RLS) Enablement
-- ==============================================================================
ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS Policies (Allows direct access via project API keys)
-- ==============================================================================
DROP POLICY IF EXISTS "Users can manage their own life_areas" ON public.life_areas;
DROP POLICY IF EXISTS "Allow full access to life_areas" ON public.life_areas;
CREATE POLICY "Allow full access to life_areas"
  ON public.life_areas FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;
DROP POLICY IF EXISTS "Allow full access to goals" ON public.goals;
CREATE POLICY "Allow full access to goals"
  ON public.goals FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own task_templates" ON public.task_templates;
DROP POLICY IF EXISTS "Allow full access to task_templates" ON public.task_templates;
CREATE POLICY "Allow full access to task_templates"
  ON public.task_templates FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own daily_tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "Allow full access to daily_tasks" ON public.daily_tasks;
CREATE POLICY "Allow full access to daily_tasks"
  ON public.daily_tasks FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own planner_events" ON public.planner_events;
DROP POLICY IF EXISTS "Allow full access to planner_events" ON public.planner_events;
CREATE POLICY "Allow full access to planner_events"
  ON public.planner_events FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own focus_sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Allow full access to focus_sessions" ON public.focus_sessions;
CREATE POLICY "Allow full access to focus_sessions"
  ON public.focus_sessions FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own daily_reflections" ON public.daily_reflections;
DROP POLICY IF EXISTS "Allow full access to daily_reflections" ON public.daily_reflections;
CREATE POLICY "Allow full access to daily_reflections"
  ON public.daily_reflections FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own timeline_events" ON public.timeline_events;
DROP POLICY IF EXISTS "Allow full access to timeline_events" ON public.timeline_events;
CREATE POLICY "Allow full access to timeline_events"
  ON public.timeline_events FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
