import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { HelpModal } from './HelpModal';

interface ShellProps {
  title: string;
  subtitle?: string;
  icon?: string;
  active: 'dashboard' | 'daily' | 'weekly' | 'history';
  actions?: ReactNode;
  children: ReactNode;
}

export function Shell({ title, subtitle, icon = '🏆', active, actions, children }: ShellProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const navItems = [
    { key: 'dashboard', label: 'Control Panel', to: '/app', icon: '📊' },
    { key: 'daily', label: 'Daily Execution', to: '/daily', icon: '📝' },
    { key: 'weekly', label: 'Weekly Review', to: '/weekly', icon: '📅' },
    { key: 'history', label: 'History', to: '/history', icon: '📜' },
  ];

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Grid Overlay */}
      <div className="grid-overlay" aria-hidden="true"></div>
      
      <div className="flex flex-col lg:flex-row relative z-10">
        {/* Desktop Sidebar - Only shown on this page */}
        <aside className="hidden lg:block fixed top-6 left-6 w-72 fade-up-1 z-50">
          <div className="glass-strong glass-shimmer rounded-3xl p-6 border border-white/15 shadow-2xl space-y-6">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                {icon}
              </div>
              <div className="flex-1">
                <div className="font-manrope font-bold text-lg text-white">Win 2026 OS</div>
              </div>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="w-8 h-8 rounded-lg glass border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all group"
                title="วิธีใช้งาน"
              >
                <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* User Account Card */}
            <div className="glass rounded-2xl p-4 space-y-3 border border-white/10">
              <div className="text-xs text-white/50 uppercase tracking-wider">บัญชี</div>
              <div className="font-medium text-sm text-white/90 break-all">{user?.email}</div>
              <button
                onClick={handleLogout}
                className="w-full btn-danger rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              >
                ออกจากระบบ
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.to)}
                  className={clsx(
                    'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-all card-hover',
                    active === item.key
                      ? 'glass-strong border border-white/25 shadow-lg'
                      : 'glass border border-white/10 hover:bg-white/10'
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Footer Info */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs text-white/40 text-center">
                Win 2026 © 2026
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <aside className="glass-mobile lg:hidden mx-4 mt-6 fade-up-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
                {icon}
              </div>
              <div>
                <div className="font-manrope font-bold text-white">Win 2026 OS</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="w-10 h-10 rounded-xl glass border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                title="วิธีใช้งาน"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="btn-danger rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.to)}
                className={clsx(
                  'rounded-xl px-2 py-3 text-xs font-semibold text-center transition-all',
                  active === item.key
                    ? 'glass-strong border border-white/20 shadow-lg'
                    : 'glass border border-white/10 hover:bg-white/15'
                )}
              >
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-[10px] leading-tight">{item.label.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 px-4 lg:px-12 py-8 lg:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="fade-up-2">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/40 uppercase tracking-wider">
                    <span className="text-lg">{icon}</span>
                    Win 2026 Control Panel
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black font-manrope gradient-text">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-white/60 text-base lg:text-lg">{subtitle}</p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2">{actions}</div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}