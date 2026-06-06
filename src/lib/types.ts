export interface Teacher {
  id: number;
  name: string;
  phone: string;
  position: 'ผู้บริหาร' | 'ครู' | 'บุคลากรทางการศึกษา';
  academic_level: 'ไม่มีวิทยฐานะ' | 'ชำนาญการ' | 'ชำนาญการพิเศษ';
  department: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherSearchResult {
  id: number;
  name: string;
  department: string;
  position: string;
  academic_level: string;
  is_registered: boolean;
  cert_count: number;
}

export interface Certificate {
  id: number;
  teacher_id: number;
  course_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  submitted_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_teachers: number;
  total_certificates: number;
  completed_all: number;
  completion_rate: number;
  by_course: { course_id: number; count: number }[];
  by_department: {
    department: string;
    teacher_count: number;
    cert_count: number;
    completion_rate: number;
  }[];
  recent: {
    teacher_name: string;
    department: string;
    course_id: number;
    submitted_at: string;
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
