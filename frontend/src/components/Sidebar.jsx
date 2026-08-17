import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import {
  FileText, Mic, BarChart2, Home, ChevronLeft, Brain,
  ChevronRight, LogOut, Sun, Moon, Briefcase, User, Cpu
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import AppLogo from './AppLogo'

const NAV_ITEMS = [
  { to: '/dashboard',           icon: Home,      label: 'Dashboard',       badge: null },
  { to: '/dashboard/resume',    icon: FileText,  label: 'Resume Analysis', badge: null },
  { to: '/dashboard/interview', icon: Briefcase, label: 'Interview',       badge: 'AI' },
  { to: '/dashboard/coach',     icon: Mic,       label: 'Coach',           badge: 'New' },
  { to: '/dashboard/quiz',      icon: Brain,     label: 'Quiz Practice',   badge: null },
  { to: '/dashboard/system-design', icon: Cpu,   label: 'System Design',   badge: 'New' },
  { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics',       badge: null },
  { to: '/dashboard/profile',   icon: User,      label: 'Profile',         badge: null },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { darkMode, toggleDark } = useApp()

  return (
    <motion.aside
      className={clsx(
        'relative flex flex-col h-full glass-panel select-none',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
      initial={false}
      animate={{ width: collapsed ? 68 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-white/5',
        collapsed && 'justify-center px-0'
      )}>
        <AppLogo size={38} showText={!collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => clsx(
              'sidebar-link group',
              isActive && 'active',
              collapsed ? 'justify-center px-0' : ''
            )}
            title={label}
          >
            <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />

            {!collapsed && (
              <span className="flex-1 text-xs font-semibold tracking-wide truncate">{label}</span>
            )}

            {!collapsed && badge && (
              <span className={clsx(
                'px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider',
                badge === '3D' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
                badge === 'AI' && 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
                badge === 'New' && 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
              )}>
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Controls */}
      <div className="p-3 border-t border-gray-100 dark:border-white/5 space-y-1">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium',
            'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5',
            'transition-colors duration-150',
            collapsed && 'justify-center px-0'
          )}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
          )}
          {!collapsed && (
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium',
            'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-150',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
