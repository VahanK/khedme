-- Drop and recreate the select policy with consistent reference
DROP POLICY IF EXISTS "authenticated_users_can_view_project_files" ON project_files;

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
