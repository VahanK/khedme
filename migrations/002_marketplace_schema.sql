-- ============================================
-- FREELANCER PROFILES EXTENSION
-- ============================================
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  skills TEXT[], -- Array of skills
  hourly_rate DECIMAL(10, 2),
  portfolio_url TEXT,
  avatar_url TEXT,
  availability TEXT CHECK (availability IN ('available', 'busy', 'unavailable')),
  years_of_experience INTEGER,
  completed_projects INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00, -- Average rating 0.00 to 5.00
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for freelancer profiles
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view freelancer profiles (for browsing)
CREATE POLICY "Anyone can view freelancer profiles"
  ON public.freelancer_profiles
  FOR SELECT
  USING (true);

-- Only the freelancer can update their own profile
CREATE POLICY "Freelancers can update own profile"
  ON public.freelancer_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Only freelancers can insert their profile
CREATE POLICY "Freelancers can insert own profile"
  ON public.freelancer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER set_freelancer_updated_at
  BEFORE UPDATE ON public.freelancer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS freelancer_profiles_skills_idx ON public.freelancer_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS freelancer_profiles_hourly_rate_idx ON public.freelancer_profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS freelancer_profiles_availability_idx ON public.freelancer_profiles(availability);
CREATE INDEX IF NOT EXISTS freelancer_profiles_rating_idx ON public.freelancer_profiles(rating);

-- ============================================
-- CLIENT PROFILES EXTENSION
-- ============================================
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  company_description TEXT,
  company_website TEXT,
  avatar_url TEXT,
  total_projects_posted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for client profiles
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view client profiles
CREATE POLICY "Anyone can view client profiles"
  ON public.client_profiles
  FOR SELECT
  USING (true);

-- Only the client can update their own profile
CREATE POLICY "Clients can update own profile"
  ON public.client_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Only clients can insert their profile
CREATE POLICY "Clients can insert own profile"
  ON public.client_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER set_client_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  status TEXT CHECK (status IN ('open', 'in_progress', 'in_review', 'completed', 'cancelled')) DEFAULT 'open',
  deadline TIMESTAMP WITH TIME ZONE,
  required_skills TEXT[],
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view open projects
CREATE POLICY "Anyone can view open projects"
  ON public.projects
  FOR SELECT
  USING (status = 'open' OR auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Clients can create projects
CREATE POLICY "Clients can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Clients can update their own projects
CREATE POLICY "Clients can update own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = client_id);

-- Trigger for updated_at
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS projects_freelancer_id_idx ON public.projects(freelancer_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);
CREATE INDEX IF NOT EXISTS projects_skills_idx ON public.projects USING GIN(required_skills);

-- ============================================
-- PROPOSALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cover_letter TEXT NOT NULL,
  proposed_budget DECIMAL(10, 2) NOT NULL,
  estimated_duration TEXT, -- e.g., "2 weeks", "1 month"
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, freelancer_id) -- One proposal per freelancer per project
);

-- RLS for proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Freelancers can view their own proposals
-- Clients can view proposals for their projects
CREATE POLICY "View proposals policy"
  ON public.proposals
  FOR SELECT
  USING (
    auth.uid() = freelancer_id OR
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id)
  );

-- Freelancers can create proposals
CREATE POLICY "Freelancers can create proposals"
  ON public.proposals
  FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

-- Freelancers can update their own pending proposals
CREATE POLICY "Freelancers can update own proposals"
  ON public.proposals
  FOR UPDATE
  USING (auth.uid() = freelancer_id AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER set_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS proposals_project_id_idx ON public.proposals(project_id);
CREATE INDEX IF NOT EXISTS proposals_freelancer_id_idx ON public.proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx ON public.proposals(status);

-- ============================================
-- PROJECT FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size BIGINT, -- Size in bytes
  file_type TEXT, -- MIME type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for project files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Only client and assigned freelancer can view project files
CREATE POLICY "Project participants can view files"
  ON public.project_files
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT client_id FROM public.projects WHERE id = project_id
      UNION
      SELECT freelancer_id FROM public.projects WHERE id = project_id
    )
  );

-- Both client and freelancer can upload files
CREATE POLICY "Project participants can upload files"
  ON public.project_files
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT client_id FROM public.projects WHERE id = project_id
      UNION
      SELECT freelancer_id FROM public.projects WHERE id = project_id
    )
  );

-- Users can delete their own uploaded files
CREATE POLICY "Users can delete own files"
  ON public.project_files
  FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Indexes
CREATE INDEX IF NOT EXISTS project_files_project_id_idx ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS project_files_uploaded_by_idx ON public.project_files(uploaded_by);

-- ============================================
-- CONVERSATIONS TABLE (for messaging)
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  participant_1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
  UNIQUE(participant_1_id, participant_2_id, project_id)
);

-- RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can only view conversations they're part of
CREATE POLICY "Users can view own conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Users can create conversations (for initial contact)
CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Indexes
CREATE INDEX IF NOT EXISTS conversations_participant_1_idx ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS conversations_participant_2_idx ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS conversations_project_id_idx ON public.conversations(project_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Users can update read status of messages sent to them
CREATE POLICY "Users can mark messages as read"
  ON public.messages
  FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- Function to update last_message_at in conversations
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, reviewer_id) -- One review per user per project
);

-- RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Only project participants can create reviews after payment is settled
CREATE POLICY "Project participants can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id
      AND status = 'completed'
      AND payment_status = 'paid'
      AND (client_id = auth.uid() OR freelancer_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS reviews_reviewee_id_idx ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS reviews_project_id_idx ON public.reviews(project_id);

-- Function to update freelancer rating
CREATE OR REPLACE FUNCTION public.update_freelancer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.freelancer_profiles
  SET
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id),
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update freelancer rating on new review
CREATE TRIGGER update_rating_on_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_freelancer_rating();

-- ============================================
-- STORAGE BUCKET FOR PROJECT FILES
-- ============================================
-- Note: This needs to be executed in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Storage policies (to be set up in Supabase)
-- Project participants can upload files
-- Project participants can download files
-- Users can delete their own files
