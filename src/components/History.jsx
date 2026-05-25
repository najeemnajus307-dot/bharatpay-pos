import React, { useState } from 'react';
import { Search, Calendar, Trash2, Printer, Download, Filter, FileSpreadsheet, FileDown, Trash } from 'lucide-react';
import { formatRupee, formatBillDate, formatBillTime } from '../utils/formatters';
import { generateThermalReceipt } from '../utils/receiptGenerator';

export default function History({ transactions, onDeleteTransaction, settings }) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Search & Filter Logic
  const filteredTransactions = transactions.filter(t => {
    // Search filter
    const matchesSearch = 
      t.id.toLowerCase().includes(search.toLowerCase()) || 
      (t.customerName && t.customerName.toLowerCase().includes(search.toLowerCase()));

    // Date filter
    let matchesDate = true;
    if (startDate || endDate) {
      const tDate = new Date(t.timestamp);
      tDate.setHours(0, 0, 0, 0); // Reset hours for accurate date matches
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (tDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0,0,0,0);
        if (tDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  }).reverse(); // Latest first

  const handlePrint = (txn) => {
    generateThermalReceipt(txn, settings, true);
  };

  const handleDownload = (txn) => {
    generateThermalReceipt(txn, settings, false);
  };

  const handleDeleteTrigger = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (id) => {
    onDeleteTransaction(id);
    setDeleteConfirmId(null);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-1 animate-slide-up">
      
      {/* Search and Filters panel */}
      <div className="glass-panel rounded-3xl p-5 border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-glass-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or customer..."
            className="w-full glass-input pl-10 pr-4 text-xs font-semibold"
            style={{ height: '40px' }}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input pl-10 pr-3 text-xs w-full text-gray-300 font-semibold"
              style={{ height: '40px' }}
            />
            <Calendar className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          <span className="text-gray-500 font-bold text-xs">to</span>

          <div className="relative flex-1 md:flex-initial">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input pl-10 pr-3 text-xs w-full text-gray-300 font-semibold"
              style={{ height: '40px' }}
            />
            <Calendar className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(search || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="px-3.5 rounded-xl border border-white/5 bg-white/3 hover:bg-white/7 text-gray-300 text-xs font-bold transition-all"
              style={{ height: '40px' }}
            >
              Reset
            </button>
          )}
        </div>

      </div>

      {/* Main Datagrid Panel */}
      <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-4 shadow-glass-sm overflow-hidden">
        
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-white text-base">Transaction Archive</h3>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {filteredTransactions.length} Settled Record{filteredTransactions.length !== 1 && 's'}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-2">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-gray-400 font-bold text-sm">No transaction records found</p>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs">Adjust your fuzzy search inputs, date calendars, or enter new calculator payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold text-[10px] tracking-wider uppercase">
                  <th className="py-3.5 px-3">REF ID</th>
                  <th className="py-3.5 px-3">CUSTOMER NAME</th>
                  <th className="py-3.5 px-3">BILLING DATE</th>
                  <th className="py-3.5 px-3">BILLING TIME</th>
                  <th className="py-3.5 px-3">AMOUNT</th>
                  <th className="py-3.5 px-3">STATUS</th>
                  <th className="py-3.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 font-medium">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/2 transition-colors group">
                    <td className="py-4 px-3 font-mono text-gray-300">{t.id}</td>
                    <td className="py-4 px-3 text-white font-semibold">{t.customerName}</td>
                    <td className="py-4 px-3 text-gray-400">{formatBillDate(t.timestamp)}</td>
                    <td className="py-4 px-3 text-gray-400">{formatBillTime(t.timestamp)}</td>
                    <td className="py-4 px-3 font-bold text-white">{formatRupee(t.amount)}</td>
                    <td className="py-4 px-3">
                      <span className="status-paid inline-flex">
                        PAID
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {deleteConfirmId === t.id ? (
                        <div className="inline-flex items-center gap-1.5 animate-scale-in">
                          <span className="text-[10px] text-rose-400 font-extrabold mr-1">CONFIRM?</span>
                          <button
                            onClick={() => handleDeleteConfirm(t.id)}
                            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all"
                            title="Yes, delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 flex items-center justify-center transition-all"
                            title="Cancel"
                          >
                            Reset
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePrint(t)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 hover:text-white flex items-center justify-center transition-all"
                            title="Print invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(t)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 hover:text-white flex items-center justify-center transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrigger(t.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-rose-600/10 text-gray-500 hover:text-rose-400 flex items-center justify-center transition-all"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
