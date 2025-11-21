-- Clean up all existing RLS policies on project_files table
DROP POLICY IF EXISTS "Project participants can upload files" ON project_files;
DROP POLICY IF EXISTS "Project participants can view files" ON project_files;
DROP POLICY IF EXISTS "Users can delete own files" ON project_files;
DROP POLICY IF EXISTS "Users can upload files for their projects" ON project_files;
DROP POLICY IF EXISTS "Users can view files for their projects" ON project_files;
DROP POLICY IF EXISTS "Project participants can update files" ON project_files;

-- Enable RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that work for both client and freelancer

-- INSERT: Allow authenticated users to upload files for projects they're part of
CREATE POLICY "authenticated_users_can_insert_project_files"
ON project_files
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be either the client or freelancer on the project
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_files.project_id
    AND (projects.client_id = auth.uid() OR projects.freelancer_id = auth.uid())
  )
);

-- SELECT: Allow authenticated users to view files for projects they're part of
CREATE POLICY "authenticated_users_can_view_project_files"
ON project_files
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_files.project_id
    AND (projects.client_id = auth.uid() OR projects.freelancer_id = auth.uid())
  )
);

-- UPDATE: Allow users to update files they uploaded
CREATE POLICY "users_can_update_own_files"
ON project_files
FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- DELETE: Allow users to delete files they uploaded
CREATE POLICY "users_can_delete_own_files"
ON project_files
FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());
