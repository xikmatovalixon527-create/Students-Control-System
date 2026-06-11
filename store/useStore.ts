import { create } from 'zustand';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Group, Parent, Student, Template, Attendance, Payment } from '@/types';

interface AppState {
  // Config
  supabaseUrl: string;
  supabaseKey: string;
  macrodroidUrl: string;
  isConfigured: boolean;
  isConfigModalOpen: boolean;
  supabaseClient: SupabaseClient | null;
  
  // Data
  groups: Group[];
  parents: Parent[];
  students: Student[];
  templates: Template[];
  attendance: Attendance[];
  payments: Payment[];
  isLoading: boolean;
  
  // App State Focus
  activeTab: 'workspace' | 'admin';
  selectedGroupId: string | null;
  
  // Modals
  isComplaintModalOpen: boolean;
  complaintStudentId: string | null;

  // Alerts
  alertDialog: { isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' };
  openAlert: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  closeAlert: () => void;
  
  // Actions
  setConfig: (url: string, key: string, macroUrl: string) => void;
  loadConfigFromStorage: () => void;
  openConfigModal: () => void;
  closeConfigModal: () => void;
  
  setActiveTab: (tab: 'workspace' | 'admin') => void;
  setSelectedGroupId: (id: string | null) => void;
  
  openComplaintModal: (studentId: string) => void;
  closeComplaintModal: () => void;
  
  fetchData: () => Promise<void>;
  
  // Admin Operations
  addGroup: (name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  
  addParent: (name: string, phone: string, role?: string) => Promise<void>;
  deleteParent: (id: string) => Promise<void>;
  
  addStudent: (name: string, groupId: string, parentId: string, firstArrivalDate?: string, firstPaymentDate?: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Tracking Operations
  setAttendance: (studentId: string, date: string, status: 'present' | 'absent') => Promise<void>;
  setPayment: (studentId: string, month: string, status: 'paid' | 'unpaid' | 'overdue', amount: number, paymentDate: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  supabaseUrl: '',
  supabaseKey: '',
  macrodroidUrl: '',
  isConfigured: false,
  isConfigModalOpen: false,
  supabaseClient: null,

  groups: [],
  parents: [],
  students: [],
  templates: [],
  attendance: [],
  payments: [],
  isLoading: false,

  activeTab: 'workspace',
  selectedGroupId: null,

  isComplaintModalOpen: false,
  complaintStudentId: null,

  alertDialog: { isOpen: false, title: '', message: '', type: 'info' },

  openAlert: (title, message, type = 'info') => set({ alertDialog: { isOpen: true, title, message, type } }),
  closeAlert: () => set(state => ({ alertDialog: { ...state.alertDialog, isOpen: false } })),

  loadConfigFromStorage: () => {
    if (typeof window !== 'undefined') {
      const defaultUrl = 'https://giukfeihlvkkzcyoxanf.supabase.co';
      const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdWtmZWlobHZra3pjeW94YW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTk1NjAsImV4cCI6MjA5NjY3NTU2MH0.2Tt7GIRu9zT67w1bdHRoMTuKvuqGqK1jk1V5AX7yxu0';
      const defaultMacro = 'https://trigger.macrodroid.com/8606dfef-2e5e-44cc-bd29-6dd4b10559b1/send_me';

      const url = localStorage.getItem('supabase_url') || defaultUrl;
      const key = localStorage.getItem('supabase_key') || defaultKey;
      const macroUrl = localStorage.getItem('macrodroid_url') || defaultMacro;
      
      const isConfigured = Boolean(url && key);
      let client = null;
      if (isConfigured) {
        client = createClient(url, key);
      }

      set({ 
        supabaseUrl: url, 
        supabaseKey: key, 
        macrodroidUrl: macroUrl,
        isConfigured,
        supabaseClient: client
      });

      if (isConfigured) {
        get().fetchData();
      } else {
        set({ isConfigModalOpen: true });
      }
    }
  },

  setConfig: (url, key, macroUrl) => {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    localStorage.setItem('macrodroid_url', macroUrl);
    
    set({
      supabaseUrl: url,
      supabaseKey: key,
      macrodroidUrl: macroUrl,
      isConfigured: Boolean(url && key),
      supabaseClient: url && key ? createClient(url, key) : null,
      isConfigModalOpen: false
    });

    get().fetchData();
  },

  openConfigModal: () => set({ isConfigModalOpen: true }),
  closeConfigModal: () => set({ isConfigModalOpen: false }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  openComplaintModal: (studentId) => set({ isComplaintModalOpen: true, complaintStudentId: studentId }),
  closeComplaintModal: () => set({ isComplaintModalOpen: false, complaintStudentId: null }),

  fetchData: async () => {
    const { supabaseClient, isConfigured } = get();
    if (!isConfigured || !supabaseClient) return;

    set({ isLoading: true });
    try {
      const [groupsRes, parentsRes, studentsRes, templatesRes] = await Promise.all([
        supabaseClient.from('groups').select('*').order('name'),
        supabaseClient.from('parents').select('*').order('full_name'),
        supabaseClient.from('students').select('*, groups(*), parents(*)').order('full_name'),
        supabaseClient.from('templates').select('*')
      ]);

      const attRes = await supabaseClient.from('attendance').select('*');
      if (attRes.error) throw attRes.error;
      const attendanceData = attRes.data || [];

      const payRes = await supabaseClient.from('payments').select('*');
      if (payRes.error) throw payRes.error;
      const paymentsData = payRes.data || [];

      set({
        groups: groupsRes.data || [],
        parents: parentsRes.data || [],
        students: studentsRes.data || [],
        templates: templatesRes.data || [],
        attendance: attendanceData,
        payments: paymentsData,
        isLoading: false
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      set({ isLoading: false });
    }
  },

  // Admin Actions
  addGroup: async (name) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('groups').insert([{ name }]);
    get().fetchData();
  },
  deleteGroup: async (id) => {
    const { supabaseClient, selectedGroupId } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('groups').delete().eq('id', id);
    if (selectedGroupId === id) set({ selectedGroupId: null });
    get().fetchData();
  },

  addParent: async (name, phone, role) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    const record: any = { full_name: name, phone_number: phone, role };
    await supabaseClient.from('parents').insert([record]);
    get().fetchData();
  },
  deleteParent: async (id) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('parents').delete().eq('id', id);
    get().fetchData();
  },

  addStudent: async (name, groupId, parentId, firstArrivalDate, firstPaymentDate) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;

    const record: any = {
      full_name: name,
      group_id: groupId,
      parent_id: parentId,
      first_arrival_date: firstArrivalDate || null,
      first_payment_date: firstPaymentDate || null
    };

    await supabaseClient.from('students').insert([record]);
    get().fetchData();
  },
  deleteStudent: async (id) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('students').delete().eq('id', id);
    get().fetchData();
  },

  setAttendance: async (studentId, date, status) => {
    const { supabaseClient, attendance } = get();
    if (!supabaseClient) return;

    const updated = [...attendance];
    const existingIndex = updated.findIndex(a => a.student_id === studentId && a.date === date);
    if (existingIndex >= 0) {
      updated[existingIndex] = { ...updated[existingIndex], status };
    } else {
      updated.push({
        id: Math.random().toString(36).substring(2),
        student_id: studentId,
        date,
        status
      });
    }
    set({ attendance: updated });

    try {
      await supabaseClient.from('attendance').delete().eq('student_id', studentId).eq('date', date);
      await supabaseClient.from('attendance').insert([{
        student_id: studentId,
        date,
        status
      }]);
    } catch (e) {
      console.error("Could not sync attendance to Supabase database:", e);
    }
    get().fetchData();
  },

  setPayment: async (studentId, month, status, amount, paymentDate) => {
    const { supabaseClient, payments } = get();
    if (!supabaseClient) return;

    const updated = [...payments];
    const existingIndex = updated.findIndex(p => p.student_id === studentId && p.period_month === month);
    if (existingIndex >= 0) {
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        status, 
        amount, 
        payment_date: paymentDate 
      };
    } else {
      updated.push({
        id: Math.random().toString(36).substring(2),
        student_id: studentId,
        period_month: month,
        status,
        amount,
        payment_date: paymentDate
      });
    }
    set({ payments: updated });

    try {
      await supabaseClient.from('payments').delete().eq('student_id', studentId).eq('period_month', month);
      await supabaseClient.from('payments').insert([{
        student_id: studentId,
        period_month: month,
        status,
        amount,
        payment_date: paymentDate || null
      }]);
    } catch (e) {
      console.error("Could not sync payment to Supabase database:", e);
    }
    get().fetchData();
  }
}));
