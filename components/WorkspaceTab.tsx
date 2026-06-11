import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, TriangleAlert, CheckCircle, XCircle, Calendar, 
  CreditCard, Sparkles, DollarSign, Edit, Check, AlertTriangle, HelpCircle, UsersRound
} from 'lucide-react';

type GroupSubTab = 'roster' | 'attendance' | 'payments';

export function WorkspaceTab() {
  const { 
    groups, students, attendance, payments,
    selectedGroupId, setSelectedGroupId,
    openComplaintModal, setAttendance, setPayment
  } = useStore();

  const [activeGroupTab, setActiveGroupTab] = useState<GroupSubTab>('roster');
  
  // Date and month states
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });

  // State to manage editing amount/date inline for payment
  const [editingPaymentStudentId, setEditingPaymentStudentId] = useState<string | null>(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState<number>(500000); // default sum amount
  const [editPaymentDate, setEditPaymentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const groupStudents = students.filter(s => s.group_id === selectedGroupId);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Auto reset active tab when group changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveGroupTab('roster');
  }, [selectedGroupId]);

  // Generate standard list of months for selection
  const getMonthOptions = () => {
    const list = [];
    const date = new Date();
    // Show 6 months past up to 3 months future
    for (let i = -6; i <= 3; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
      const value = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('ru', { month: 'long', year: 'numeric' });
      list.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return list;
  };

  const handleToggleAttendance = async (studentId: string, currentStatus: string | undefined) => {
    const nextStatus = currentStatus === 'present' ? 'absent' : 'present';
    await setAttendance(studentId, selectedDate, nextStatus);
  };

  const handleSavePaymentRow = async (studentId: string, status: 'paid' | 'unpaid' | 'overdue') => {
    await setPayment(studentId, selectedMonth, status, editPaymentAmount, editPaymentDate);
    setEditingPaymentStudentId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Banner Selection Row */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-tight text-primary uppercase tracking-widest text-[#888] flex items-center gap-1.5">
            <UsersRound className="w-4 h-4 text-secondary" /> Учебные Группы
          </h2>
          <p className="text-xs text-secondary mt-1">Выберите учебный класс для оперативного контроля</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.length === 0 ? (
            <p className="text-xs text-secondary col-span-full py-4 text-center">Группы не настроены в Админ панельке.</p>
          ) : (
            groups.map(g => {
              const studentsInG = students.filter(s => s.group_id === g.id).length;
              return (
                <button 
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`
                    text-left rounded-xl p-4 border transition-all flex justify-between items-center group
                    ${selectedGroupId === g.id 
                      ? 'bg-background border-primary/60 text-accent ring-1 ring-primary/20' 
                      : 'bg-background border-border hover:border-border-hover text-primary'}
                  `}
                >
                  <div>
                    <span className="text-sm font-semibold tracking-wide block">{g.name}</span>
                    <span className="text-[10px] text-secondary/70 mt-0.5 block">{studentsInG} уч. в группе</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedGroupId === g.id ? 'text-primary translate-x-1' : 'text-secondary group-hover:text-primary group-hover:translate-x-1'}`} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Group Stage View */}
      {selectedGroupId && selectedGroup && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border rounded-2xl p-6 space-y-6"
        >
          {/* Group Header & Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/60">
            <div>
              <span className="text-[10px] bg-accent/10 border border-accent/20 text-[#eee] px-2 py-0.5 rounded font-mono uppercase tracking-widest">Группа</span>
              <h2 className="text-xl font-semibold tracking-tight text-primary mt-1.5 matches-title">
                {selectedGroup.name}
              </h2>
            </div>

            {/* Inner Tabs for Workspace Control */}
            <div className="flex bg-background border border-border rounded-full p-1 self-stretch md:self-auto overflow-x-auto">
              <button
                onClick={() => setActiveGroupTab('roster')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  activeGroupTab === 'roster' 
                    ? 'bg-surface text-primary font-bold shadow-sm border border-border/80' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                👥 Состав ({groupStudents.length})
              </button>
              <button
                onClick={() => setActiveGroupTab('attendance')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  activeGroupTab === 'attendance' 
                    ? 'bg-surface text-primary font-bold shadow-sm border border-border/80' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                📅 Посещаемость
              </button>
              <button
                onClick={() => setActiveGroupTab('payments')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  activeGroupTab === 'payments' 
                    ? 'bg-surface text-primary font-bold shadow-sm border border-border/80' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                💰 Контроль Оплат
              </button>
            </div>
          </div>

          {/* Subtab Contents mapping */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              
              {/* ROSTER / STUDENTS LIST */}
              {activeGroupTab === 'roster' && (
                <motion.div
                  key="roster"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider">
                          <th className="py-3 px-4 font-medium">Ученик</th>
                          <th className="py-3 px-4 font-medium">Родитель</th>
                          <th className="py-3 px-4 font-medium">Телефон</th>
                          <th className="py-3 px-4 font-medium font-mono text-center">Дата прибытия / оплаты</th>
                          <th className="py-3 px-4 text-right font-medium">Жалоба</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 text-sm">
                        {groupStudents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-xs text-secondary">
                              В этой группе пока нет учеников. Добавьте его через админ-панель.
                            </td>
                          </tr>
                        ) : (
                          groupStudents.map(s => {
                            return (
                              <tr key={s.id} className="table-row-hover">
                                <td className="py-4 px-4 font-semibold text-primary">{s.full_name}</td>
                                <td className="py-4 px-4 text-secondary">{s.parents?.full_name || 'Не нанят'}</td>
                                <td className="py-4 px-4 text-secondary font-mono text-xs">{s.parents?.phone_number || '—'}</td>
                                <td className="py-4 px-4 text-xs font-mono text-center">
                                  <div className="inline-block text-left space-y-0.5 bg-[#0d0d0d] border border-border p-2 rounded-lg">
                                    <div className="text-[10px] text-secondary/80">📅 Приход: <span className="text-[#ddd]">{s.first_arrival_date || '—'}</span></div>
                                    <div className="text-[10px] text-secondary/80">💳 Первая оплата: <span className="text-emerald-400">{s.first_payment_date || '—'}</span></div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button 
                                    onClick={() => openComplaintModal(s.id)}
                                    className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-background text-xs font-bold py-2 px-3 rounded-full transition-all"
                                  >
                                    <TriangleAlert className="w-3.5 h-3.5" /> <span>Жалоба</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* ATTENDANCE TRACKER */}
              {activeGroupTab === 'attendance' && (
                <motion.div
                  key="attendance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center flex-wrap gap-4 bg-background border border-border p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-semibold text-secondary uppercase tracking-widest">Учетный день</span>
                    </div>
                    <div>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-surface border border-border focus:border-secondary focus:outline-none rounded-lg px-3 py-1.5 text-xs text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl overflow-hidden border border-border">
                    <div className="p-4 bg-background border-b border-border text-[11px] text-secondary uppercase font-bold tracking-wider flex justify-between">
                      <span>Студент</span>
                      <span>Статус (Кликните для переключения)</span>
                    </div>

                    <div className="divide-y divide-border/45">
                      {groupStudents.length === 0 ? (
                        <div className="py-12 text-center text-xs text-secondary">Нет студентов.</div>
                      ) : (
                        groupStudents.map(student => {
                          const record = attendance.find(a => a.student_id === student.id && a.date === selectedDate);
                          const isPresent = record ? record.status === 'present' : false;
                          const isAbsent = record ? record.status === 'absent' : false;
                          const hasStatus = Boolean(record);

                          return (
                            <div key={student.id} className="p-4 flex justify-between items-center hover:bg-surface-hover/50 transition-colors">
                              <div>
                                <span className="text-sm font-semibold text-primary">{student.full_name}</span>
                                {student.first_arrival_date && (
                                  <p className="text-[10px] text-secondary mt-0.5">Впервые пришел: {student.first_arrival_date}</p>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setAttendance(student.id, selectedDate, 'present')}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    isPresent 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                      : 'bg-background hover:bg-[#121212] border-border text-secondary'
                                  }`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Был
                                </button>
                                <button
                                  onClick={() => setAttendance(student.id, selectedDate, 'absent')}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    isAbsent 
                                      ? 'bg-error/10 text-error border-error/30' 
                                      : 'bg-background hover:bg-[#121212] border-border text-secondary'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Не пришел
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PAYMENTS CONTROL */}
              {activeGroupTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center flex-wrap gap-4 bg-background border border-border p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-semibold text-secondary uppercase tracking-widest">Учетный месяц</span>
                    </div>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="bg-surface border border-border focus:border-secondary focus:outline-none rounded-lg px-3 py-1.5 text-xs text-primary font-medium"
                    >
                      {getMonthOptions().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider bg-background">
                          <th className="py-3 px-4 font-semibold">Студент</th>
                          <th className="py-3 px-4 font-semibold">Первая дата (вики)</th>
                          <th className="py-3 px-4 font-semibold">Сумма оплаты</th>
                          <th className="py-3 px-4 font-semibold">Дата транзакции</th>
                          <th className="py-3 px-4 font-semibold text-center">Статус ({selectedMonth})</th>
                          <th className="py-3 px-4 text-right font-semibold">Быстрые действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/45 text-xs">
                        {groupStudents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-secondary">Ученики не найдены.</td>
                          </tr>
                        ) : (
                          groupStudents.map(student => {
                            const paymentRecord = payments.find(p => p.student_id === student.id && p.period_month === selectedMonth);
                            const isPaid = paymentRecord?.status === 'paid';
                            const isUnpaid = !paymentRecord || paymentRecord.status === 'unpaid';
                            const isOverdue = paymentRecord?.status === 'overdue';

                            const isEditing = editingPaymentStudentId === student.id;

                            return (
                              <tr key={student.id} className="table-row-hover">
                                <td className="py-3.5 px-4">
                                  <span className="text-sm font-semibold text-primary block">{student.full_name}</span>
                                  <span className="text-[10px] text-secondary mt-0.5">Родитель: {student.parents?.full_name || 'Не нанят'}</span>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-secondary">
                                  <div className="space-y-0.5 text-[10px]">
                                    <div>Прибыл: {student.first_arrival_date || '—'}</div>
                                    <div className="text-emerald-400">Оплатил: {student.first_payment_date || '—'}</div>
                                  </div>
                                </td>
                                
                                <td className="py-3.5 px-4 font-mono">
                                  {isEditing ? (
                                    <input 
                                      type="number"
                                      value={editPaymentAmount}
                                      onChange={e => setEditPaymentAmount(Number(e.target.value))}
                                      className="bg-background border border-border focus:outline-none rounded px-2 py-1 w-24 text-xs text-primary"
                                    />
                                  ) : (
                                    paymentRecord?.amount ? (
                                      <span className="text-emerald-400 font-semibold">{paymentRecord.amount.toLocaleString()} сум</span>
                                    ) : (
                                      <span className="text-secondary/50">—</span>
                                    )
                                  )}
                                </td>

                                <td className="py-3.5 px-4 font-mono">
                                  {isEditing ? (
                                    <input 
                                      type="date"
                                      value={editPaymentDate}
                                      onChange={e => setEditPaymentDate(e.target.value)}
                                      className="bg-background border border-border focus:outline-none rounded px-2 py-1 text-[11px] text-primary"
                                    />
                                  ) : (
                                    paymentRecord?.payment_date ? (
                                      <span className="text-primary">{paymentRecord.payment_date}</span>
                                    ) : (
                                      <span className="text-secondary/50">—</span>
                                    )
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  {isPaid && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                                      <Check className="w-3 h-3" /> Оплачено
                                    </span>
                                  )}
                                  {isUnpaid && (
                                    <span className="inline-flex items-center gap-1 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 px-3 py-1 rounded-full font-medium">
                                      <HelpCircle className="w-3 h-3" /> Ожидает
                                    </span>
                                  )}
                                  {isOverdue && (
                                    <span className="inline-flex items-center gap-1 bg-error/10 text-error border border-error/20 px-3 py-1 rounded-full font-bold">
                                      <AlertTriangle className="w-3 h-3" /> Не оплатил
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  {isEditing ? (
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleSavePaymentRow(student.id, 'paid')}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-background px-3 py-1 rounded-full text-[10px] font-bold"
                                      >
                                        Оплачено
                                      </button>
                                      <button
                                        onClick={() => handleSavePaymentRow(student.id, 'overdue')}
                                        className="bg-error hover:bg-[#ff3b30] text-[#fff] px-3 py-1 rounded-full text-[10px] font-bold"
                                      >
                                        Просрочена
                                      </button>
                                      <button
                                        onClick={() => setEditingPaymentStudentId(null)}
                                        className="bg-background border border-border px-3 py-1 rounded-full text-[10px] text-secondary hover:text-primary"
                                      >
                                        Отмена
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingPaymentStudentId(student.id);
                                        setEditPaymentAmount(paymentRecord?.amount || 500000);
                                        setEditPaymentDate(paymentRecord?.payment_date || new Date().toISOString().split('T')[0]);
                                      }}
                                      className="inline-flex items-center gap-1 bg-background hover:bg-surface-hover/80 border border-border text-xs px-3 py-1.5 rounded-full text-secondary hover:text-primary transition-all"
                                    >
                                      <Edit className="w-3 h-3" /> Редактировать
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
