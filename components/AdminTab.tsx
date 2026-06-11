import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Database, X, ChevronRight, Plus, 
  Trash2, Search, Filter, ShieldCheck, CreditCard, Check, AlertCircle, Info, CalendarRange
} from 'lucide-react';

type SubTab = 'analytics' | 'register' | 'groups' | 'parents' | 'registry';

export function AdminTab() {
  const { 
    groups, parents, students, attendance, payments,
    addGroup, deleteGroup,
    addParent, deleteParent,
    addStudent, deleteStudent
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('analytics');

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentRole, setNewParentRole] = useState('Мама');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [firstArrivalDate, setFirstArrivalDate] = useState('');
  const [firstPaymentDate, setFirstPaymentDate] = useState('');

  // Table search and filters
  const [studentSearchUrl, setStudentSearchUrl] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      await addGroup(newGroupName);
      setNewGroupName('');
    }
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newParentName.trim() && newParentPhone.trim()) {
      await addParent(newParentName, newParentPhone, newParentRole);
      setNewParentName('');
      setNewParentPhone('');
      setNewParentRole('Мама');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && selectedGroup && selectedParent) {
      await addStudent(
        newStudentName, 
        selectedGroup, 
        selectedParent, 
        firstArrivalDate || undefined, 
        firstPaymentDate || undefined
      );
      setNewStudentName('');
      setSelectedGroup('');
      setSelectedParent('');
      setFirstArrivalDate('');
      setFirstPaymentDate('');
      setActiveSubTab('registry'); // auto navigate to registry to see added student
    }
  };

  // Helper metrics
  const totalStudents = students.length;
  const totalGroups = groups.length;
  const totalParents = parents.length;
  
  // Calculate attendance rate for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = todayAttendance.length > 0 
    ? Math.round((presentCount / todayAttendance.length) * 100) 
    : 0;

  // Calculate current month's paid count
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const paidPaymentsThisMonth = payments.filter(p => p.period_month === currentMonth && p.status === 'paid');
  const totalAmountThisMonth = paidPaymentsThisMonth.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(studentSearchUrl.toLowerCase()) ||
                          s.parents?.full_name.toLowerCase().includes(studentSearchUrl.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'all' || s.group_id === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* SaaS Premium Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider block">Студенты</span>
            <Users className="w-4 h-4 text-[#888]" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-primary">{totalStudents}</span>
            <p className="text-[10px] text-secondary mt-1">всего в системе</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider block">Группы</span>
            <Database className="w-4 h-4 text-[#888]" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-primary">{totalGroups}</span>
            <p className="text-[10px] text-secondary mt-1">активных классов</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider block">Родители</span>
            <UserPlus className="w-4 h-4 text-[#888]" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-primary">{totalParents}</span>
            <p className="text-[10px] text-secondary mt-1">база контактов</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider block">Посещаемость</span>
            <CalendarRange className="w-4 h-4 text-[#888]" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-primary">{attendanceRate}%</span>
            <p className="text-[10px] text-secondary mt-1">за сегодняшний день</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 col-span-2 md:col-span-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider block">Выручка ({new Date().toLocaleString('ru', {month: 'short'})})</span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-semibold text-emerald-500 font-mono">
              {totalAmountThisMonth.toLocaleString('ru')} <span className="text-xs">сум</span>
            </span>
            <p className="text-[10px] text-secondary mt-1">{paidPaymentsThisMonth.length} оплат принято</p>
          </div>
        </div>
      </div>

      {/* Admin Subtabs navigation */}
      <div className="flex border-b border-border overflow-x-auto gap-2 py-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-lg transition-colors ${
            activeSubTab === 'analytics' 
              ? 'bg-surface text-primary border border-border' 
              : 'text-secondary hover:text-primary hover:bg-surface/35'
          }`}
        >
          📊 Дашборд
        </button>
        <button
          onClick={() => setActiveSubTab('register')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-lg transition-colors ${
            activeSubTab === 'register' 
              ? 'bg-surface text-primary border border-border' 
              : 'text-secondary hover:text-primary hover:bg-surface/35'
          }`}
        >
          ➕ Новый Ученик
        </button>
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-lg transition-colors ${
            activeSubTab === 'groups' 
              ? 'bg-surface text-primary border border-border' 
              : 'text-secondary hover:text-primary hover:bg-surface/35'
          }`}
        >
          🏫 Группы
        </button>
        <button
          onClick={() => setActiveSubTab('parents')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-lg transition-colors ${
            activeSubTab === 'parents' 
              ? 'bg-surface text-primary border border-border' 
              : 'text-secondary hover:text-primary hover:bg-surface/35'
          }`}
        >
          📱 Родители
        </button>
        <button
          onClick={() => setActiveSubTab('registry')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-lg transition-colors ${
            activeSubTab === 'registry' 
              ? 'bg-surface text-primary border border-border' 
              : 'text-secondary hover:text-primary hover:bg-surface/35'
          }`}
        >
          📂 Общий Реестр ({totalStudents})
        </button>
      </div>

      {/* Primary Subtab Content Stage */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* ANALYTICS SUBTAB */}
          {activeSubTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-emerald-500 w-4 h-4" /> Быстрый Статус Студентов
                  </h3>
                  <p className="text-xs text-secondary mb-4">Ближайшие прибытия у учеников в группах</p>
                  
                  <div className="space-y-3">
                    {students.slice(0, 5).map(s => {
                      const hasPaidExtra = s.first_payment_date;
                      return (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-background border border-border rounded-lg text-sm">
                          <div>
                            <span className="font-semibold text-primary">{s.full_name}</span>
                            <div className="flex gap-4 text-[11px] text-secondary mt-1">
                              <span>Группа: {s.groups?.name || '—'}</span>
                              {s.first_arrival_date && (
                                <span>Пришел впервые: <b className="text-primary">{s.first_arrival_date}</b></span>
                              )}
                            </div>
                          </div>
                          <div>
                            {hasPaidExtra ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-full font-medium">
                                Первая оплата: {s.first_payment_date}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-full font-medium">
                                Без оплаты
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {students.length === 0 && (
                      <div className="py-8 text-center text-xs text-secondary">Нет зарегистрированных студентов в ситеме. Перейдите в раздел &quot;Новый Ученик&quot;.</div>
                    )}
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2 mb-3">
                    <Info className="text-secondary w-4 h-4" /> Памятка для администратора
                  </h3>
                  <div className="prose prose-sm text-secondary text-xs space-y-2 leading-relaxed">
                    <p>Для корректной автоматической синхронизации оплат и посещаемости учеников:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>При регистрации нового ученика обязательно выберите группу и соответствующего родителя из базы;</li>
                      <li>Укажите даты первого посещения и первой оплаты, чтобы знать, когда у студента начался цикл обучения;</li>
                      <li>Для отправки мгновенных жалоб родителям на телефон убедитесь, что в верхнем правом углу в &quot;Настройках&quot; прописан корректный URL вебхука от MacroDroid.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Side logs / instructions panel */}
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Журнал Действий</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
                    <div className="text-xs border-l-2 border-emerald-500 pl-3 py-1 space-y-1">
                      <p className="text-primary font-medium">Сервер активен</p>
                      <p className="text-secondary text-[10px]">Клиентское подключение к Supabase установлено.</p>
                      <span className="text-[9px] text-secondary/50 font-mono">Только что</span>
                    </div>
                    <div className="text-xs border-l-2 border-primary/20 pl-3 py-1 space-y-1">
                      <p className="text-primary font-medium">Оплаты настроены</p>
                      <p className="text-secondary text-[10px]">Таблица платежей интегрирована с локальным кэшированием.</p>
                      <span className="text-[9px] text-secondary/50 font-mono">10 мин назад</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* REGISTER STUDENT SUBTAB */}
          {activeSubTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-surface border border-border rounded-xl p-6 max-w-2xl mx-auto"
            >
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-primary">Регистрационная анкета студента</h3>
                <p className="text-xs text-secondary mt-1">
                  Заполните ФИО, прикрепите класс обучения и ответственного родителя.
                </p>
              </div>

              {parents.length === 0 || groups.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-xs space-y-2 mb-6">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Недостаточно данных для привязки ученика
                  </p>
                  <p>
                    Перед регистрацией нового ученика необходимо создать хотя бы одну <b>Учебную группу</b> и зарегистрировать хотя бы одного <b>Родителя</b> (для привязки контактов).
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setActiveSubTab('groups')} 
                      className="bg-amber-500 text-background px-3 py-1.5 rounded-full font-semibold text-[10px]"
                    >
                      Создать группу
                    </button>
                    <button 
                      onClick={() => setActiveSubTab('parents')} 
                      className="bg-surface border border-border text-primary px-3 py-1.5 rounded-full font-semibold text-[10px]"
                    >
                      Создать родителя
                    </button>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleAddStudent} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest">
                      ФИО Ученика *
                    </label>
                    <input 
                      type="text" 
                      value={newStudentName}
                      onChange={e => setNewStudentName(e.target.value)}
                      placeholder="Например: Смирнов Даниил"
                      className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary placeholder:text-secondary/40"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest">
                      Выберите учебную группу *
                    </label>
                    <select 
                      value={selectedGroup}
                      onChange={e => setSelectedGroup(e.target.value)}
                      className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary appearance-none"
                      required
                    >
                      <option value="" disabled>-- Выберите из списка --</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest">
                    Ответственный за коммуникацию родитель *
                  </label>
                  <select 
                    value={selectedParent}
                    onChange={e => setSelectedParent(e.target.value)}
                    className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary appearance-none"
                    required
                  >
                    <option value="" disabled>-- Выберите родителя (поиск контактов) --</option>
                    {parents.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.phone_number})</option>)}
                  </select>
                </div>

                {/* ADVANCED FIELDS requested by user (First Arrival Date and First Payment Date Upon Registration) */}
                <div className="border-t border-border/80 pt-4 mt-6">
                  <h4 className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3 flex items-center gap-1">
                    🗓️ Исторический запуск (Первый визит и оплата)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-medium text-secondary">
                        Когда впервые пришел на занятие? (необязательно)
                      </label>
                      <input 
                        type="date" 
                        value={firstArrivalDate}
                        onChange={e => setFirstArrivalDate(e.target.value)}
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-medium text-secondary">
                        Когда произвел самую первую оплату? (необязательно)
                      </label>
                      <input 
                        type="date" 
                        value={firstPaymentDate}
                        onChange={e => setFirstPaymentDate(e.target.value)}
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-accent hover:bg-accent-hover text-background text-sm font-semibold px-8 py-3 rounded-full transition-colors disabled:opacity-40"
                    disabled={!groups.length || !parents.length}
                  >
                    Зарегистрировать Ученика
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* GROUPS SUBTAB */}
          {activeSubTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-secondary" /> Создать Группу
                  </h3>
                  <p className="text-xs text-secondary mb-6">Добавление нового учебного класса в расписание учителя.</p>
                  
                  <form onSubmit={handleAddGroup} className="space-y-4">
                    <input 
                      type="text" 
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      placeholder="Например, General English 10:00"
                      className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary"
                      required
                    />
                    <button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Добавить группу
                    </button>
                  </form>
                </div>
              </div>

              {/* List of existing groups */}
              <div className="md:col-span-2 bg-surface border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-primary mb-1">Активные группы</h3>
                <p className="text-xs text-secondary mb-4">Всего {groups.length} классов</p>
                
                <div className="divide-y divide-border/60">
                  {groups.map(g => {
                    const groupStudentsCount = students.filter(s => s.group_id === g.id).length;
                    return (
                      <div key={g.id} className="flex justify-between items-center py-4 group/row">
                        <div>
                          <p className="text-sm font-semibold text-primary">{g.name}</p>
                          <p className="text-xs text-secondary mt-0.5">{groupStudentsCount} студентов привязано</p>
                        </div>
                        <button 
                          onClick={() => deleteGroup(g.id)}
                          className="opacity-0 group-hover/row:opacity-100 text-secondary hover:text-error transition-all p-2 rounded-full hover:bg-error-muted"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  {groups.length === 0 && (
                    <div className="py-12 text-center text-xs text-secondary">Группы пока не созданы.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PARENTS SUBTAB */}
          {activeSubTab === 'parents' && (
            <motion.div
              key="parents"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-secondary" /> Новый родитель
                  </h3>
                  <p className="text-xs text-secondary mb-6">Создайте карточку доверенного лица перед привязкой ученика.</p>
                  
                  <form onSubmit={handleAddParent} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest">ФИО Родителя</label>
                      <input 
                        type="text" 
                        value={newParentName}
                        onChange={e => setNewParentName(e.target.value)}
                        placeholder="Например, Иванова В. К."
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest">Номер Телефона (для СМС)</label>
                      <input 
                        type="text" 
                        value={newParentPhone}
                        onChange={e => setNewParentPhone(e.target.value)}
                        placeholder="+998901234567"
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest">Роль (Кем приходится ученику)</label>
                      <select 
                        value={newParentRole}
                        onChange={e => setNewParentRole(e.target.value)}
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary"
                        required
                      >
                        <option value="Мама">Мама</option>
                        <option value="Папа">Папа</option>
                        <option value="Сестра">Сестра</option>
                        <option value="Брат">Брат</option>
                        <option value="Бабушка">Бабушка</option>
                        <option value="Дедушка">Дедушка</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" /> Зарегистрировать родителя
                    </button>
                  </form>
                </div>
              </div>

              {/* Parents list table */}
              <div className="md:col-span-2 bg-surface border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-primary mb-1">База Контактов</h3>
                <p className="text-xs text-secondary mb-4">Всего {parents.length} контактных лиц</p>
                
                <div className="overflow-y-auto max-h-[450px] pr-2 custom-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] text-secondary uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold">ФИО Родителя</th>
                        <th className="py-2.5 px-3 font-semibold">Телефон</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Удаление</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs">
                      {parents.map(p => (
                        <tr key={p.id} className="group/prow hover:bg-surface-hover transition-colors">
                          <td className="py-3 px-3 font-medium text-primary flex items-center gap-2">
                            <span>{p.full_name}</span>
                            {p.role && (
                              <span className="text-[10px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">
                                {p.role}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-secondary">{p.phone_number}</td>
                          <td className="py-3 px-3 text-right">
                            <button 
                              onClick={() => deleteParent(p.id)}
                              className="opacity-0 group-hover/prow:opacity-100 text-secondary hover:text-error transition-all p-1.5 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {parents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-secondary">Контакты отсутствуют.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* MASTER SEARCH REGISTRY SUBTAB */}
          {activeSubTab === 'registry' && (
            <motion.div
              key="registry"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-primary">Реестр Учеников</h3>
                  <p className="text-xs text-secondary mt-1">Полный перечень студентов в системе с фильтрацией.</p>
                </div>

                {/* Filter and search tools */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={studentSearchUrl}
                      onChange={e => setStudentSearchUrl(e.target.value)}
                      placeholder="Поиск по ФИО..."
                      className="bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-full pl-9 pr-4 py-2 text-xs w-full sm:w-48 transition-colors text-primary"
                    />
                  </div>
                  
                  <select 
                    value={selectedGroupFilter}
                    onChange={e => setSelectedGroupFilter(e.target.value)}
                    className="bg-background border border-border focus:outline-none rounded-full px-4 py-2 text-xs text-secondary appearance-none pr-8 relative transition-colors"
                  >
                    <option value="all">Все группы</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Table rendering details */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4 font-medium">ФИО Ученика</th>
                      <th className="py-3 px-4 font-medium">Группа</th>
                      <th className="py-3 px-4 font-medium">Родитель</th>
                      <th className="py-3 px-4 font-medium font-mono">Дата Первого Занятия / Оплаты</th>
                      <th className="py-3 px-4 text-right font-medium">Управление</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-secondary">
                          Студенты не найдены. Создайте запись с помощью вкладки &quot;Новый Ученик&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="table-row-hover group/stdrow">
                          <td className="py-4 px-4 font-medium text-primary">{s.full_name}</td>
                          <td className="py-4 px-4 text-secondary">{s.groups?.name || <span className="text-error text-xs">Не нанят</span>}</td>
                          <td className="py-4 px-4 text-secondary">
                            <div>
                              <span>{s.parents?.full_name || <span className="text-secondary">—</span>}</span>
                              {s.parents?.phone_number && (
                                <p className="text-[10px] text-secondary/70 font-mono mt-0.5">{s.parents.phone_number}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-secondary text-xs font-mono">
                            <div className="space-y-1">
                              <div>🚶 Приход: {s.first_arrival_date ? <b className="text-[#eee]">{s.first_arrival_date}</b> : <span className="text-secondary/40 font-sans">—</span>}</div>
                              <div>💳 Оплата: {s.first_payment_date ? <b className="text-emerald-400">{s.first_payment_date}</b> : <span className="text-secondary/40 font-sans">—</span>}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button 
                              onClick={() => deleteStudent(s.id)} 
                              className="opacity-0 group-hover/stdrow:opacity-100 text-secondary hover:text-error transition-all p-1.5 rounded-full hover:bg-error-muted"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
