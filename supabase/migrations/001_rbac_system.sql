-- Kitchen of Tech - Database Migration
-- Role-Based Access Control System with Project Management

-- =============================================
-- 1. ROLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  level INTEGER NOT NULL, -- 1=CEO, 2=Manager, 3=Senior, 4=Junior, 5=Intern
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description, level) VALUES
  ('CEO', 'Chief Executive Officer - Full access to everything', 1),
  ('Manager', 'Can create users and manage permissions', 2),
  ('Senior Officer', 'Senior team member', 3),
  ('Junior Officer', 'Junior team member', 4),
  ('Intern', 'Intern team member', 5)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. USERS TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role_id UUID REFERENCES public.roles(id) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. TEAMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_type TEXT, -- 'Design', 'Development', 'Editing', etc.
  captain_id UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. TEAM MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- =============================================
-- 5. PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_id UUID REFERENCES public.teams(id),
  status TEXT DEFAULT 'active', -- 'active', 'on-hold', 'completed', 'archived'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  start_date DATE,
  due_date DATE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- 'todo', 'in-progress', 'review', 'completed'
  priority TEXT DEFAULT 'medium',
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. TASK ASSIGNMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- =============================================
-- 8. TASK COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. TASK ATTACHMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. TIME TRACKING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. PERMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL, -- 'view_team_tasks', 'view_user_tasks', 'view_all_tasks'
  target_id UUID, -- team_id or user_id depending on permission_type
  granted_by UUID REFERENCES public.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_type, target_id)
);

-- =============================================
-- 12. ACTIVITY LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'user', 'task', 'project', 'team'
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON public.task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON public.permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- USERS: Everyone can read active users, only CEO/Manager can modify
CREATE POLICY "Users can view active users" ON public.users
  FOR SELECT USING (is_active = true);

CREATE POLICY "CEO and Manager can manage users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      INNER JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- TEAMS: Everyone can view their teams
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = id AND tm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      INNER JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- CEO and Manager can create/update teams
CREATE POLICY "CEO and Manager can manage teams" ON public.teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      INNER JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- TASKS: Users can only see tasks they're assigned to (unless they have permission)
CREATE POLICY "Users can view their assigned tasks" ON public.tasks
  FOR SELECT USING (
    -- Assigned to me
    EXISTS (
      SELECT 1 FROM public.task_assignments ta
      WHERE ta.task_id = id AND ta.user_id = auth.uid()
    )
    OR
    -- I created it
    created_by = auth.uid()
    OR
    -- I'm CEO or Manager
    EXISTS (
      SELECT 1 FROM public.users u
      INNER JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
    OR
    -- I have permission to view this task's team
    EXISTS (
      SELECT 1 FROM public.permissions p
      INNER JOIN public.projects proj ON proj.id = project_id
      WHERE p.user_id = auth.uid() 
      AND p.permission_type = 'view_team_tasks'
      AND p.target_id = proj.team_id
    )
  );

-- Users can create/update tasks
CREATE POLICY "Users can manage tasks" ON public.tasks
  FOR ALL USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.task_assignments ta
      WHERE ta.task_id = id AND ta.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u
      INNER JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- PERMISSIONS: CEO and Manager can manage permissions
CREATE POLICY "CEO and Manager can manage permissions" ON public.permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      INNER JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

CREATE POLICY "Users can view their own permissions" ON public.permissions
  FOR SELECT USING (user_id = auth.uid());

-- ACTIVITY LOGS: Everyone can read, system writes
CREATE POLICY "Users can view activity logs" ON public.activity_logs
  FOR SELECT USING (true);

CREATE POLICY "System can write activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activity logging triggers (optional - can be enabled later)
-- CREATE TRIGGER log_users_activity AFTER INSERT OR UPDATE OR DELETE ON public.users
--   FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =============================================
-- CREATE CEO USER
-- =============================================
-- Note: This will be done via Supabase Auth API in the application
-- Username: sakib3046
-- Password: 12344321
-- This is just a placeholder for the structure

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================
-- COMPLETE
-- =============================================
-- Run this migration in your Supabase SQL Editor
-- Then use the setup script to create the CEO user
