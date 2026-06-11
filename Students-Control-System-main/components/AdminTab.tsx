import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'motion/react';
import { UserPlus, Users, X, Database } from 'lucide-react';

export function AdminTab() {
  const { 
    groups, parents, students, 
    addGroup, deleteGroup,
    addParent, deleteParent,
    addStudent, deleteStudent
  } = useStore();

  const [newGroupName, setNewGroupName] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedParent, setSelectedParent] = useState('');

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName);
      setNewGroupName('');
    }
  };

  const handleAddParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParentName.trim() && newParentPhone.trim()) {
      addParent(newParentName, newParentPhone);
      setNewParentName('');
      setNewParentPhone('');
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && selectedGroup && selectedParent) {
      addStudent(newStudentName, selectedGroup, selectedParent);
      setNewStudentName('');
      setSelectedGroup('');
      setSelectedParent('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD GROUP */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              Новая группа
            </h2>
            <p className="text-xs text-secondary mt-1">Добавление учебной группы</p>
          </div>
          <form onSubmit={handleAddGroup} className="space-y-4 flex-grow flex flex-col justify-between">
            <div>
              <input 
                type="text" 
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Например, IELTS Evening"
                className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary placeholder:text-secondary/40"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-medium py-3 rounded-full transition-colors"
            >
              Создать группу
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Существующие</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {groups.map(g => (
                <div key={g.id} className="flex justify-between items-center group">
                  <span className="text-xs text-primary">{g.name}</span>
                  <button onClick={() => deleteGroup(g.id)} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADD PARENT */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-secondary" />
              Новый родитель
            </h2>
            <p className="text-xs text-secondary mt-1">Регистрация контактного лица</p>
          </div>
          <form onSubmit={handleAddParent} className="space-y-4 flex-grow flex flex-col justify-between">
            <div className="space-y-3">
              <input 
                type="text" 
                value={newParentName}
                onChange={e => setNewParentName(e.target.value)}
                placeholder="ФИО (например: Иванов И.)"
                className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary placeholder:text-secondary/40"
                required
              />
              <input 
                type="text" 
                value={newParentPhone}
                onChange={e => setNewParentPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary placeholder:text-secondary/40 font-mono"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-medium py-3 rounded-full transition-colors mt-4"
            >
              Зарегистрировать
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">База контактов</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {parents.map(p => (
                <div key={p.id} className="flex justify-between items-center group">
                  <div className="flex flex-col">
                    <span className="text-xs text-primary">{p.full_name}</span>
                    <span className="text-[10px] text-secondary font-mono">{p.phone_number}</span>
                  </div>
                  <button onClick={() => deleteParent(p.id)} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADD STUDENT */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2">
              <Database className="w-4 h-4 text-secondary" />
              Привязка ученика
            </h2>
            <p className="text-xs text-secondary mt-1">Добавление студента в систему</p>
          </div>
          <form onSubmit={handleAddStudent} className="space-y-4 flex-grow flex flex-col">
            <div className="space-y-3">
              <input 
                type="text" 
                value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                placeholder="ФИО Ученика"
                className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary placeholder:text-secondary/40"
                required
              />
              <select 
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary appearance-none"
                required
              >
                <option value="" disabled>Выберите группу</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <select 
                value={selectedParent}
                onChange={e => setSelectedParent(e.target.value)}
                className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary appearance-none"
                required
              >
                <option value="" disabled>Ответственный родитель</option>
                {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div className="mt-auto pt-4">
              <button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-medium py-3 rounded-full transition-colors"
                disabled={!groups.length || !parents.length}
              >
                Добавить в базу
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* ALL STUDENTS TABLE */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold tracking-tight text-primary">Общий реестр</h2>
          <p className="text-xs text-secondary mt-1">Все привязанные студенты</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">ФИО Ученика</th>
                <th className="py-3 px-4 font-medium">Группа</th>
                <th className="py-3 px-4 font-medium">Родитель</th>
                <th className="py-3 px-4 font-medium">Телефон</th>
                <th className="py-3 px-4 text-right font-medium">Управление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {students.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-xs text-secondary">Реестр пуст.</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="table-row-hover group">
                    <td className="py-4 px-4 font-medium text-primary">{s.full_name}</td>
                    <td className="py-4 px-4 text-secondary">{s.groups?.name || <span className="text-error">Нет данных</span>}</td>
                    <td className="py-4 px-4 text-secondary">{s.parents?.full_name || <span className="text-error">Нет данных</span>}</td>
                    <td className="py-4 px-4 text-secondary font-mono text-xs">{s.parents?.phone_number || '—'}</td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => deleteStudent(s.id)} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-all p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
