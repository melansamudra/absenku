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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor: string
          business_id: string
          created_at: string
          detail: string | null
          id: string
        }
        Insert: {
          action: string
          actor: string
          business_id: string
          created_at?: string
          detail?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string
          business_id?: string
          created_at?: string
          detail?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          business_id: string
          check_in_at: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_photo_url: string | null
          check_out_at: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_photo_url: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          late: boolean
          late_minutes: number
          leave_request_id: string | null
          note: string | null
          overtime_hours: number
          shift_template_id: string | null
          status: string
          verified_at: string | null
          verified_by_admin: boolean
        }
        Insert: {
          business_id: string
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_photo_url?: string | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_photo_url?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          late?: boolean
          late_minutes?: number
          leave_request_id?: string | null
          note?: string | null
          overtime_hours?: number
          shift_template_id?: string | null
          status: string
          verified_at?: string | null
          verified_by_admin?: boolean
        }
        Update: {
          business_id?: string
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_photo_url?: string | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_photo_url?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          late?: boolean
          late_minutes?: number
          leave_request_id?: string | null
          note?: string | null
          overtime_hours?: number
          shift_template_id?: string | null
          status?: string
          verified_at?: string | null
          verified_by_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "attendance_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_leave_request_id_fkey"
            columns: ["leave_request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_shift_template_id_fkey"
            columns: ["shift_template_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      business_staff: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          email: string
          id: string
          name: string
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          user_id: string
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          attendance_qr_slug: string
          created_at: string
          id: string
          izin_deduction_mode: string
          izin_deduction_weekday: number
          izin_deduction_weekend: number
          late_deduction_per_occurrence: number
          leave_request_slug: string
          lembur_rate_per_hour: number
          name: string
          owner_id: string
          phone: string | null
          pph21_enabled: boolean
          work_end_time: string
          work_start_time: string
        }
        Insert: {
          address?: string | null
          attendance_qr_slug?: string
          created_at?: string
          id?: string
          izin_deduction_mode?: string
          izin_deduction_weekday?: number
          izin_deduction_weekend?: number
          late_deduction_per_occurrence?: number
          leave_request_slug?: string
          lembur_rate_per_hour?: number
          name: string
          owner_id: string
          phone?: string | null
          pph21_enabled?: boolean
          work_end_time?: string
          work_start_time?: string
        }
        Update: {
          address?: string | null
          attendance_qr_slug?: string
          created_at?: string
          id?: string
          izin_deduction_mode?: string
          izin_deduction_weekday?: number
          izin_deduction_weekend?: number
          late_deduction_per_occurrence?: number
          leave_request_slug?: string
          lembur_rate_per_hour?: number
          name?: string
          owner_id?: string
          phone?: string | null
          pph21_enabled?: boolean
          work_end_time?: string
          work_start_time?: string
        }
        Relationships: []
      }
      employee_advances: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          date: string
          employee_id: string
          id: string
          note: string | null
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          date: string
          employee_id: string
          id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_advances_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_personal_loans: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          date: string
          employee_id: string
          id: string
          note: string | null
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          date: string
          employee_id: string
          id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_personal_loans_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_personal_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_recurring_allowances: {
        Row: {
          active: boolean
          amount: number
          business_id: string
          created_at: string
          employee_id: string
          id: string
          label: string
        }
        Insert: {
          active?: boolean
          amount: number
          business_id: string
          created_at?: string
          employee_id: string
          id?: string
          label: string
        }
        Update: {
          active?: boolean
          amount?: number
          business_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_recurring_allowances_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_recurring_allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shift_assignments: {
        Row: {
          business_id: string
          created_at: string
          date: string
          employee_id: string
          id: string
          shift_template_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          date: string
          employee_id: string
          id?: string
          shift_template_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          shift_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_shift_assignments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shift_assignments_shift_template_id_fkey"
            columns: ["shift_template_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean
          business_id: string
          contract_end: string | null
          created_at: string
          daily_attendance_allowance: number
          daily_meal_allowance: number
          daily_rate: number
          deleted_at: string | null
          email: string | null
          id: string
          lembur_rate_per_hour: number | null
          monthly_rate: number
          name: string
          note: string | null
          ptkp_status: string
          salary_type: string
        }
        Insert: {
          active?: boolean
          business_id: string
          contract_end?: string | null
          created_at?: string
          daily_attendance_allowance?: number
          daily_meal_allowance?: number
          daily_rate?: number
          deleted_at?: string | null
          email?: string | null
          id?: string
          lembur_rate_per_hour?: number | null
          monthly_rate?: number
          name: string
          note?: string | null
          ptkp_status?: string
          salary_type?: string
        }
        Update: {
          active?: boolean
          business_id?: string
          contract_end?: string | null
          created_at?: string
          daily_attendance_allowance?: number
          daily_meal_allowance?: number
          daily_rate?: number
          deleted_at?: string | null
          email?: string | null
          id?: string
          lembur_rate_per_hour?: number | null
          monthly_rate?: number
          name?: string
          note?: string | null
          ptkp_status?: string
          salary_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      late_deduction_tiers: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          id: string
          threshold_minutes: number
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          id?: string
          threshold_minutes: number
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          id?: string
          threshold_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "late_deduction_tiers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          business_id: string
          created_at: string
          days_count: number
          employee_id: string
          end_date: string
          id: string
          leave_type_id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_note: string | null
          start_date: string
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          days_count: number
          employee_id: string
          end_date: string
          id?: string
          leave_type_id: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_note?: string | null
          start_date: string
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type_id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_note?: string | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          default_days_per_year: number
          id: string
          name: string
          paid: boolean
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          default_days_per_year?: number
          id?: string
          name: string
          paid?: boolean
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          default_days_per_year?: number
          id?: string
          name?: string
          paid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_holidays: {
        Row: {
          business_id: string
          created_at: string
          holiday_date: string
          id: string
          label: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          holiday_date: string
          id?: string
          label?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          holiday_date?: string
          id?: string
          label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_holidays_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payslip_adjustments: {
        Row: {
          amount: number
          created_at: string
          id: string
          label: string
          payslip_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          label: string
          payslip_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          label?: string
          payslip_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslip_adjustments_payslip_id_fkey"
            columns: ["payslip_id"]
            isOneToOne: false
            referencedRelation: "payslips"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          alpa_count: number
          attendance_allowance: number
          base_pay: number
          business_id: string
          created_at: string
          daily_rate: number
          employee_id: string
          hadir_count: number
          hari_kerja_efektif: number
          id: string
          izin_deduction: number
          izin_noted_count: number
          izin_unnoted_count: number
          kasbon_deduction: number
          late_count: number
          late_deduction: number
          lembur_amount: number
          lembur_hours: number
          lembur_rate: number
          meal_allowance: number
          monthly_rate: number
          off_count: number
          paid_at: string | null
          period_end: string
          period_start: string
          personal_loan_deduction: number
          pph21_amount: number
          ptkp_status: string | null
          sakit_count: number
          salary_type: string
          ter_category: string | null
          thr_amount: number
        }
        Insert: {
          alpa_count?: number
          attendance_allowance?: number
          base_pay?: number
          business_id: string
          created_at?: string
          daily_rate?: number
          employee_id: string
          hadir_count?: number
          hari_kerja_efektif?: number
          id?: string
          izin_deduction?: number
          izin_noted_count?: number
          izin_unnoted_count?: number
          kasbon_deduction?: number
          late_count?: number
          late_deduction?: number
          lembur_amount?: number
          lembur_hours?: number
          lembur_rate?: number
          meal_allowance?: number
          monthly_rate?: number
          off_count?: number
          paid_at?: string | null
          period_end: string
          period_start: string
          personal_loan_deduction?: number
          pph21_amount?: number
          ptkp_status?: string | null
          sakit_count?: number
          salary_type: string
          ter_category?: string | null
          thr_amount?: number
        }
        Update: {
          alpa_count?: number
          attendance_allowance?: number
          base_pay?: number
          business_id?: string
          created_at?: string
          daily_rate?: number
          employee_id?: string
          hadir_count?: number
          hari_kerja_efektif?: number
          id?: string
          izin_deduction?: number
          izin_noted_count?: number
          izin_unnoted_count?: number
          kasbon_deduction?: number
          late_count?: number
          late_deduction?: number
          lembur_amount?: number
          lembur_hours?: number
          lembur_rate?: number
          meal_allowance?: number
          monthly_rate?: number
          off_count?: number
          paid_at?: string | null
          period_end?: string
          period_start?: string
          personal_loan_deduction?: number
          pph21_amount?: number
          ptkp_status?: string | null
          sakit_count?: number
          salary_type?: string
          ter_category?: string | null
          thr_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payslips_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      public_submission_log: {
        Row: {
          business_id: string
          created_at: string
          employee_id: string
          id: string
          kind: string
        }
        Insert: {
          business_id: string
          created_at?: string
          employee_id: string
          id?: string
          kind: string
        }
        Update: {
          business_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_submission_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_submission_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_templates: {
        Row: {
          business_id: string
          created_at: string
          end_time: string
          id: string
          name: string
          start_time: string
        }
        Insert: {
          business_id: string
          created_at?: string
          end_time: string
          id?: string
          name: string
          start_time: string
        }
        Update: {
          business_id?: string
          created_at?: string
          end_time?: string
          id?: string
          name?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_attendance_checkin_info: {
        Args: { p_slug: string }
        Returns: {
          business_id: string
          business_name: string
          employee_id: string
          employee_name: string
          employee_note: string
          work_end_time: string
          work_start_time: string
        }[]
      }
      get_leave_request_info: {
        Args: { p_slug: string }
        Returns: {
          business_id: string
          business_name: string
          employee_id: string
          employee_name: string
          leave_type_id: string
          leave_type_name: string
        }[]
      }
      submit_leave_request_public: {
        Args: {
          p_employee_id: string
          p_end_date: string
          p_leave_type_id: string
          p_reason: string
          p_slug: string
          p_start_date: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
