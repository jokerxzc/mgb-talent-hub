-- Add missing RLS policies to prevent unintended operations

-- Block authenticated users from directly inserting profiles (handled by trigger)
CREATE POLICY "Block direct profile inserts"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block authenticated users from deleting profiles
CREATE POLICY "Block profile deletes"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);

-- Block applicants from updating their applications (only HR/reviewers can update)
CREATE POLICY "Block applicant updates to applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (
  -- Only allow if user is HR admin or reviewer (already have policies for this)
  has_role(auth.uid(), 'hr_admin') OR 
  (has_role(auth.uid(), 'reviewer') AND EXISTS (
    SELECT 1 FROM reviewer_assignments 
    WHERE reviewer_id = auth.uid() AND application_id = applications.id
  ))
);

-- Block applicants from deleting their applications  
CREATE POLICY "Block application deletes by applicants"
ON public.applications
FOR DELETE
TO authenticated
USING (
  -- Only HR admins can delete applications
  has_role(auth.uid(), 'hr_admin')
);