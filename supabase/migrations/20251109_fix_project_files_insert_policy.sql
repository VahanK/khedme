-- Drop the problematic insert policy
DROP POLICY IF EXISTS "authenticated_users_can_insert_project_files" ON project_files;

-- Recreate with fixed reference (use NEW.project_id instead of project_files.project_id)
CREATE POLICY "authenticated_users_can_insert_project_files"
ON project_files
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND (projects.client_id = auth.uid() OR projects.freelancer_id = auth.uid())
  )
);
