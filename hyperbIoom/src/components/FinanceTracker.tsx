import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  Target
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

const transactions = [
  { id: 1, type: 'income', category: 'Crop Sale', amount: 45000, date: '2026-02-20', note: 'Maize harvest sale' },
  { id: 2, type: 'expense', category: 'Seeds', amount: 12000, date: '2026-02-18', note: 'Certified maize seeds' },
  { id: 3, type: 'expense', category: 'Fertilizer', amount: 8500, date: '2026-02-15', note: 'DAP fertilizer' },
  { id: 4, type: 'income', category: 'Milk Sale', amount: 3200, date: '2026-02-24', note: 'Daily milk collection' },
  { id: 5, type: 'income', category: 'Vegetable Sale', amount: 15000, date: '2026-02-26', note: 'Local market supply' },
  { id: 6, type: 'expense', category: 'Labor', amount: 5000, date: '2026-02-27', note: 'Weeding labor' },
];

const historicalData = [
  { month: 'Sep', income: 35000, expense: 20000, profit: 15000 },
  { month: 'Oct', income: 42000, expense: 25000, profit: 17000 },
  { month: 'Nov', income: 38000, expense: 22000, profit: 16000 },
  { month: 'Dec', income: 55000, expense: 30000, profit: 25000 },
  { month: 'Jan', income: 48000, expense: 28000, profit: 20000 },
  { month: 'Feb', income: 63200, expense: 25500, profit: 37700 },
  { month: 'Mar (Proj)', income: 68000, expense: 26000, profit: 42000 },
];

