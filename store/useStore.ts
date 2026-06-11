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

      // Try fetching attendance
      let attendanceData: Attendance[] = [];
      try {
        const attRes = await supabaseClient.from('attendance').select('*');
        if (attRes.error) throw attRes.error;
        attendanceData = attRes.data || [];
      } catch (e) {
        console.warn("Could not fetch attendance from Supabase, falling back to local storage", e);
        const stored = localStorage.getItem('local_attendance');
        attendanceData = stored ? JSON.parse(stored) : [];
      }

      // Try fetching payments
      let paymentsData: Payment[] = [];
      try {
        const payRes = await supabaseClient.from('payments').select('*');
        if (payRes.error) throw payRes.error;
        paymentsData = payRes.data || [];
      } catch (e) {
        console.warn("Could not fetch payments from Supabase, falling back to local storage", e);
        const stored = localStorage.getItem('local_payments');
        paymentsData = stored ? JSON.parse(stored) : [];
      }

      // Merge locally stored extra parent fields if Supabase table might not have columns
      const parentsData = (parentsRes.data || []).map((p: any) => {
        const storedRole = localStorage.getItem(`parent_role_${p.id}`);
        return {
          ...p,
          role: p.role || storedRole || undefined
        };
      });

      // Merge locally stored extra student fields if Supabase table might not have columns
      const studentsData = (studentsRes.data || []).map((s: any) => {
        const storedExtrasStr = localStorage.getItem(`student_extras_${s.id}`);
        const parentId = s.parents?.id;
        const storedParentRole = parentId ? localStorage.getItem(`parent_role_${parentId}`) : undefined;
        
        let parentNode = s.parents;
        if (parentNode && storedParentRole && !parentNode.role) {
          parentNode = { ...parentNode, role: storedParentRole };
        }

        if (storedExtrasStr) {
          const extras = JSON.parse(storedExtrasStr);
          return {
            ...s,
            parents: parentNode,
            first_arrival_date: s.first_arrival_date || extras.first_arrival_date,
            first_payment_date: s.first_payment_date || extras.first_payment_date
          };
        }
        return {
          ...s,
          parents: parentNode
        };
      });

      set({
        groups: groupsRes.data || [],
        parents: parentsData,
        students: studentsData,
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
    const record: any = { full_name: name, phone_number: phone };
    if (role) {
      record.role = role;
    }
    try {
      const res = await supabaseClient.from('parents').insert([record]).select();
      if (res.data && res.data[0] && role) {
        localStorage.setItem(`parent_role_${res.data[0].id}`, role);
      }
    } catch (e) {
      console.warn("Error inserting parent with role column, falling back", e);
      const resFallback = await supabaseClient.from('parents').insert([{ full_name: name, phone_number: phone }]).select();
      if (resFallback.data && resFallback.data[0] && role) {
        localStorage.setItem(`parent_role_${resFallback.data[0].id}`, role);
      }
    }
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

    // Build insert object
    const record: any = {
      full_name: name,
      group_id: groupId,
      parent_id: parentId
    };

    // Try standard columns first
    if (firstArrivalDate) record.first_arrival_date = firstArrivalDate;
    if (firstPaymentDate) record.first_payment_date = firstPaymentDate;

    try {
      const res = await supabaseClient.from('students').insert([record]).select();
      
      // If we succeeded and we have local extra values, save them anyway as fallback backup
      if (res.data && res.data[0] && (firstArrivalDate || firstPaymentDate)) {
        const studentId = res.data[0].id;
        localStorage.setItem(`student_extras_${studentId}`, JSON.stringify({
          first_arrival_date: firstArrivalDate,
          first_payment_date: firstPaymentDate
        }));
      }
    } catch (e: any) {
      console.warn("Inserting with date columns failed, trying fallback insert of basic info", e);
      // Fallback: insert only mandatory fields
      const fallbackRecord = {
        full_name: name,
        group_id: groupId,
        parent_id: parentId
      };
      const res = await supabaseClient.from('students').insert([fallbackRecord]).select();
      
      // Save dates to client-side localStorage fallback so it compiles and renders without loss!
      if (res.data && res.data[0]) {
        const studentId = res.data[0].id;
        localStorage.setItem(`student_extras_${studentId}`, JSON.stringify({
          first_arrival_date: firstArrivalDate,
          first_payment_date: firstPaymentDate
        }));
      }
    }
    get().fetchData();
  },
  deleteStudent: async (id) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('students').delete().eq('id', id);
    localStorage.removeItem(`student_extras_${id}`);
    get().fetchData();
  },

  setAttendance: async (studentId, date, status) => {
    const { supabaseClient, attendance } = get();
    
    // Optimistic update
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
    localStorage.setItem('local_attendance', JSON.stringify(updated));

    if (supabaseClient) {
      try {
        // Delete any existing first to prevent duplicate key violations
        await supabaseClient.from('attendance').delete().eq('student_id', studentId).eq('date', date);
        await supabaseClient.from('attendance').insert([{
          student_id: studentId,
          date,
          status
        }]);
      } catch (e) {
        console.warn("Could not sync attendance to Supabase database:", e);
      }
    }
  },

  setPayment: async (studentId, month, status, amount, paymentDate) => {
    const { supabaseClient, payments } = get();

    // Optimistic update
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
    localStorage.setItem('local_payments', JSON.stringify(updated));

    if (supabaseClient) {
      try {
        // Delete any existing first
        await supabaseClient.from('payments').delete().eq('student_id', studentId).eq('period_month', month);
        await supabaseClient.from('payments').insert([{
          student_id: studentId,
          period_month: month,
          status,
          amount,
          payment_date: paymentDate
        }]);
      } catch (e) {
        console.warn("Could not sync payment to Supabase database:", e);
      }
    }
  }
}));
