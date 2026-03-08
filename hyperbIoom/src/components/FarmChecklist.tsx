import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, Clock, AlertCircle, CheckCircle2, ListFilter, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

const initialTasks = [
  { id: 1, title: 'Morning Irrigation', time: '06:00 AM', dueDate: '2026-03-06', category: 'Crops', priority: 'High', completed: true },
  { id: 2, title: 'Check Livestock Water', time: '08:00 AM', dueDate: '2026-03-06', category: 'Livestock', priority: 'High', completed: false },
  { id: 3, title: 'Fertilizer Application', time: '10:00 AM', dueDate: '2026-03-07', category: 'Crops', priority: 'Medium', completed: false },
  { id: 4, title: 'Clean Poultry House', time: '04:00 PM', dueDate: '2026-03-08', category: 'Poultry', priority: 'Medium', completed: false },
];

export default function FarmChecklist() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask = {
      id: Date.now(),
      title: formData.get('title') as string,
      time: formData.get('time') as string,
      dueDate: formData.get('dueDate') as string,
      category: formData.get('category') as string,
      priority: formData.get('priority') as string,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.category === filter);

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight">Farm Checklist</h1>
          <p className="text-earth-500 mt-1">Manage your daily tasks and ensure nothing gets overlooked.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} /> New Task
        </button>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Crops', 'Livestock', 'Poultry', 'Maintenance'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2",
              filter === t 
                ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20" 
                : "bg-white text-earth-500 border-earth-100 hover:border-primary-200 hover:bg-earth-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-earth-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-earth-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="text-primary-500" size={24} />
            <h3 className="text-xl font-bold text-earth-900">Today's Tasks</h3>
          </div>
          <div className="text-sm font-bold text-earth-400 uppercase tracking-widest">
            {tasks.filter(t => t.completed).length}/{tasks.length} Completed
          </div>
        </div>
        
        <div className="divide-y divide-earth-50">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={cn(
                "p-8 flex items-center justify-between transition-all group",
                task.completed ? "bg-earth-50/50 opacity-60" : "hover:bg-earth-50/30"
              )}
            >
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all",
                    task.completed 
                      ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20" 
                      : "border-earth-200 hover:border-primary-500"
                  )}
                >
                  {task.completed && <CheckCircle2 size={18} />}
                </button>
                <div>
                  <h4 className={cn("font-bold text-lg transition-all", task.completed ? "text-earth-400 line-through" : "text-earth-900")}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-earth-400 uppercase tracking-widest">
                      <Clock size={14} /> {task.time}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-earth-400 uppercase tracking-widest">
                        <Calendar size={14} /> {task.dueDate}
                      </span>
                    )}
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                      task.priority === 'High' ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
                    )}>
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-3 text-earth-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button className="p-3 text-earth-300 hover:text-earth-600 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTasks.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-earth-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ListFilter size={40} className="text-earth-300" />
            </div>
            <h4 className="text-xl font-bold text-earth-900 mb-2">No tasks found</h4>
            <p className="text-earth-500">Try adjusting your filters or add a new task.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-earth-800 rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-earth-200 dark:border-earth-700"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-earth-900 dark:text-white">New Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-earth-400 hover:text-earth-600 dark:hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              <form className="space-y-6" onSubmit={handleAddTask}>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input name="title" required className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white" placeholder="e.g. Water the crops" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Time</label>
                    <input name="time" type="time" required className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input name="dueDate" type="date" required className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Priority</label>
                    <select name="priority" className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Category</label>
                  <select name="category" className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white">
                    <option value="Crops">Crops</option>
                    <option value="Livestock">Livestock</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="flex gap-4 mt-10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 rounded-2xl font-bold hover:bg-earth-200 dark:hover:bg-earth-600 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Save Task</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