const incomeSources = [
  { name: 'Maize', value: 45000 },
  { name: 'Milk', value: 15000 },
  { name: 'Vegetables', value: 12000 },
  { name: 'Poultry', value: 8000 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function FinanceTracker() {
  const [activeTab, setActiveTab] = useState('overview');
  const [allTransactions, setAllTransactions] = useState(transactions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTransaction = {
      id: Date.now(),
      type: formData.get('type') as 'income' | 'expense',
      category: formData.get('category') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      note: formData.get('note') as string,
    };
    setAllTransactions([newTransaction, ...allTransactions]);
    setIsModalOpen(false);
  };

  // Projection logic: Average profit growth over last 3 months
  const actualData = historicalData.filter(d => !d.month.includes('Proj'));
  const last3Months = actualData.slice(-3);
  const avgProfitGrowth = (last3Months[2].profit - last3Months[0].profit) / 2;
  const projectedProfit = last3Months[2].profit + avgProfitGrowth;

  const expenseData = [
    { name: 'Seeds', value: 12000 },
    { name: 'Fertilizer', value: 8500 },
    { name: 'Labor', value: 5000 },
    { name: 'Transport', value: 3000 },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-earth-900 dark:text-white tracking-tight">Finance Tracker</h1>
          <p className="text-earth-500 dark:text-earth-400 mt-1">Monitor your farm's income, expenses, and overall profitability.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
          >
            <Plus size={18} /> Add Transaction
          </button>
          <button className="p-3 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-2xl text-earth-500 hover:text-primary-500 transition-all shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Total Balance</span>
          </div>
          <h3 className="text-4xl font-black text-earth-900 dark:text-white">KSh {balance.toLocaleString()}</h3>
          <p className="text-xs text-earth-400 mt-4 flex items-center gap-2 font-medium">
            <TrendingUp size={14} className="text-primary-500" /> +12% from last month
          </p>
        </div>
        <div className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Total Income</span>
          </div>
          <h3 className="text-4xl font-black text-green-600 dark:text-green-400">KSh {totalIncome.toLocaleString()}</h3>
          <p className="text-xs text-earth-400 mt-4 flex items-center gap-2 font-medium">
            This month's earnings
          </p>
        </div>
        <div className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Total Expenses</span>
          </div>
          <h3 className="text-4xl font-black text-red-600 dark:text-red-400">KSh {totalExpense.toLocaleString()}</h3>
          <p className="text-xs text-earth-400 mt-4 flex items-center gap-2 font-medium">
            This month's spending
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart */}
        <section className="bg-white dark:bg-earth-800 p-8 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <LineChartIcon size={20} />
              </div>
              <h3 className="text-xl font-black text-earth-900 dark:text-white">Sales & Profit Trend</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-earth-50 dark:bg-earth-700 text-earth-600 dark:text-earth-300 rounded-lg text-[10px] font-black uppercase tracking-widest">6 Months</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                  tickFormatter={(value) => `KSh ${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Distribution & Projections */}
        <div className="space-y-8">
          {/* Distribution Pie Chart */}
          <section className="bg-white dark:bg-earth-800 p-8 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                <PieChartIcon size={20} />
              </div>
              <h3 className="text-xl font-black text-earth-900 dark:text-white">Income Distribution</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={incomeSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {incomeSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 flex-1 ml-8">
                {incomeSources.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-sm font-bold text-earth-600 dark:text-earth-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-earth-900 dark:text-white">
                      KSh {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Profit Projection */}
          <section className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Target size={20} />
                </div>
                <h3 className="text-xl font-black">Profit Projection</h3>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Expected Next Month</p>
                  <h4 className="text-4xl font-black">KSh {Math.round(projectedProfit).toLocaleString()}</h4>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                    <TrendingUp size={12} /> +{Math.round((projectedProfit / last3Months[2].profit - 1) * 100)}%
                  </div>
                </div>
              </div>
              <p className="text-xs mt-6 opacity-80 font-medium leading-relaxed">
                Based on your current 3-month growth trend of <span className="font-bold">KSh {Math.round(avgProfitGrowth).toLocaleString()}/month</span>.
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </section>
        </div>
      </div>

      {/* Transactions List */}
      <section className="bg-white dark:bg-earth-800 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-earth-100 dark:border-earth-700 flex items-center justify-between">
          <h3 className="text-xl font-black text-earth-900 dark:text-white">Recent Transactions</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-earth-50 dark:bg-earth-700 text-earth-600 dark:text-earth-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-earth-100 transition-all">All</button>
            <button className="px-4 py-2 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-500 rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary-500 transition-all">Income</button>
            <button className="px-4 py-2 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-500 rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary-500 transition-all">Expenses</button>
          </div>
        </div>
        <div className="divide-y divide-earth-50 dark:divide-earth-700">
          {allTransactions.map((t) => (
            <div key={t.id} className="p-8 flex items-center justify-between hover:bg-earth-50/50 dark:hover:bg-earth-700/50 transition-all group">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  t.type === 'income' ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                )}>
                  {t.type === 'income' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-earth-900 dark:text-white">{t.category}</h4>
                  <p className="text-xs text-earth-400 dark:text-earth-500 font-medium mt-1">{t.note} • {t.date}</p>
                </div>
              </div>
              <div className={cn(
                "text-xl font-black",
                t.type === 'income' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-earth-50 dark:bg-earth-700/50 text-center">
          <button className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:text-primary-700 transition-colors">View All Transactions</button>
        </div>
      </section>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-earth-800 rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-earth-200 dark:border-earth-700"
            >
              <h2 className="text-3xl font-black text-earth-900 dark:text-white mb-8">New Transaction</h2>
              <form className="space-y-6" onSubmit={handleAddTransaction}>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Type</label>
                  <select name="type" className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Category</label>
                  <input name="category" required className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white" placeholder="e.g. Crop Sale" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Amount (KSh)</label>
                    <input name="amount" type="number" required className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Date</label>
                    <input name="date" type="date" required className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-earth-400 uppercase tracking-widest ml-1">Note</label>
                  <input name="note" className="w-full p-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-earth-900 dark:text-white" placeholder="Optional details" />
                </div>
                <div className="flex gap-4 mt-10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 rounded-2xl font-bold hover:bg-earth-200 dark:hover:bg-earth-600 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
