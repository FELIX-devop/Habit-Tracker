import { useState, useEffect } from 'react';
import { Camera, Mail, User as UserIcon, Calendar, TrendingUp, Target, Save, Loader2 } from 'lucide-react';
import api from '../api/api';
import clsx from 'clsx';

interface UserProfile {
    email: string;
    username: string;
    name: string;
    age: string;
    height: string;
    weight: string;
    profilePicture: string;
}

interface AnalyticsSummary {
    currentStreak: number;
    consistency: number;
    totalHabits: number;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, analyticsRes] = await Promise.all([
                api.get<UserProfile>('/users/me'),
                api.get<any>('/analytics')
            ]);
            setProfile(userRes.data);
            setAnalytics({
                currentStreak: analyticsRes.data.currentStreak,
                consistency: analyticsRes.data.consistency,
                totalHabits: analyticsRes.data.habitStats?.length || 0
            });
        } catch (e) {
            console.error("Failed to fetch profile data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/users/me', profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Update initial in header by refreshing or event
            window.dispatchEvent(new Event('profileUpdate'));
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => prev ? { ...prev, profilePicture: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    if (!profile) return <div className="h-full flex items-center justify-center">Profile not found.</div>;

    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 custom-scrollbar pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Profile</h1>
                <p className="text-[var(--text-secondary)]">Manage your personal information and view your progress.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Sidebar */}
                <div className="space-y-6">
                    <div className="premium-card p-6 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-500/20 mb-4 border-4 border-[var(--border)]">
                                {profile.profilePicture ? (
                                    <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()
                                )}
                            </div>
                            <label className="absolute bottom-2 right-2 p-2 bg-[var(--accent)] text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                <Camera className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">{profile.name || profile.username}</h2>
                        <p className="text-sm text-[var(--text-secondary)] font-medium mb-4">{profile.email}</p>

                        <div className="w-full pt-4 border-t border-[var(--border)] grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Streak</span>
                                <span className="text-lg font-black text-indigo-500">{analytics?.currentStreak || 0}</span>
                            </div>
                            <div className="flex flex-col border-x border-[var(--border)]">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Score</span>
                                <span className="text-lg font-black text-emerald-500">{analytics?.consistency || 0}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Habits</span>
                                <span className="text-lg font-black text-violet-500">{analytics?.totalHabits || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-6 space-y-4">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Analytics Summary</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-[var(--text-secondary)]"><Calendar className="w-4 h-4" /> Member since</span>
                                <span className="font-bold text-[var(--text-primary)]">Feb 2026</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-[var(--text-secondary)]"><TrendingUp className="w-4 h-4" /> Consistency</span>
                                <span className="font-bold text-[var(--text-primary)]">{analytics?.consistency}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-[var(--text-secondary)]"><Target className="w-4 h-4" /> Active Goals</span>
                                <span className="font-bold text-[var(--text-primary)]">{analytics?.totalHabits}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleUpdate} className="premium-card p-6 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                    <input
                                        type="text"
                                        value={profile.name || ''}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Username</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)]">@</span>
                                    <input
                                        type="text"
                                        value={profile.username || ''}
                                        onChange={e => setProfile({ ...profile, username: e.target.value })}
                                        className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Email (Read-only)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] opacity-50" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        readOnly
                                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-[var(--text-secondary)] outline-none opacity-60 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Age</label>
                                <input
                                    type="text"
                                    value={profile.age || ''}
                                    onChange={e => setProfile({ ...profile, age: e.target.value })}
                                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                                    placeholder="e.g. 25"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Height</label>
                                    <input
                                        type="text"
                                        value={profile.height || ''}
                                        onChange={e => setProfile({ ...profile, height: e.target.value })}
                                        className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                                        placeholder="e.g. 180cm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Weight</label>
                                    <input
                                        type="text"
                                        value={profile.weight || ''}
                                        onChange={e => setProfile({ ...profile, weight: e.target.value })}
                                        className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                                        placeholder="e.g. 75kg"
                                    />
                                </div>
                            </div>
                        </div>

                        {message.text && (
                            <div className={clsx(
                                "p-4 rounded-xl text-sm font-bold",
                                message.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
