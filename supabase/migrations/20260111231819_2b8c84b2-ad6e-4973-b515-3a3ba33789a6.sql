-- Add explicit policies to deny anonymous access to all sensitive tables
-- This adds defense-in-depth even though RESTRICTIVE policies with auth.uid() checks already block anonymous access

-- Profiles table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- User roles table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

-- Educational background table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to educational_background"
ON public.educational_background
FOR ALL
TO anon
USING (false);

-- Work experience table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to work_experience"
ON public.work_experience
FOR ALL
TO anon
USING (false);

-- Documents table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to documents"
ON public.documents
FOR ALL
TO anon
USING (false);

-- Applications table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to applications"
ON public.applications
FOR ALL
TO anon
USING (false);

-- Application documents table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to application_documents"
ON public.application_documents
FOR ALL
TO anon
USING (false);

-- Application status history table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to application_status_history"
ON public.application_status_history
FOR ALL
TO anon
USING (false);

-- Reviewer assignments table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to reviewer_assignments"
ON public.reviewer_assignments
FOR ALL
TO anon
USING (false);

-- Evaluations table - block anonymous access explicitly
CREATE POLICY "Block anonymous access to evaluations"
ON public.evaluations
FOR ALL
TO anon
USING (false);