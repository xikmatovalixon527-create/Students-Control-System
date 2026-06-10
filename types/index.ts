export interface Group {
  id: string;
  name: string;
}

export interface Parent {
  id: string;
  full_name: string;
  phone_number: string;
}

export interface Student {
  id: string;
  full_name: string;
  group_id: string;
  parent_id: string;
  groups?: Group;
  parents?: Parent;
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
