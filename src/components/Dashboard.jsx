import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, CreditCard, BadgePercent, Users, ArrowUpRight, DollarSign } from 'lucide-react';
import { formatRupee } from '../utils/formatters';

export default function Dashboard({ transactions }) {
  
  // Calculate aggregate metrics
  const today = new Date().toDateString();
  
  const todayTxns = transactions.filter(t => new Date(t.timestamp).toDateString() === today);
  const todaySales = todayTxns.reduce((sum, t) => sum + (t.status === 'PAID' ? t.amount : 0), 0);
  
  const totalReceived = transactions.reduce((sum, t) => sum + (t.status === 'PAID' ? t.amount : 0), 0);
  const totalCount = transactions.filter(t => t.status === 'PAID').length;
  
  const averageTicket = totalCount > 0 ? (totalReceived / totalCount) : 0;

  // Process data for charts - Grouping by day (last 7 days)
  const getChartData = () => {
    const dataMap = {};
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    last7Days.forEach(day => {
      dataMap[day] = { name: new Date(day).toLocaleDateString('en-IN', { weekday: 'short' }), revenue: 0, transactions: 0 };
    });

    transactions.forEach(t => {
      const tDay = new Date(t.timestamp).toDateString();
      if (dataMap[tDay] && t.status === 'PAID') {
        dataMap[tDay].revenue += t.amount;
        dataMap[tDay].transactions += 1;
      }
    });

    return Object.values(dataMap);
  };

  const chartData = getChartData();
  const recentPayments = [...transactions].reverse().slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-1 animate-slide-up">
      
      {/* 4 Glowing Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today Sales */}
        <div className="glass-panel rounded-3xl p-5 border-white/5 relative overflow-hidden flex justify-between items-start">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">Today's Sales Volume</span>
            <span className="text-2xl font-extrabold text-white tracking-tight">{formatRupee(todaySales)}</span>
            <span className="text-[10px] font-bold text-indigo-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified instant settlements</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-glass-sm">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Received */}
        <div className="glass-panel rounded-3xl p-5 border-white/5 relative overflow-hidden flex justify-between items-start">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">Gross Volume Settled</span>
            <span className="text-2xl font-extrabold text-white tracking-tight">{formatRupee(totalReceived)}</span>
            <span className="text-[10px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% payout rate</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-glass-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Transactions */}
        <div className="glass-panel rounded-3xl p-5 border-white/5 relative overflow-hidden flex justify-between items-start">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">All Paid Billings</span>
            <span className="text-2xl font-extrabold text-white tracking-tight">{totalCount} bills</span>
            <span className="text-[10px] font-bold text-purple-400 mt-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Dynamic QR Checkouts</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-glass-sm">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Ticket Average */}
        <div className="glass-panel rounded-3xl p-5 border-white/5 relative overflow-hidden flex justify-between items-start">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">Average Order Value (AOV)</span>
            <span className="text-2xl font-extrabold text-white tracking-tight">{formatRupee(averageTicket)}</span>
            <span className="text-[10px] font-bold text-amber-400 mt-1 flex items-center gap-1">
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Net business performance</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-glass-sm">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Graphical Dashboards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph 1: Area Chart Revenue (Wide) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-4 shadow-glass-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-white text-base">Weekly Revenue Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Aggregated daily UPI sales settled volume</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-xl border border-indigo-500/10 flex items-center gap-1">
              LAST 7 DAYS
            </span>
          </div>

          <div className="w-full h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#F3F4F6' }}
                  labelStyle={{ fontWeight: 'bold', color: '#818CF8' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Settlements']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Bar Chart Transaction Traffic (Short) */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-4 shadow-glass-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-white text-base">Traffic Count</h3>
              <p className="text-xs text-gray-400 mt-0.5">Billing tickets processed successfully</p>
            </div>
          </div>

          <div className="w-full h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#F3F4F6' }}
                  formatter={(value) => [value, 'Sales Transactions']}
                />
                <Bar dataKey="transactions" fill="#A855F7" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#6366F1' : '#A855F7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Payments Summary Table */}
      <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-4 shadow-glass-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-white text-base">Recent Settled Billings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest transactions captured on BharatPay gateway</p>
          </div>
        </div>

        {recentPayments.length === 0 ? (
          <div className="py-10 text-center text-gray-500 font-medium">
            No payments captured yet on this terminal lock.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold text-[10px] tracking-wider uppercase">
                  <th className="py-3.5 px-3">TRANSACTION ID</th>
                  <th className="py-3.5 px-3">CUSTOMER NAME</th>
                  <th className="py-3.5 px-3">DATE / TIME</th>
                  <th className="py-3.5 px-3">SETTLED AMOUNT</th>
                  <th className="py-3.5 px-3 text-right">GATEWAY STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 font-medium">
                {recentPayments.map((t) => (
                  <tr key={t.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-gray-300">{t.id}</td>
                    <td className="py-3.5 px-3 text-white font-semibold">{t.customerName}</td>
                    <td className="py-3.5 px-3 text-gray-400">
                      {new Date(t.timestamp).toLocaleDateString('en-IN')} | {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white">{formatRupee(t.amount)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="status-paid inline-flex ml-auto">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
