// Application constants

export const DOCUMENT_TYPES = {
  application_letter: "Application Letter",
  pds: "Personal Data Sheet (PDS)",
  resume: "Resume / CV",
  transcript: "Transcript of Records",
  certificate: "Certificate",
  other: "Other Document",
} as const;

export const EMPLOYMENT_TYPES = {
  permanent: "Permanent",
  cos: "Contract of Service (COS)",
  jo: "Job Order (JO)",
} as const;

export const APPLICATION_STATUS = {
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  selected: "Selected",
  not_selected: "Not Selected",
} as const;

export const VACANCY_STATUS = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
  archived: "Archived",
} as const;

export const EDUCATION_LEVELS = [
  "Elementary",
  "Secondary / High School",
  "Vocational / Trade Course",
  "College",
  "Graduate Studies",
  "Post-Graduate",
] as const;

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  VACANCIES: "/vacancies",
  VACANCY_DETAIL: "/vacancies/:id",
  APPLICANT_DASHBOARD: "/dashboard",
  APPLICANT_PROFILE: "/profile",
  APPLICANT_APPLICATIONS: "/my-applications",
  APPLICANT_DOCUMENTS: "/my-documents",
  HR_DASHBOARD: "/hr",
  HR_VACANCIES: "/hr/vacancies",
  HR_APPLICATIONS: "/hr/applications",
  HR_REPORTS: "/hr/reports",
  HR_USERS: "/hr/users",
  REVIEWER_DASHBOARD: "/reviewer",
  REVIEWER_APPLICATIONS: "/reviewer/applications",
} as const;
