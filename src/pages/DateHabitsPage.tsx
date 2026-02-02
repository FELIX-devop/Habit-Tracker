import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, Loader2, Trash2, ArrowLeft, Edit2, X, Save, Layers } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api/api';

interface Habit {
    id: string;
    title: string;
    logs: Record<string, boolean>; // Key: YYYY-MM-DD
}

export default function DateHabitsPage() {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');

    const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getSelectedDate = () => {
        if (!date) {
            const d = new Date();
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const selectedDate = getSelectedDate();
    const dateStr = getLocalDateString(selectedDate);

    // Normalize "today" to start of day for comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = getLocalDateString(today);

    const isPast = selectedDate.getTime() < today.getTime();
    const isToday = dateStr === todayStr;

    useEffect(() => {
        fetchHabits();
        fetchTemplates();
    }, []);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);

    const fetchHabits = async () => {
        try {
            const res = await api.get<Habit[]>('/habits');
            setHabits(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/templates');
            setTemplates(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const applyTemplate = async (templateId: string) => {
        try {
            const res = await api.post(`/templates/${templateId}/apply`);
            setHabits(res.data);
            setShowTemplates(false);
        } catch (e) {
            alert("Failed to apply template");
        }
    };

    const updateHabitTitle = async (id: string) => {
        if (!editingName.trim()) {
            setEditingId(null);
            return;
        }

        const previousHabits = [...habits];
        setHabits(prev => prev.map(h => h.id === id ? { ...h, title: editingName } : h));

        try {
            await api.put(`/habits/${id}`, { title: editingName });
            setEditingId(null);
        } catch (e: any) {
            setHabits(previousHabits);
            alert(`Error: ${e.response?.data || "Failed to update habit"}`);
        }
    };

    const toggleHabit = async (id: string) => {
        // Freshly calculate "today" to avoid stale state if page left open overnight
        const nowFresh = new Date();
        const todayFresh = new Date(nowFresh.getFullYear(), nowFresh.getMonth(), nowFresh.getDate());
        const todayStrFresh = getLocalDateString(todayFresh);
        const isTodayFresh = dateStr === todayStrFresh;
        const isPastFresh = selectedDate.getTime() < todayFresh.getTime();

        if (!isTodayFresh) {
            if (isPastFresh) alert("Past dates are read-only.");
            else alert("You cannot mark habits as complete for future dates.");
            return;
        }

        const previousHabits = [...habits];
        setHabits(prev => prev.map(h => {
            if (h.id !== id) return h;
            const isCompleted = !!h.logs[dateStr];
            const newLogs = { ...h.logs };
            newLogs[dateStr] = !isCompleted;
            return { ...h, logs: newLogs };
        }));

        try {
            await api.post(`/habits/${id}/toggle`, null, { params: { date: dateStr } });
        } catch (e: any) {
            setHabits(previousHabits);
            alert(`Error: ${e.response?.data || "Failed to update"}`);
        }
    };

    const addHabit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newHabitName.trim()) {
            setAdding(false);
            return;
        }

        try {
            const res = await api.post<Habit>('/habits', { title: newHabitName });
            setHabits([...habits, res.data]);
            setNewHabitName('');
            setAdding(false);
        } catch (e) {
            alert("Failed to create habit");
        }
    };

    const deleteHabit = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        const previousHabits = [...habits];
        setHabits(prev => prev.filter(h => h.id !== id));

        try {
            await api.delete(`/habits/${id}`);
        } catch (e: any) {
            setHabits(previousHabits);
            alert(`Error: ${e.response?.data || "Failed to delete habit"}`);
        }
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    const completedCount = habits.filter(h => h.logs[dateStr]).length;
    const totalCount = habits.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header */}
            <div className="flex items-center gap-6 mb-10">
                <button
                    onClick={() => navigate('/calendar')}
                    className="p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-[10px] sm:text-sm font-bold uppercase tracking-widest mt-1">
                        {isToday ? "Make today count" : isPast ? "Historical Archives" : "Upcoming Protocol"}
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10">
                <div className="p-4 sm:p-6 premium-card bg-gradient-to-br from-indigo-500/10 to-transparent">
                    <h4 className="text-indigo-500 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest leading-none">Total</h4>
                    <p className="text-xl sm:text-4xl font-black text-[var(--text-primary)] leading-none mt-1">{totalCount}</p>
                </div>
                <div className="p-4 sm:p-6 premium-card bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <h4 className="text-emerald-500 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest leading-none">Done</h4>
                    <p className="text-xl sm:text-4xl font-black text-[var(--text-primary)] leading-none mt-1">{completedCount}</p>
                </div>
                <div className="p-4 sm:p-6 premium-card bg-gradient-to-br from-violet-500/10 to-transparent">
                    <h4 className="text-violet-500 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest leading-none">Score</h4>
                    <p className="text-xl sm:text-4xl font-black text-[var(--text-primary)] leading-none mt-1">{completionRate}%</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                    onClick={() => setAdding(true)}
                    className="flex items-center justify-center gap-2 p-4 sm:p-5 premium-card hover:bg-[var(--surface-hover)] transition-all text-sm font-bold text-[var(--text-primary)] group"
                >
                    <Plus className="w-5 h-5 text-[var(--accent)] group-hover:rotate-90 transition-transform" />
                    Add Habit
                </button>
                <div className="relative">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="w-full flex items-center justify-center gap-2 p-4 sm:p-5 premium-card hover:bg-[var(--surface-hover)] transition-all text-sm font-bold text-[var(--text-primary)]"
                    >
                        <Layers className="w-5 h-5 text-violet-500" />
                        Use Template
                    </button>

                    {showTemplates && (
                        <div className="absolute top-full left-0 w-full mt-3 glass rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {templates.length > 0 ? (
                                <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar bg-[var(--surface)]">
                                    {templates.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => applyTemplate(t.id)}
                                            className="w-full text-left px-5 py-4 hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-sm transition-colors rounded-xl flex flex-col gap-1"
                                        >
                                            <span className="font-bold">{t.name}</span>
                                            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">{t.habitTitles.length} habits</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--surface)]">
                                    No templates found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Habits List Container */}
            <div className="premium-card glass flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-4 sm:p-6 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                    {habits.map((habit) => {
                        const isChecked = !!habit.logs?.[dateStr];
                        const canToggle = isToday;

                        return (
                            <div
                                key={habit.id}
                                className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] transition-all group"
                            >
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    disabled={!canToggle}
                                    className={twMerge(
                                        "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
                                        isChecked
                                            ? "bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-indigo-600/30 scale-105"
                                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-secondary)]",
                                        !canToggle && "opacity-20 grayscale pointer-events-none"
                                    )}
                                >
                                    <Check className={clsx(
                                        "w-5 h-5 text-white transition-all duration-300",
                                        isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                    )} strokeWidth={4} />
                                </button>

                                {editingId === habit.id ? (
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            autoFocus
                                            className="bg-[var(--surface)] text-[var(--text-primary)] px-4 py-2 rounded-xl border border-[var(--accent)] outline-none flex-1 font-bold"
                                            value={editingName}
                                            onChange={e => setEditingName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && updateHabitTitle(habit.id)}
                                        />
                                        <button onClick={() => updateHabitTitle(habit.id)} className="text-emerald-500 p-2 hover:bg-emerald-500/10 rounded-lg">
                                            <Save className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-[var(--text-secondary)] p-2 hover:bg-[var(--surface-hover)] rounded-lg">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="flex-1 text-[var(--text-primary)] font-black leading-tight truncate">{habit.title}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={() => { setEditingId(habit.id); setEditingName(habit.title); }}
                                                className="text-[var(--text-secondary)] hover:text-indigo-400 p-2 rounded-lg hover:bg-indigo-400/10"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteHabit(habit.id, habit.title)}
                                                className="text-[var(--text-secondary)] hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {adding && (
                        <div className="p-4 rounded-2xl border border-[var(--accent)] bg-[var(--surface-muted)] animate-in slide-in-from-top-4">
                            <form onSubmit={addHabit}>
                                <input
                                    autoFocus
                                    className="bg-transparent text-[var(--text-primary)] px-4 py-2 w-full outline-none font-black placeholder:text-[var(--text-secondary)]"
                                    placeholder="Add a new habit..."
                                    value={newHabitName}
                                    onChange={e => setNewHabitName(e.target.value)}
                                    onBlur={() => !newHabitName && setAdding(false)}
                                />
                            </form>
                        </div>
                    )}

                    {!loading && habits.length === 0 && !adding && (
                        <div className="py-24 flex flex-col items-center gap-6 text-[var(--text-secondary)]">
                            <div className="w-20 h-20 rounded-full bg-[var(--surface-muted)] flex items-center justify-center border border-[var(--border)]">
                                <Plus className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No habits tracked on this date</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
