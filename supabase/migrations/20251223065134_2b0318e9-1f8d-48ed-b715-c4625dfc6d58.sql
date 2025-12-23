-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('applicant', 'hr_admin', 'reviewer');

-- Create employment_type enum
CREATE TYPE public.employment_type AS ENUM ('permanent', 'cos', 'jo');

-- Create vacancy_status enum
CREATE TYPE public.vacancy_status AS ENUM ('draft', 'published', 'closed', 'archived');

-- Create application_status enum
CREATE TYPE public.application_status AS ENUM ('submitted', 'under_review', 'shortlisted', 'interview', 'selected', 'not_selected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  suffix TEXT,
  address TEXT,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'applicant',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create educational_background table
CREATE TABLE public.educational_background (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  school_name TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  year_graduated INTEGER,
  honors TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_experience table
CREATE TABLE public.work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  duties TEXT,
  monthly_salary DECIMAL(12,2),
  salary_grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vacancies table
CREATE TABLE public.vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_title TEXT NOT NULL,
  employment_type employment_type NOT NULL,
  salary_grade TEXT,
  daily_rate DECIMAL(12,2),
  office_division TEXT NOT NULL,
  place_of_assignment TEXT,
  qualification_education TEXT,
  qualification_experience TEXT,
  qualification_training TEXT,
  qualification_eligibility TEXT,
  description TEXT,
  required_documents TEXT[] DEFAULT ARRAY['application_letter', 'pds', 'resume', 'transcript'],
  application_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  slots INTEGER DEFAULT 1,
  status vacancy_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
  status application_status DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, vacancy_id)
);

-- Create application_documents table (junction table)
CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (application_id, document_id)
);

-- Create application_status_history table
CREATE TABLE public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status application_status,
  new_status application_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviewer_assignments table
CREATE TABLE public.reviewer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (application_id, reviewer_id)
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  remarks TEXT,
  recommendation TEXT,
  evaluation_form_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (application_id, reviewer_id)
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacancies_updated_at
  BEFORE UPDATE ON public.vacancies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_educational_background_updated_at
  BEFORE UPDATE ON public.educational_background
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at
  BEFORE UPDATE ON public.work_experience
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'applicant');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate application reference number
CREATE OR REPLACE FUNCTION public.generate_reference_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ref_num TEXT;
  year_part TEXT;
  seq_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  seq_part := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  ref_num := 'MGB-' || year_part || '-' || seq_part;
  RETURN ref_num;
END;
$$;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_background ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "HR admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can view assigned applicant profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments ra
      JOIN public.applications a ON ra.application_id = a.id
      WHERE ra.reviewer_id = auth.uid() AND a.user_id = profiles.user_id
    )
  );

-- RLS Policies for user_roles (read-only for users, only admins can modify)
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "HR admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "HR admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin'));

-- RLS Policies for educational_background
CREATE POLICY "Users can manage own education"
  ON public.educational_background FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "HR admins can view all education"
  ON public.educational_background FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can view assigned applicant education"
  ON public.educational_background FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments ra
      JOIN public.applications a ON ra.application_id = a.id
      WHERE ra.reviewer_id = auth.uid() AND a.user_id = educational_background.user_id
    )
  );

-- RLS Policies for work_experience
CREATE POLICY "Users can manage own work experience"
  ON public.work_experience FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "HR admins can view all work experience"
  ON public.work_experience FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can view assigned applicant work experience"
  ON public.work_experience FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments ra
      JOIN public.applications a ON ra.application_id = a.id
      WHERE ra.reviewer_id = auth.uid() AND a.user_id = work_experience.user_id
    )
  );

-- RLS Policies for vacancies
CREATE POLICY "Anyone can view published vacancies"
  ON public.vacancies FOR SELECT
  USING (status = 'published');

CREATE POLICY "HR admins can manage all vacancies"
  ON public.vacancies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin'));

-- RLS Policies for documents
CREATE POLICY "Users can manage own documents"
  ON public.documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "HR admins can view all documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can view assigned applicant documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments ra
      JOIN public.applications a ON ra.application_id = a.id
      WHERE ra.reviewer_id = auth.uid() AND a.user_id = documents.user_id
    )
  );

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "HR admins can manage all applications"
  ON public.applications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can view assigned applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments
      WHERE reviewer_id = auth.uid() AND application_id = applications.id
    )
  );

CREATE POLICY "Reviewers can update assigned applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments
      WHERE reviewer_id = auth.uid() AND application_id = applications.id
    )
  );

-- RLS Policies for application_documents
CREATE POLICY "Users can manage own application documents"
  ON public.application_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_documents.application_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_documents.application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "HR admins can view all application documents"
  ON public.application_documents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can view assigned application documents"
  ON public.application_documents FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments
      WHERE reviewer_id = auth.uid() AND application_id = application_documents.application_id
    )
  );

-- RLS Policies for application_status_history
CREATE POLICY "Users can view own application history"
  ON public.application_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE id = application_status_history.application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "HR admins can manage all status history"
  ON public.application_status_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can add status history for assigned applications"
  ON public.application_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments
      WHERE reviewer_id = auth.uid() AND application_id = application_status_history.application_id
    )
  );

CREATE POLICY "Reviewers can view assigned application history"
  ON public.application_status_history FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments
      WHERE reviewer_id = auth.uid() AND application_id = application_status_history.application_id
    )
  );

-- RLS Policies for reviewer_assignments
CREATE POLICY "HR admins can manage reviewer assignments"
  ON public.reviewer_assignments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin'));

CREATE POLICY "Reviewers can view own assignments"
  ON public.reviewer_assignments FOR SELECT
  TO authenticated
  USING (reviewer_id = auth.uid());

-- RLS Policies for evaluations
CREATE POLICY "Reviewers can manage own evaluations"
  ON public.evaluations FOR ALL
  TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "HR admins can view all evaluations"
  ON public.evaluations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin'));

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'applicant-documents',
  'applicant-documents',
  false,
  5242880,
  ARRAY['application/pdf']
);

-- Storage policies for applicant-documents bucket
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'applicant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'applicant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'applicant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "HR admins can view all applicant documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'applicant-documents' AND
    public.has_role(auth.uid(), 'hr_admin')
  );

CREATE POLICY "Reviewers can view assigned applicant documents storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'applicant-documents' AND
    public.has_role(auth.uid(), 'reviewer') AND
    EXISTS (
      SELECT 1 FROM public.reviewer_assignments ra
      JOIN public.applications a ON ra.application_id = a.id
      WHERE ra.reviewer_id = auth.uid() AND a.user_id::text = (storage.foldername(name))[1]
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_vacancies_status ON public.vacancies(status);
CREATE INDEX idx_vacancies_deadline ON public.vacancies(application_deadline);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_vacancy_id ON public.applications(vacancy_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_reviewer_assignments_reviewer ON public.reviewer_assignments(reviewer_id);
CREATE INDEX idx_evaluations_application ON public.evaluations(application_id);