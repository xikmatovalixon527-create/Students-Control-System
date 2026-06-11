import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, TriangleAlert, CreditCard, 
  Edit, AlertTriangle, 
  UsersRound, ArrowLeft, Calendar, Phone
} from 'lucide-react';

export function WorkspaceTab() {
  const { 
    groups, students, payments,
    selectedGroupId, setSelectedGroupId,
    openComplaintModal, setPayment
  } = useStore();

  // Local state to track which student profile is active
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // States for inline payment edits in the timeline
  const [editingPeriodKey, setEditingPeriodKey] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(500000);
  const [customDate, setCustomDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const groupStudents = students.filter(s => s.group_id === selectedGroupId);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Clear selected student on group change
  const handleSelectGroup = (id: string | null) => {
    setSelectedGroupId(id);
    setSelectedStudentId(null);
    setEditingPeriodKey(null);
  };

  // Helper to parse "YYYY-MM-DD" standard format safely
  const parseDate = (dStr: string) => {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dStr);
  };

  // Helper to format Date target elegantly
  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Dynamic interval/billing cycle generator based on student registration date
  const generateCycles = (startStr: string | undefined) => {
    if (!startStr) return [];
    const startDate = parseDate(startStr);
    if (isNaN(startDate.getTime())) return [];

    const cycles = [];
    const today = new Date();
    
    // Safety check - if start date is in the deep past, limit periods to avoid overloading UI
    let currentCycleStart = new Date(startDate);
    
    for (let i = 0; i < 36; i++) {
      const nextCycleStart = new Date(currentCycleStart);
      nextCycleStart.setMonth(nextCycleStart.getMonth() + 1);
      
      const startFormatted = formatShortDate(currentCycleStart);
      const endFormatted = formatShortDate(nextCycleStart);
      const periodLabel = `${startFormatted} — ${endFormatted}`;
      const periodKey = currentCycleStart.toISOString().split('T')[0]; // simple stable key e.g "2026-02-02"

      cycles.push({
        index: i + 1,
        startDate: new Date(currentCycleStart),
        endDate: new Date(nextCycleStart),
        periodLabel,
        periodKey,
      });

      // Stop once we generate a cycle in the upcoming 30 days
      const futureCutoff = new Date(today);
      futureCutoff.setDate(futureCutoff.getDate() + 30);
      if (currentCycleStart > futureCutoff) {
        break;
      }
      
      currentCycleStart = nextCycleStart;
    }
    
    return cycles;
  };

  // Helper check to find if a student has ANY unpaid overdue tuition period
  const getStudentDebtStatus = (student: typeof students[0]) => {
    const sDate = student.first_arrival_date || student.first_payment_date;
    if (!sDate) return 'no_date';

    const cycles = generateCycles(sDate);
    const today = new Date();
    let hasOverdue = false;

    for (const cycle of cycles) {
      const paymentRecord = payments.find(p => p.student_id === student.id && p.period_month === cycle.periodKey);
      const isPaid = paymentRecord?.status === 'paid';
      
      // If today is past the start of this billing period and it isn't paid, it is overdue
      if (!isPaid && today > cycle.startDate) {
        hasOverdue = true;
        break;
      }
    }

    return hasOverdue ? 'overdue' : 'good';
  };

  // Quick Action: Mark a cycle as instantly paid with default amount
  const handleInstantPay = async (studentId: string, periodKey: string) => {
    await setPayment(
      studentId, 
      periodKey, 
      'paid', 
      500000, 
      new Date().toISOString().split('T')[0]
    );
  };

  // Save the custom payment input
  const handleSaveCustomPay = async (studentId: string, periodKey: string) => {
    await setPayment(
      studentId, 
      periodKey, 
      'paid', 
      customAmount, 
      customDate
    );
    setEditingPeriodKey(null);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Group Choice Row */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-tight text-primary uppercase tracking-widest text-[#888] flex items-center gap-1.5">
            <UsersRound className="w-4 h-4 text-secondary" /> Учебные Группы
          </h2>
          <p className="text-xs text-secondary mt-1">Выберите класс для работы со списком учеников и их оплатами</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.length === 0 ? (
            <p className="text-xs text-secondary col-span-full py-4 text-center">Группы пока не занесены в реестр в Админ панели.</p>
          ) : (
            groups.map(g => {
              const studentsInG = students.filter(s => s.group_id === g.id).length;
              const hasSelected = selectedGroupId === g.id;
              return (
                <button 
                  key={g.id}
                  onClick={() => handleSelectGroup(g.id)}
                  id={`group-btn-${g.id}`}
                  className={`
                    text-left rounded-xl p-4 border transition-all flex justify-between items-center group
                    ${hasSelected 
                      ? 'bg-background border-primary/60 text-accent ring-1 ring-primary/20 shadow-lg' 
                      : 'bg-background border-border hover:border-border-hover text-primary'}
                  `}
                >
                  <div>
                    <span className="text-sm font-semibold tracking-wide block">{g.name}</span>
                    <span className="text-[10px] text-secondary mt-0.5 block">{studentsInG} человек</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${hasSelected ? 'text-primary translate-x-1' : 'text-secondary group-hover:text-primary group-hover:translate-x-1'}`} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Stage Area */}
      {selectedGroupId && selectedGroup && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border rounded-2xl p-6 space-y-6"
        >
          {/* Header block with Group details */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/60">
            <div>
              <span className="text-[10px] bg-accent/15 border border-accent/20 text-accent px-2 py-0.5 rounded font-mono uppercase tracking-widest">Рабочая зона</span>
              <h2 className="text-xl font-semibold tracking-tight text-primary mt-1.5 matches-title">
                Класс: {selectedGroup.name}
              </h2>
            </div>
            {selectedStudentId && (
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors bg-background border border-border py-2 px-4 rounded-full"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Вернуться к списку
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            
            {/* VIEW A: LIST OF STUDENTS IN GROUP */}
            {!selectedStudentId ? (
              <motion.div
                key="student-list"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Состав класса ({groupStudents.length})</h3>
                  <p className="text-[11px] text-secondary mt-1">Нажмите на ученика для входа в профиль и контроля его оплат</p>
                </div>

                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider bg-background/20">
                        <th className="py-3.5 px-4 font-semibold">Ученик</th>
                        <th className="py-3.5 px-4 font-semibold">Родитель</th>
                        <th className="py-3.5 px-4 font-semibold">Телефон</th>
                        <th className="py-3.5 px-4 font-semibold">Первый приход</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Статус оплаты</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Событие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm">
                      {groupStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-xs text-secondary">
                            В этой группе пока нет учеников. Зарегистрируйте их на вкладке &quot;Админ&quot;.
                          </td>
                        </tr>
                      ) : (
                        groupStudents.map(s => {
                          const status = getStudentDebtStatus(s);
                          return (
                            <tr 
                              key={s.id} 
                              id={`student-row-${s.id}`}
                              className="table-row-hover cursor-pointer"
                              onClick={() => setSelectedStudentId(s.id)}
                            >
                              <td className="py-4.5 px-4 font-bold text-primary text-base">
                                <div className="flex items-center gap-2">
                                  <span>{s.full_name}</span>
                                  <ChevronRight className="w-4 h-4 text-secondary/40 group-hover:text-primary transition-colors" />
                                </div>
                              </td>
                              <td className="py-4.5 px-4 text-secondary font-medium">
                                {s.parents?.full_name || 'Не привязан'}
                              </td>
                              <td className="py-4.5 px-4 text-xs font-mono text-secondary">
                                {s.parents?.phone_number || '—'}
                              </td>
                              <td className="py-4.5 px-4 text-xs font-mono text-secondary">
                                {s.first_arrival_date || s.first_payment_date || 'Не указан'}
                              </td>
                              <td className="py-4.5 px-4 text-center">
                                {status === 'overdue' && (
                                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500/10 to-transparent text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold text-xs animate-pulse">
                                    🔴 Просрочка!
                                  </span>
                                )}
                                {status === 'good' && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold text-xs">
                                    🟢 Оплачено
                                  </span>
                                )}
                                {status === 'no_date' && (
                                  <span className="inline-flex items-center gap-1 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 px-3 py-1 rounded-full font-medium text-xs">
                                    ⚪ Нет даты прихода
                                  </span>
                                )}
                              </td>
                              <td className="py-4.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => openComplaintModal(s.id)}
                                  id={`complaint-btn-${s.id}`}
                                  className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-background text-xs font-bold py-2.5 px-4 rounded-full transition-all"
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
            ) : (
              
              // VIEW B: STUDENT PROFILE AND DETAILED PAYMENT CALENDAR (Screenshot 4 layout style)
              selectedStudent && (
                <motion.div
                  key="student-profile"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  {/* Two-Column Bento Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left Column: Student Bio */}
                    <div className="space-y-4">
                      <div className="bg-background border border-border rounded-xl p-5 space-y-4">
                        <div className="border-b border-border/50 pb-3">
                          <h3 className="text-secondary text-[10px] uppercase font-bold tracking-widest">Карточка ученика</h3>
                          <p className="text-lg font-bold text-primary mt-1">{selectedStudent.full_name}</p>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex gap-2 items-start text-secondary">
                            <Phone className="w-4 h-4 text-[#888] shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-primary">Контакты родителя</p>
                              <p className="mt-1 font-mono">{selectedStudent.parents?.full_name || 'Не указан'}</p>
                              <p className="text-[#888] font-mono mt-0.5">{selectedStudent.parents?.phone_number || '—'}</p>
                              {selectedStudent.parents?.role && (
                                <span className="inline-block mt-1.5 text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded font-medium">
                                  Роль: {selectedStudent.parents.role}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 items-start text-secondary pt-2 border-t border-border/50">
                            <Calendar className="w-4 h-4 text-[#888] shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-primary">Дата первого занятия</p>
                              <p className="mt-1 font-mono text-emerald-400 font-bold">{selectedStudent.first_arrival_date || 'Не указана'}</p>
                              <p className="text-[10px] text-[#777] leading-relaxed mt-1">Оплата отсчитывается ежемесячно со дня первого визита.</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => openComplaintModal(selectedStudent.id)}
                            className="w-full bg-accent hover:bg-accent-hover text-background font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                          >
                            <TriangleAlert className="w-4 h-4" /> Написать жалобу родителю
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Billing Timeline list (Screenshot 4 customized style) */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="bg-background border border-border rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-400" /> Контроль и График платежей (помесячно)
                          </h3>
                        </div>

                        {!selectedStudent.first_arrival_date ? (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-5 rounded-xl text-xs space-y-2">
                            <p className="font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" /> График оплат не может быть рассчитан
                            </p>
                            <p>
                              У данного ученика при регистрации не была указана <b>дата первого прихода</b>. Пожалуйста, зайдите в раздел Админ → Общий реестр и убедитесь, что дата заполнена.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {generateCycles(selectedStudent.first_arrival_date).map((cycle) => {
                              const paymentRecord = payments.find(p => p.student_id === selectedStudent.id && p.period_month === cycle.periodKey);
                              const isPaid = paymentRecord?.status === 'paid';
                              const today = new Date();
                              const isOverdue = !isPaid && today > cycle.startDate;

                              const isEditing = editingPeriodKey === cycle.periodKey;

                              return (
                                <div 
                                  key={cycle.periodKey}
                                  className={`
                                    rounded-xl p-4.5 border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
                                    ${isPaid 
                                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 hover:border-emerald-500/35' 
                                      : isOverdue 
                                        ? 'bg-red-500/[0.015] border-red-500/60 ring-1 ring-red-500/20 shadow-lg shadow-red-500/5 animate-pulse' 
                                        : 'bg-background border-border hover:border-border-hover'}
                                  `}
                                >
                                  {/* Period details & Text status */}
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-secondary font-semibold font-mono text-xs">ПЕРИОД #{cycle.index}</span>
                                      {isPaid && (
                                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold font-mono">
                                          ✓ Оплачено
                                        </span>
                                      )}
                                      {isOverdue && (
                                        <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                                          ⚠️ Просрочен
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm font-bold text-primary">
                                      План: {cycle.periodLabel}
                                    </p>
                                    
                                    {isPaid ? (
                                      <p className="text-xs text-secondary font-semibold flex items-center gap-1">
                                        💰 Взнос: <b className="text-[#eee] font-bold font-mono">{paymentRecord?.amount?.toLocaleString() || '500 000'} сум</b> {paymentRecord?.payment_date && `(${paymentRecord.payment_date})`}
                                      </p>
                                    ) : isOverdue ? (
                                      <p className="text-xs text-red-400 font-semibold tracking-tight py-1 bg-red-500/5 rounded border border-red-500/10 px-2 inline-block">
                                        ⚠️ Не оплачено. Просрочка: {(() => {
                                          const diffTime = today.getTime() - cycle.startDate.getTime();
                                          const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                                          const daysWord = diffDays % 10 === 1 && diffDays % 100 !== 11 ? 'день' : [2,3,4].includes(diffDays % 10) && ![12,13,14].includes(diffDays % 100) ? 'дня' : 'дней';
                                          return `${diffDays} ${daysWord}`;
                                        })()}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-secondary italic">
                                        Ожидает наступления цикла платежа
                                      </p>
                                    )}
                                  </div>

                                  {/* Action Buttons with edit options */}
                                  <div className="w-full sm:w-auto shrink-0 select-none">
                                    {isEditing ? (
                                      <div className="bg-surface border border-border p-3 rounded-lg space-y-3 w-full sm:w-64">
                                        <div>
                                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1 font-mono">Сумма (сум):</label>
                                          <input 
                                            type="number"
                                            value={customAmount}
                                            onChange={e => setCustomAmount(Number(e.target.value))}
                                            className="w-full bg-background border border-border text-xs rounded px-2 py-1.5 text-primary font-mono focus:outline-none focus:border-secondary"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] uppercase font-bold text-secondary mb-1 font-mono">Дата:</label>
                                          <input 
                                            type="date"
                                            value={customDate}
                                            onChange={e => setCustomDate(e.target.value)}
                                            className="w-full bg-background border border-border text-xs rounded px-2 py-1.5 text-primary font-mono focus:outline-none focus:border-secondary"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleSaveCustomPay(selectedStudent.id, cycle.periodKey)}
                                            className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-background text-[11px] font-bold py-1.5 rounded"
                                          >
                                            Записать
                                          </button>
                                          <button
                                            onClick={() => setEditingPeriodKey(null)}
                                            className="w-1/2 bg-background border border-border text-secondary text-[11px] py-1.5 rounded hover:text-primary"
                                          >
                                            Отмена
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2 justify-end">
                                        {!isPaid && (
                                          <button
                                            onClick={() => handleInstantPay(selectedStudent.id, cycle.periodKey)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-background text-xs font-bold py-2 px-4 rounded-full transition-all shadow-md shadow-emerald-500/10"
                                          >
                                            Оплатил(а)
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            setEditingPeriodKey(cycle.periodKey);
                                            setCustomAmount(paymentRecord?.amount || 500000);
                                            setCustomDate(paymentRecord?.payment_date || new Date().toISOString().split('T')[0]);
                                          }}
                                          className="border border-border bg-background hover:bg-border/40 text-secondary hover:text-primary p-2 rounded-full text-xs transition-all"
                                          title="Изменить детали оплаты"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
