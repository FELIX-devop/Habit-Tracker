import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import TaskPage from './pages/TaskPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuthPage from './pages/AuthPage';
import CalendarPage from './pages/CalendarPage';
import DateHabitsPage from './pages/DateHabitsPage';
import TemplatesPage from './pages/TemplatesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import FaqPage from './pages/FaqPage';
import { LayoutList, BarChart3, LogOut, Calendar, Layers, Sun, Moon, User as UserIcon, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './api/api';

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 group text-sm font-bold tracking-tight",
          isActive
            ? "bg-[var(--color-habit-accent)] text-white shadow-lg shadow-indigo-500/20"
            : "text-[var(--color-habit-muted)] hover:text-[var(--color-habit-text)] hover:bg-[var(--surface-muted)]"
        )
      }
    >
      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  );
}

function UserDropdown({ user, logout, theme, toggleTheme }: { user: string | null; logout: () => void; theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<{ name?: string, profilePicture?: string, username?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    if (user) fetchProfile();

    const handleUpdate = () => fetchProfile();
    window.addEventListener('profileUpdate', handleUpdate);
    return () => window.removeEventListener('profileUpdate', handleUpdate);
  }, [user]);

  const initial = profile?.name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || user?.charAt(0).toUpperCase() || '?';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-2xl hover:bg-[var(--surface-muted)] transition-all duration-300 group"
      >
        <div className="w-9 h-9 rounded-xl bg-indigo-600 overflow-hidden flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          {profile?.profilePicture ? (
            <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <ChevronDown className={clsx("w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-64 glass rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 p-2">
          <div className="px-4 py-3 border-b border-[var(--border)] mb-1">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Session Active</p>
            <p className="text-sm font-black text-[var(--text-primary)] truncate">{profile?.name || profile?.username || user}</p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { navigate('/profile'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-sm font-bold"
            >
              <UserIcon className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={() => { navigate('/settings'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-sm font-bold"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button
              onClick={() => { navigate('/faq'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-sm font-bold"
            >
              <HelpCircle className="w-4 h-4" /> FAQ
            </button>
          </div>

          <div className="h-px bg-[var(--border)] my-2" />

          <button
            onClick={() => { toggleTheme(); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-sm font-bold"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>Theme</span>
            </div>
            <div className="w-8 h-4 bg-[var(--border)] rounded-full relative">
              <div className={clsx(
                "absolute top-1 w-2 h-2 rounded-full transition-all duration-300",
                theme === 'dark' ? "right-1 bg-indigo-500" : "left-1 bg-neutral-400"
              )} />
            </div>
          </button>

          <div className="h-px bg-[var(--border)] my-2" />

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-500 transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

function Layout() {
  const { logout, user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeEvent = () => {
      const saved = localStorage.getItem('theme');
      if (saved) setTheme(saved as 'light' | 'dark');
    };
    window.addEventListener('themeChange', handleThemeEvent);
    return () => window.removeEventListener('themeChange', handleThemeEvent);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] selection:bg-indigo-500/30">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="HabitFlow Icon"
              className="h-10 w-auto object-contain dark:mix-blend-screen light:mix-blend-multiply dark:brightness-125 light:invert light:contrast-125 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="flex items-center text-2xl font-black tracking-tighter">
              <span className="text-[var(--text-primary)] transition-colors duration-300">Habit</span>
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">Flow</span>
            </div>
          </NavLink>
        </div>

        <nav className="flex items-center gap-1 bg-[var(--surface-muted)] p-1.5 rounded-2xl border border-[var(--border)]">
          <NavItem to="/calendar" icon={Calendar} label="Calendar" />
          <NavItem to="/templates" icon={Layers} label="Templates" />
          <NavItem to="/tasks" icon={LayoutList} label="Tasks" />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics" />
        </nav>

        <div className="flex items-center">
          <UserDropdown user={user} logout={logout} theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>
      <main className="flex-1 overflow-auto relative custom-scrollbar">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)] gap-4">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest">Initializing</span>
    </div>
  );

  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/habits/:date" element={<DateHabitsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/tasks" element={<TaskPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/faq" element={<FaqPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
