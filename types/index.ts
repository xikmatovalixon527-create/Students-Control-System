export interface Group {
  id: string;
  name: string;
}

export interface Parent {
  id: string;
  full_name: string;
  phone_number: string;
  role?: string;
}

export interface Student {
  id: string;
  full_name: string;
  group_id: string;
  parent_id: string;
  first_arrival_date?: string;
  first_payment_date?: string;
  groups?: Group;
  parents?: Parent;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string; // YYYY-MM-DD
  period_month: string; // YYYY-MM
  status: 'paid' | 'unpaid' | 'overdue';
}

export interface Template {
  id: string;
  category: string;
  language: string;
  template_text: string;
}

export interface AppLog {
  id: string;
  created_at: string;
  student_name: string;
  parent_name: string;
  phone_number: string;
  message_text: string;
  category: string;
  status: string;
}
