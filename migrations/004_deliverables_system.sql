-- Migration: Deliverables System
-- Adds deliverables submission, review, and revision tracking

-- Create deliverables table
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_id UUID REFERENCES project_files(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'needs_revision', 'approved', 'rejected')),
  revision_number INTEGER DEFAULT 1,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deliverable_revisions table
CREATE TABLE IF NOT EXISTS deliverable_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  revision_notes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverable_revisions_deliverable_id ON deliverable_revisions(deliverable_id);

-- Row Level Security
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_revisions ENABLE ROW LEVEL SECURITY;

-- RLS for deliverables - project participants can view
CREATE POLICY "Project participants can view deliverables"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deliverables.project_id
      AND (projects.client_id = auth.uid() OR projects.freelancer_id = auth.uid())
    )
  );

-- Freelancers can create deliverables for their projects
CREATE POLICY "Freelancers can create deliverables"
  ON deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deliverables.project_id
      AND projects.freelancer_id = auth.uid()
    )
    AND submitted_by = auth.uid()
  );

-- Freelancers can update their pending deliverables
CREATE POLICY "Freelancers can update their deliverables"
  ON deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deliverables.project_id
      AND projects.freelancer_id = auth.uid()
    )
    AND submitted_by = auth.uid()
  );

-- Clients can update deliverable status (review, approve, request revision)
CREATE POLICY "Clients can review deliverables"
  ON deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deliverables.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- RLS for deliverable_revisions - project participants can view
CREATE POLICY "Project participants can view revisions"
  ON deliverable_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables
      JOIN projects ON projects.id = deliverables.project_id
      WHERE deliverables.id = deliverable_revisions.deliverable_id
      AND (projects.client_id = auth.uid() OR projects.freelancer_id = auth.uid())
    )
  );

-- Clients can request revisions
CREATE POLICY "Clients can request revisions"
  ON deliverable_revisions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deliverables
      JOIN projects ON projects.id = deliverables.project_id
      WHERE deliverables.id = deliverable_revisions.deliverable_id
      AND projects.client_id = auth.uid()
    )
    AND requested_by = auth.uid()
  );

-- Freelancers can update revision status
CREATE POLICY "Freelancers can update revision status"
  ON deliverable_revisions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM deliverables
      JOIN projects ON projects.id = deliverables.project_id
      WHERE deliverables.id = deliverable_revisions.deliverable_id
      AND projects.freelancer_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deliverable_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating deliverable timestamp
CREATE TRIGGER trigger_update_deliverable_timestamp
  BEFORE UPDATE ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_deliverable_timestamp();

-- Function to automatically change project status when deliverable is submitted
CREATE OR REPLACE FUNCTION update_project_status_on_deliverable()
RETURNS TRIGGER AS $$
BEGIN
  -- When a deliverable is submitted, set project to 'in_review'
  IF NEW.status = 'submitted' THEN
    UPDATE projects
    SET status = 'in_review'
    WHERE id = NEW.project_id
    AND status = 'in_progress';

  -- When a deliverable is approved, keep project in 'in_review' (client needs to request escrow release)
  ELSIF NEW.status = 'approved' THEN
    UPDATE projects
    SET status = 'in_review'
    WHERE id = NEW.project_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update project status when deliverable changes
CREATE TRIGGER trigger_update_project_status_on_deliverable
  AFTER INSERT OR UPDATE OF status ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_project_status_on_deliverable();

COMMENT ON TABLE deliverables IS 'Formal work submissions from freelancers to clients';
COMMENT ON TABLE deliverable_revisions IS 'Revision requests from clients with freelancer responses';
COMMENT ON COLUMN deliverables.status IS 'Deliverable review status: submitted → under_review → (needs_revision | approved | rejected)';
COMMENT ON COLUMN deliverables.revision_number IS 'Increments with each revision submission';
