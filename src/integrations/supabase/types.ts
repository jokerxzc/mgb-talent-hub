export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_id: string
          id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_id: string
          id?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["application_status"]
          old_status: Database["public"]["Enums"]["application_status"] | null
          remarks: string | null
        }
        Insert: {
          application_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["application_status"]
          old_status?: Database["public"]["Enums"]["application_status"] | null
          remarks?: string | null
        }
        Update: {
          application_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["application_status"]
          old_status?: Database["public"]["Enums"]["application_status"] | null
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          id: string
          reference_number: string
          status: Database["public"]["Enums"]["application_status"] | null
          submitted_at: string
          updated_at: string
          user_id: string
          vacancy_id: string
        }
        Insert: {
          id?: string
          reference_number: string
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string
          updated_at?: string
          user_id: string
          vacancy_id: string
        }
        Update: {
          id?: string
          reference_number?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string
          updated_at?: string
          user_id?: string
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      educational_background: {
        Row: {
          created_at: string
          degree: string | null
          field_of_study: string | null
          honors: string | null
          id: string
          level: string
          school_name: string
          updated_at: string
          user_id: string
          year_graduated: number | null
        }
        Insert: {
          created_at?: string
          degree?: string | null
          field_of_study?: string | null
          honors?: string | null
          id?: string
          level: string
          school_name: string
          updated_at?: string
          user_id: string
          year_graduated?: number | null
        }
        Update: {
          created_at?: string
          degree?: string | null
          field_of_study?: string | null
          honors?: string | null
          id?: string
          level?: string
          school_name?: string
          updated_at?: string
          user_id?: string
          year_graduated?: number | null
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          application_id: string
          created_at: string
          evaluation_form_path: string | null
          id: string
          recommendation: string | null
          remarks: string | null
          reviewer_id: string
          score: number | null
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          evaluation_form_path?: string | null
          id?: string
          recommendation?: string | null
          remarks?: string | null
          reviewer_id: string
          score?: number | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          evaluation_form_path?: string | null
          id?: string
          recommendation?: string | null
          remarks?: string | null
          reviewer_id?: string
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          middle_name: string | null
          suffix: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          suffix?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          suffix?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviewer_assignments: {
        Row: {
          application_id: string
          assigned_at: string
          assigned_by: string | null
          id: string
          reviewer_id: string
        }
        Insert: {
          application_id: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          reviewer_id: string
        }
        Update: {
          application_id?: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          application_deadline: string
          created_at: string
          created_by: string | null
          daily_rate: number | null
          description: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          id: string
          office_division: string
          place_of_assignment: string | null
          position_title: string
          qualification_education: string | null
          qualification_eligibility: string | null
          qualification_experience: string | null
          qualification_training: string | null
          required_documents: string[] | null
          salary_grade: string | null
          slots: number | null
          status: Database["public"]["Enums"]["vacancy_status"] | null
          updated_at: string
        }
        Insert: {
          application_deadline: string
          created_at?: string
          created_by?: string | null
          daily_rate?: number | null
          description?: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          id?: string
          office_division: string
          place_of_assignment?: string | null
          position_title: string
          qualification_education?: string | null
          qualification_eligibility?: string | null
          qualification_experience?: string | null
          qualification_training?: string | null
          required_documents?: string[] | null
          salary_grade?: string | null
          slots?: number | null
          status?: Database["public"]["Enums"]["vacancy_status"] | null
          updated_at?: string
        }
        Update: {
          application_deadline?: string
          created_at?: string
          created_by?: string | null
          daily_rate?: number | null
          description?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          id?: string
          office_division?: string
          place_of_assignment?: string | null
          position_title?: string
          qualification_education?: string | null
          qualification_eligibility?: string | null
          qualification_experience?: string | null
          qualification_training?: string | null
          required_documents?: string[] | null
          salary_grade?: string | null
          slots?: number | null
          status?: Database["public"]["Enums"]["vacancy_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          company_name: string
          created_at: string
          duties: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          monthly_salary: number | null
          position_title: string
          salary_grade: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          duties?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          monthly_salary?: number | null
          position_title: string
          salary_grade?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          duties?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          monthly_salary?: number | null
          position_title?: string
          salary_grade?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_reference_number: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "applicant" | "hr_admin" | "reviewer"
      application_status:
        | "submitted"
        | "under_review"
        | "shortlisted"
        | "interview"
        | "selected"
        | "not_selected"
      employment_type: "permanent" | "cos" | "jo"
      vacancy_status: "draft" | "published" | "closed" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["applicant", "hr_admin", "reviewer"],
      application_status: [
        "submitted",
        "under_review",
        "shortlisted",
        "interview",
        "selected",
        "not_selected",
      ],
      employment_type: ["permanent", "cos", "jo"],
      vacancy_status: ["draft", "published", "closed", "archived"],
    },
  },
} as const
