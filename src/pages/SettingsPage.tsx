import { useState, useEffect } from 'react';
import { Shield, Trash2, Sun, Moon, Database, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import clsx from 'clsx';

export default function SettingsPage() {
    const { logout, user } = useAuth();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as 'light' | 'dark') || 'dark';
    });

    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isClearingData, setIsClearingData] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.remove('light');
        }
        localStorage.setItem('theme', theme);
        // Dispatch event if changed here, but avoid infinite loop
    }, [theme]);

    useEffect(() => {
        const handleThemeEvent = () => {
            const saved = localStorage.getItem('theme');
            if (saved && saved !== theme) setTheme(saved as 'light' | 'dark');
        };
        window.addEventListener('themeChange', handleThemeEvent);
        return () => window.removeEventListener('themeChange', handleThemeEvent);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new Event('themeChange'));
    };

    const handleDeleteAccount = async () => {
        // Extract username from email or use actual username if available
        const profileRes = await api.get('/users/me');
        const username = profileRes.data.username || user?.split('@')[0];

        if (deleteConfirm !== username) {
            setMessage({ type: 'error', text: `Please type "${username}" to confirm.` });
            return;
        }

        if (!confirm("Are you SURE? This action is permanent and will delete everything.")) return;

        setIsDeleting(true);
        try {
            await api.delete('/users/me');
            logout();
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to delete account.' });
            setIsDeleting(false);
        }
    };

    const handleClearData = async () => {
        if (!confirm("Delete all habits, templates, and logs? Your account will remain active.")) return;

        setIsClearingData(true);
        try {
            await api.delete('/users/me/data');
            setMessage({ type: 'success', text: 'All habit data cleared.' });
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to clear data.' });
        } finally {
            setIsClearingData(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 custom-scrollbar pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
                <p className="text-[var(--text-secondary)]">Preferences and account management.</p>
            </div>

            <div className="space-y-6">
                {/* Account Section */}
                <section className="premium-card overflow-hidden">
                    <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-muted)]">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <h2 className="font-bold text-[var(--text-primary)]">Account</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Email Address</label>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{user}</p>
                        </div>

                        <div className="pt-6 border-t border-[var(--border)]">
                            <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4" /> Danger Zone
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] mb-4 font-medium">Permanently delete your account and all associated data. This action cannot be undone.</p>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <input
                                    type="text"
                                    value={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.value)}
                                    placeholder="Type your username to confirm"
                                    className="flex-1 max-w-sm bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl py-2 px-4 text-sm font-bold text-[var(--text-primary)] focus:border-rose-500 outline-none transition-all"
                                />
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="premium-card overflow-hidden">
                    <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-muted)]">
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                            <h2 className="font-bold text-[var(--text-primary)]">Appearance</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Theme Mode</h3>
                                <p className="text-xs text-[var(--text-secondary)] font-medium">Switch between light and dark themes.</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="relative w-14 h-8 bg-[var(--surface-muted)] rounded-full p-1 transition-all border border-[var(--border)]"
                            >
                                <div className={clsx(
                                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                                    theme === 'dark' ? "translate-x-6 bg-indigo-600" : "translate-x-0 bg-white"
                                )}>
                                    {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Data Section */}
                <section className="premium-card overflow-hidden">
                    <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-muted)]">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-emerald-500" />
                            <h2 className="font-bold text-[var(--text-primary)]">Data & Personalization</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Clear All Progress</h3>
                                <p className="text-xs text-[var(--text-secondary)] font-medium">Delete all habits, templates, and history logs. Your account settings will be preserved.</p>
                            </div>
                            <button
                                onClick={handleClearData}
                                disabled={isClearingData}
                                className="px-6 py-2 bg-[var(--surface-muted)] hover:bg-rose-500/10 text-rose-500 rounded-xl text-sm font-bold transition-all border border-[var(--border)] hover:border-rose-500/50 flex items-center gap-2"
                            >
                                {isClearingData && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Trash2 className="w-4 h-4" />
                                Clear Data
                            </button>
                        </div>
                    </div>
                </section>

                {message.text && (
                    <div className={clsx(
                        "p-4 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2",
                        message.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    )}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
