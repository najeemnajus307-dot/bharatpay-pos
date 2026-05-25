import React from 'react';
import { LayoutDashboard, Calculator, History, Settings, LogOut, Shield, Menu, X, ArrowLeftRight } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, settings, collapsed, setCollapsed }) {
  const shopName = settings?.shopName || 'BharatPay POS';

  const menuItems = [
    { id: 'POS', label: 'POS key calculation', icon: Calculator },
    { id: 'DASHBOARD', label: 'Store overview', icon: LayoutDashboard },
    { id: 'HISTORY', label: 'Payment logs', icon: History },
    { id: 'SETTINGS', label: 'Terminal settings', icon: Settings },
  ];

  return (
    <>
      {/* 1. Desktop / Tablet Sidebar Left Navigation */}
      <aside className={`hidden md:flex flex-col h-screen glass-panel border-r border-white/5 transition-all duration-300 relative z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* Brand Banner */}
        <div className={`p-6 border-b border-white/5 flex items-center justify-between ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow-indigo flex-shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h2 className="font-extrabold text-white text-sm tracking-tight leading-none">{shopName}</h2>
                <span className="text-[10px] text-indigo-400 font-bold tracking-wider">TERMINAL ACTIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-semibold text-xs active:scale-[0.98] ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/5 border border-indigo-500/30 text-white shadow-glass-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/3 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Locks */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <button
            onClick={onLogout}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-semibold text-xs active:scale-95 ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Lock Terminal"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="animate-fade-in">Lock Terminal</span>}
          </button>
          
          {!collapsed && (
            <div className="flex items-center gap-1.5 justify-center mt-2 opacity-30 text-[9px] font-bold tracking-widest text-gray-500">
              <Shield className="w-3 h-3" />
              <span>SECURED SYSTEM</span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Arrow Flipper */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-600 border border-indigo-400/30 text-white flex items-center justify-center cursor-pointer active:scale-90 shadow-md shadow-indigo-600/20"
        >
          <span className="text-[10px] font-bold">{collapsed ? '→' : '←'}</span>
        </button>

      </aside>

      {/* 2. Mobile Bottom sticky navigation overlay (Phone Screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090D16]/90 backdrop-blur-lg border-t border-white/5 z-40 px-6 flex items-center justify-between">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all w-12 ${
                isActive ? 'text-indigo-400 font-bold scale-105' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] tracking-tight truncate max-w-[50px]">
                {item.id === 'POS' ? 'POS' : item.id.charAt(0) + item.id.slice(1).toLowerCase()}
              </span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-rose-400 w-12"
          title="Lock Screen"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] tracking-tight">Lock</span>
        </button>
      </nav>
    </>
  );
}
