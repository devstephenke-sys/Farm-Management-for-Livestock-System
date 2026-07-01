'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  ListFilter, 
  HeartPulse, 
  CalendarDays, 
  TrendingUp, 
  BarChart3,
  UserSquare2, 
  FileText, 
  CreditCard, 
  GraduationCap, 
  LogOut, 
  Users, 
  UserCheck,
  ChevronRight,
  Coins,
  Package,
  Clock,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'ADMIN' | 'FARMER' | 'VET';
}

export default function Sidebar({ activeTab, setActiveTab, role }: SidebarProps) {
  const { user, logout, activePlan } = useAuth();

  const getFarmerItems = () => [
    { id: 'dashboard', name: 'Overview', icon: LayoutDashboard, group: 'Main' },
    { id: 'analytics', name: 'Farm Analytics', icon: BarChart3, group: 'Main' },
    { id: 'herd', name: 'Herd Directory', icon: ListFilter, group: 'Livestock' },
    { id: 'health', name: 'Health Log', icon: HeartPulse, group: 'Livestock' },
    { id: 'breeding', name: 'Breeding & Lineage', icon: CalendarDays, group: 'Livestock' },
    { id: 'production', name: 'Production Log', icon: TrendingUp, group: 'Livestock' },
    { id: 'financials', name: 'Financial Ledger', icon: Coins, group: 'Finance & Ops' },
    { id: 'inventory', name: 'Inventory & Stock', icon: Package, group: 'Finance & Ops' },
    { id: 'scheduler', name: 'Deworming & Vaccines', icon: Clock, group: 'Finance & Ops' },
    { id: 'workers', name: 'Worker Directory', icon: Users, group: 'Finance & Ops' },
    { id: 'vet', name: 'Book Veterinarian', icon: UserSquare2, group: 'Services' },
    { id: 'reports', name: 'Reports & Export', icon: FileText, group: 'Services' },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard, group: 'Account' },
    { id: 'learning', name: 'Learning Center', icon: GraduationCap, group: 'Account' },
    { id: 'settings', name: 'Profile & Settings', icon: Settings, group: 'Account' },
  ];

  const getVetItems = () => [
    { id: 'vet-dashboard', name: 'My Appointments', icon: CalendarDays, group: 'Main' },
    { id: 'learning', name: 'Learning Center', icon: GraduationCap, group: 'Main' },
  ];

  const getAdminItems = () => [
    { id: 'admin-dashboard', name: 'Analytics', icon: LayoutDashboard, group: 'Main' },
    { id: 'admin-vets', name: 'Approve Vets', icon: UserCheck, group: 'Management' },
    { id: 'admin-users', name: 'Manage Users', icon: Users, group: 'Management' },
    { id: 'admin-resources', name: 'Upload Resources', icon: GraduationCap, group: 'Management' },
  ];

  const menuItems = role === 'ADMIN' 
    ? getAdminItems() 
    : role === 'VET' 
      ? getVetItems() 
      : getFarmerItems();

  // Group items for visual separation
  const groups = [...new Set(menuItems.map(i => i.group))];

  const getPlanBadgeStyle = () => {
    switch (activePlan) {
      case 'PREMIUM': return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
      case 'STANDARD': return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
      default: return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  const getRoleBadgeStyle = () => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-400/20 text-rose-300 border-rose-400/30';
      case 'VET': return 'bg-teal-400/20 text-teal-300 border-teal-400/30';
      default: return getPlanBadgeStyle();
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMIN': return 'ADMINISTRATOR';
      case 'VET': return 'VETERINARIAN';
      default: return activePlan;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-64 bg-[#152e23] text-white flex flex-col min-h-screen shadow-2xl no-print shrink-0 border-r border-white/5">
      
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shrink-0">
          <span className="text-xl">🚜</span>
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">FarmFMS</h1>
          <span className="text-[10px] text-accent/80 font-semibold uppercase tracking-widest">Smart Agriculture</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-4">
        <div className="bg-white/6 rounded-2xl p-4 border border-white/8 flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/60 to-[#2d6a4f] flex items-center justify-center font-black text-white text-sm shrink-0 shadow-md">
            {getInitials(user?.name)}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-bold text-sm text-white truncate leading-tight">{user?.name || 'User'}</h4>
            <p className="text-[10px] text-white/45 truncate">{user?.email}</p>
            <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-wider ${getRoleBadgeStyle()}`}>
              {getRoleLabel()}
            </span>
          </div>
        </div>

        {/* Farm name for farmers */}
        {role === 'FARMER' && user?.farm && (
          <div className="mt-2.5 px-3 py-2 bg-accent/8 border border-accent/12 rounded-xl">
            <p className="text-[9px] text-accent/70 font-bold uppercase tracking-wider">Current Farm</p>
            <p className="text-[11px] text-white/80 font-semibold truncate mt-0.5">{user.farm.name}</p>
            <p className="text-[9px] text-white/35 mt-0.5">{user.farm.county} County</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-3 space-y-1 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={group} className={gi > 0 ? 'pt-3' : ''}>
            {groups.length > 1 && (
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/25 px-3 pb-1.5">
                {group}
              </p>
            )}
            {menuItems
              .filter(item => item.group === group)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                      isActive 
                        ? 'bg-accent text-primary shadow-lg shadow-accent/20' 
                        : 'text-white/55 hover:bg-white/8 hover:text-white/90'
                    }`}
                  >
                    {/* Active left indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white/50 rounded-r-full" />
                    )}
                    <Icon 
                      size={16} 
                      className={`shrink-0 transition-colors ${isActive ? 'text-primary/80' : 'text-white/35 group-hover:text-white/70'}`} 
                    />
                    <span className="flex-1 text-left">{item.name}</span>
                    {isActive && (
                      <ChevronRight size={12} className="text-primary/40 shrink-0" />
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Footer - Sign Out */}
      <div className="p-3 border-t border-white/8">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white/45 hover:text-rose-300 hover:bg-rose-900/25 border border-transparent hover:border-rose-900/20 text-sm font-bold transition-all duration-150 cursor-pointer"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
        <p className="text-center text-[9px] text-white/20 mt-2">© 2025 FarmFMS Systems</p>
      </div>
    </aside>
  );
}
