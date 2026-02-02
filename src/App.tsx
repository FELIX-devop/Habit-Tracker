import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import TaskPage from './pages/TaskPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuthPage from './pages/AuthPage';
import { LayoutList, BarChart3, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { AuthProvider, useAuth } from './context/AuthContext';

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium",
          isActive
            ? "bg-neutral-800 text-white shadow-sm"
            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
        )
      }
    >
      <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
      <span>{label}</span>
    </NavLink>
  );
}

function Layout() {
  const { logout, user } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-habit-bg)] text-[var(--color-habit-text)] selection:bg-blue-500/30">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-habit-border)] bg-[var(--color-habit-bg)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20" />
          <span className="font-semibold tracking-tight text-white">HabitFlow</span>
        </div>
        <nav className="flex items-center gap-1 bg-neutral-900/50 p-1 rounded-lg border border-neutral-800">
          <NavItem to="/" icon={LayoutList} label="Tasks" />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics" />
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500 hidden sm:inline">{user}</span>
          <button onClick={logout} className="text-neutral-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center text-neutral-500">Loading...</div>;

  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TaskPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
