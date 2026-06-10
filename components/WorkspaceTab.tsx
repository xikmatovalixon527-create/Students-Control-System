import React from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'motion/react';
import { ChevronRight, TriangleAlert } from 'lucide-react';

export function WorkspaceTab() {
  const { 
    groups, students, 
    selectedGroupId, setSelectedGroupId,
    openComplaintModal 
  } = useStore();

  const groupStudents = students.filter(s => s.group_id === selectedGroupId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold tracking-tight text-primary uppercase tracking-widest text-[#888]">
            Учебные Группы
          </h2>
          <p className="text-xs text-secondary mt-1">Выберите группу для работы</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.length === 0 ? (
            <p className="text-xs text-secondary col-span-full">Нет активных групп.</p>
          ) : (
            groups.map(g => (
              <button 
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className={`
                  text-left rounded-xl p-5 border transition-all flex justify-between items-center group
                  ${selectedGroupId === g.id 
                    ? 'bg-background border-primary/50 text-accent ring-1 ring-primary/20' 
                    : 'bg-background border-border hover:border-border-hover text-primary'}
                `}
              >
                <span className="text-sm font-medium tracking-wide">{g.name}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedGroupId === g.id ? 'text-primary translate-x-1' : 'text-secondary group-hover:text-primary group-hover:translate-x-1'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {selectedGroupId && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border rounded-xl p-6"
        >
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-medium tracking-tight text-primary">
                {groups.find(g => g.id === selectedGroupId)?.name}
              </h2>
              <p className="text-xs text-secondary mt-1">Управление составом студентов</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Студент</th>
                  <th className="py-3 px-4 font-medium">Родитель</th>
                  <th className="py-3 px-4 font-medium">Телефон</th>
                  <th className="py-3 px-4 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {groupStudents.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-xs text-secondary">В группе пока нет учеников.</td></tr>
                ) : (
                  groupStudents.map(s => (
                    <tr key={s.id} className="table-row-hover">
                      <td className="py-4 px-4 font-medium text-primary">{s.full_name}</td>
                      <td className="py-4 px-4 text-secondary">{s.parents?.full_name || '—'}</td>
                      <td className="py-4 px-4 text-secondary font-mono text-xs">{s.parents?.phone_number || '—'}</td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => openComplaintModal(s.id)}
                          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-background text-xs font-semibold py-2 px-4 rounded-full transition-colors focus:ring-2 ring-primary/20"
                        >
                          <TriangleAlert className="w-3.5 h-3.5" /> <span>Жалоба</span>
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
    </motion.div>
  );
}
