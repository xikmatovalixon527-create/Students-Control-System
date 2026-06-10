import { create } from 'zustand';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Group, Parent, Student, Template, AppLog } from '@/types';

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
  
  addParent: (name: string, phone: string) => Promise<void>;
  deleteParent: (id: string) => Promise<void>;
  
  addStudent: (name: string, groupId: string, parentId: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
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
      const url = localStorage.getItem('supabase_url') || '';
      const key = localStorage.getItem('supabase_key') || '';
      const macroUrl = localStorage.getItem('macrodroid_url') || 'https://trigger.macrodroid.com/be1f65a9-f9aa-41be-8458-dfbc026d2fc2/send_sms';
      
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

      set({
        groups: groupsRes.data || [],
        parents: parentsRes.data || [],
        students: studentsRes.data || [],
        templates: templatesRes.data || [],
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

  addParent: async (name, phone) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('parents').insert([{ full_name: name, phone_number: phone }]);
    get().fetchData();
  },
  deleteParent: async (id) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('parents').delete().eq('id', id);
    get().fetchData();
  },

  addStudent: async (name, groupId, parentId) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('students').insert([{
      full_name: name,
      group_id: groupId,
      parent_id: parentId
    }]);
    get().fetchData();
  },
  deleteStudent: async (id) => {
    const { supabaseClient } = get();
    if (!supabaseClient) return;
    await supabaseClient.from('students').delete().eq('id', id);
    get().fetchData();
  }
}));
