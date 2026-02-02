import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Loader2, Trash2, Calendar, Layers } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api/api';

// Helper to get days of current week
const getDaysOfWeek = () => {
    const dates = [];
    const curr = new Date();
    const currentDay = curr.getDay(); // 0 is Sunday
    const distance = currentDay === 0 ? -6 : 1 - currentDay; // Adjust specifically for Monday start
    const first = new Date(curr.setDate(curr.getDate() + distance));

    for (let i = 0; i < 7; i++) {
        const next = new Date(first);
        next.setDate(first.getDate() + i);
        dates.push(next);
    }
    return dates;
};

const DAYS = getDaysOfWeek();
const TODAY_STR = new Date().toDateString(); // For UI highlighting
const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TODAY_ISO = getLocalDateString(new Date()); // For strict API validation

interface Habit {
    id: string;
    title: string;
    logs: Record<string, boolean>; // Key: YYYY-MM-DD
}

export default function TaskPage() {
    const navigate = useNavigate();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');

    useEffect(() => {
        fetchHabits();
    }, []);

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

    const toggleHabit = async (id: string, dateObj: Date) => {
        const dateStrKey = getLocalDateString(dateObj);
        if (dateStrKey > TODAY_ISO) {
            alert("Cannot update future dates!");
            return;
        }
        if (dateStrKey !== TODAY_ISO) {
            alert("You can only update the status for TODAY. Past dates are read-only.");
            return;
        }

        const previousHabits = [...habits];
        setHabits(prev => prev.map(h => {
            if (h.id !== id) return h;
            const isCompleted = !!h.logs[dateStrKey];
            const newLogs = { ...h.logs };
            newLogs[dateStrKey] = !isCompleted;
            return { ...h, logs: newLogs };
        }));

        try {
            await api.post(`/habits/${id}/toggle`, null, { params: { date: dateStrKey } });
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
        if (!confirm(`Are you sure you want to delete "${title}"? This will remove all related logs.`)) {
            return;
        }

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
            <p className="text-sm font-medium animate-pulse">Synchronizing your habits...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Weekly Focus</h1>
                    <p className="text-[var(--text-secondary)] text-base sm:text-lg">Your journey to consistency starts here.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/analytics')}
                        className="px-6 py-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"
                    >
                        Insights
                    </button>
                    <button
                        onClick={() => setAdding(true)}
                        className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:opacity-90 transition-all text-sm font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Add Habit
                    </button>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                    onClick={() => navigate('/templates')}
                    className="p-5 premium-card bg-gradient-to-br from-indigo-500/10 to-transparent flex flex-col items-start gap-4 text-left group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] mb-1 text-sm sm:text-base">Templates</div>
                        <div className="text-[10px] sm:text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold">Routines</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/calendar')}
                    className="p-5 premium-card bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col items-start gap-4 text-left group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] mb-1 text-sm sm:text-base">Calendar</div>
                        <div className="text-[10px] sm:text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold">History</div>
                    </div>
                </button>
            </div>

            {/* Weekly Table Container */}
            <div className="premium-card overflow-hidden flex flex-col flex-1 min-h-0 glass">
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="flex border-b border-[var(--border)] bg-[var(--surface-muted)]">
                            <div className="w-64 flex-shrink-0 p-6 font-bold text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] sticky left-0 bg-[var(--surface)] z-10 border-r border-[var(--border)]">
                                Habit Name
                            </div>
                            <div className="flex-1 flex">
                                {DAYS.map((day) => {
                                    const isToday = day.toDateString() === TODAY_STR;
                                    return (
                                        <div key={day.toISOString()} className={clsx(
                                            "flex-1 p-4 text-center border-r border-[var(--border)] last:border-r-0 flex flex-col items-center gap-1",
                                            isToday ? "bg-indigo-500/5" : ""
                                        )}>
                                            <span className={clsx("text-[10px] font-bold uppercase tracking-widest", isToday ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
                                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                            <span className={clsx("text-xl font-black", isToday ? "text-[var(--accent)]" : "text-[var(--text-primary)]")}>
                                                {day.getDate()}
                                            </span>
                                            {isToday && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1 shadow-[0_0_8px_var(--accent)]" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Habit Rows */}
                        <div className="divide-y divide-[var(--border)]">
                            {habits.map((habit) => (
                                <div key={habit.id} className="flex group hover:bg-[var(--surface-hover)] transition-colors">
                                    <div className="w-64 flex-shrink-0 p-6 sticky left-0 bg-[var(--surface)] group-hover:bg-[var(--surface-hover)] z-10 border-r border-[var(--border)] flex items-center justify-between transition-colors">
                                        <span className="text-[var(--text-primary)] font-bold text-sm truncate group-hover:text-[var(--accent)] transition-colors">
                                            {habit.title}
                                        </span>
                                        <button
                                            onClick={() => deleteHabit(habit.id, habit.title)}
                                            className="opacity-0 group-hover:opacity-100 transition-all text-[var(--text-secondary)] hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1 flex">
                                        {DAYS.map((day) => {
                                            const dateStrKey = getLocalDateString(day);
                                            const isChecked = !!habit.logs?.[dateStrKey];
                                            const isToday = day.toDateString() === TODAY_STR;
                                            const isInteractive = isToday;

                                            return (
                                                <div key={dateStrKey} className={clsx(
                                                    "flex-1 border-r border-[var(--border)] last:border-r-0 flex items-center justify-center py-4",
                                                    isToday ? "bg-indigo-500/5" : ""
                                                )}>
                                                    <button
                                                        onClick={() => toggleHabit(habit.id, day)}
                                                        disabled={!isInteractive}
                                                        className={twMerge(
                                                            "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 group/check relative overflow-hidden",
                                                            isChecked
                                                                ? "bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-indigo-500/30 scale-105"
                                                                : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--text-secondary)]",
                                                            !isInteractive && "opacity-20 grayscale pointer-events-none"
                                                        )}
                                                    >
                                                        <Check className={clsx(
                                                            "w-5 h-5 text-white transition-all duration-300",
                                                            isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                                        )} strokeWidth={4} />
                                                        {isChecked && (
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20" />
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* New Habit Inline Editor */}
                {adding && (
                    <div className="p-6 bg-[var(--surface-muted)] border-t border-[var(--border)] animate-in slide-in-from-top-4">
                        <form onSubmit={addHabit} className="flex gap-4">
                            <input
                                autoFocus
                                className="bg-[var(--surface)] text-[var(--text-primary)] px-5 py-3 rounded-xl w-full border border-[var(--border)] focus:border-[var(--accent)] outline-none transition-all placeholder:text-[var(--text-secondary)] font-bold"
                                placeholder="What's your next big focus?"
                                value={newHabitName}
                                onChange={e => setNewHabitName(e.target.value)}
                                onBlur={() => !newHabitName && setAdding(false)}
                            />
                            <button className="px-8 py-3 bg-[var(--accent)] rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-500/20">Create</button>
                        </form>
                    </div>
                )}

                {!loading && habits.length === 0 && !adding && (
                    <div className="py-32 flex flex-col items-center gap-6 text-[var(--text-secondary)]">
                        <div className="w-20 h-20 rounded-full bg-[var(--surface-muted)] flex items-center justify-center">
                            <Plus className="w-8 h-8 opacity-20" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-[var(--text-primary)] mb-1">Focus List Empty</p>
                            <p className="text-sm font-medium">Ready to build something amazing today?</p>
                        </div>
                        <button
                            onClick={() => setAdding(true)}
                            className="px-8 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--surface-hover)] transition-all"
                        >
                            Configure First Habit
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
