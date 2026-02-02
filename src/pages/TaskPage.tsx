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
const TODAY_ISO = new Date().toISOString().split('T')[0]; // For strict API validation

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
        // Optimistic Update
        const dateStrKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

        // Strict Validation Check (Frontend side pre-check)
        if (dateStrKey > TODAY_ISO) {
            alert("Cannot update future dates!");
            return;
        }
        // Only today allow toggle?
        // User Requirement: "Rules: Only TODAY’s date is allowed for checklist updates."
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
            // Revert on error
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

    if (loading) return <div className="h-full flex items-center justify-center text-neutral-500"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 h-full flex flex-col max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Dashboard Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-white tracking-tight">Weekly Focus</h1>
                <p className="text-neutral-500 mt-1">Track your consistency.</p>
            </div>

            {/* Dashboard Action Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Add Habit */}
                <button
                    onClick={() => setAdding(true)}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl hover:from-blue-600/30 hover:to-blue-800/30 transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-white">Add Habit</div>
                        <div className="text-xs text-neutral-500">Add a new goal</div>
                    </div>
                </button>

                {/* Templates */}
                <button
                    onClick={() => navigate('/templates')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-xl hover:from-purple-600/30 hover:to-purple-800/30 transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-white">Templates</div>
                        <div className="text-xs text-neutral-500">Grouped routines</div>
                    </div>
                </button>

                {/* Calendar */}
                <button
                    onClick={() => navigate('/calendar')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-600/30 rounded-xl hover:from-emerald-600/30 hover:to-emerald-800/30 transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-white">Calendar</div>
                        <div className="text-xs text-neutral-500">Go to specific date</div>
                    </div>
                </button>
            </div>

            <div className="bg-[var(--color-habit-card)] rounded-2xl border border-[var(--color-habit-border)] shadow-2xl overflow-hidden flex flex-col flex-1 min-h-0">
                {/* Header Row */}
                <div className="flex border-b border-[var(--color-habit-border)] bg-neutral-900/50 backdrop-blur-sm">
                    <div className="w-64 flex-shrink-0 p-4 font-medium text-neutral-400 text-sm sticky left-0 bg-[var(--color-habit-card)] z-10 border-r border-[var(--color-habit-border)]">
                        Task Name
                    </div>
                    <div className="flex-1 overflow-x-auto no-scrollbar">
                        <div className="flex min-w-full">
                            {DAYS.map((day) => {
                                const isToday = day.toDateString() === TODAY_STR;
                                return (
                                    <div key={day.toISOString()} className={clsx(
                                        "flex-1 min-w-[100px] p-4 text-center border-r border-[var(--color-habit-border)] last:border-r-0 flex flex-col items-center gap-1",
                                        isToday ? "bg-white/5" : ""
                                    )}>
                                        <span className={clsx("text-xs font-semibold uppercase tracking-wider", isToday ? "text-blue-400" : "text-neutral-500")}>
                                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <span className={clsx("text-lg font-medium", isToday ? "text-white" : "text-neutral-300")}>
                                            {day.getDate()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Rows */}
                <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
                    {habits.map((habit) => (
                        <div key={habit.id} className="flex border-b border-[var(--color-habit-border)] last:border-0 group hover:bg-white/[0.02] transition-colors relative">
                            <div className="w-64 flex-shrink-0 p-4 sticky left-0 bg-[var(--color-habit-card)] group-hover:bg-[#1f1f1f] z-10 border-r border-[var(--color-habit-border)] flex items-center justify-between">
                                <span
                                    className="text-neutral-200 font-medium truncate select-none"
                                >
                                    {habit.title}
                                </span>
                                <button
                                    onClick={() => deleteHabit(habit.id, habit.title)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-500 p-1 rounded hover:bg-red-500/10"
                                    title="Delete habit"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-x-auto no-scrollbar">
                                <div className="flex min-w-full h-full">
                                    {DAYS.map((day) => {
                                        const dateStrKey = day.toISOString().split('T')[0];
                                        const isChecked = !!habit.logs?.[dateStrKey];
                                        const isToday = day.toDateString() === TODAY_STR;

                                        // Disable interaction if NOT today (handled by logic, but UI should also reflect)
                                        const isInteractive = isToday;

                                        return (
                                            <div key={dateStrKey} className={clsx(
                                                "flex-1 min-w-[100px] border-r border-[var(--color-habit-border)] last:border-r-0 flex items-center justify-center relative",
                                                isToday ? "bg-white/5" : ""
                                            )}>
                                                <button
                                                    onClick={() => toggleHabit(habit.id, day)}
                                                    disabled={!isInteractive}
                                                    className={twMerge(
                                                        "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ease-out group/check",
                                                        isChecked
                                                            ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] scale-110"
                                                            : "border-neutral-700 bg-neutral-800/30",
                                                        isInteractive ? "hover:border-neutral-500 hover:bg-neutral-800 cursor-pointer" : "cursor-not-allowed opacity-50"
                                                    )}
                                                >
                                                    <Check className={clsx(
                                                        "w-4 h-4 text-white transition-all duration-300",
                                                        isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                                    )} strokeWidth={3} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* New Habit Input Row */}
                    {adding && (
                        <div className="flex border-b border-[var(--color-habit-border)] animate-in fade-in slide-in-from-top-2">
                            <div className="w-64 p-4 border-r border-[var(--color-habit-border)]">
                                <form onSubmit={addHabit}>
                                    <input
                                        autoFocus
                                        className="bg-neutral-800 text-white px-3 py-1 rounded w-full border border-blue-500 outline-none"
                                        placeholder="Habit Name..."
                                        value={newHabitName}
                                        onChange={e => setNewHabitName(e.target.value)}
                                        onBlur={() => !newHabitName && setAdding(false)}
                                    />
                                </form>
                            </div>
                            <div className="flex-1"></div>
                        </div>
                    )}

                    {!loading && habits.length === 0 && !adding && (
                        <div className="p-10 text-center text-neutral-500">
                            No habits found. Start by creating one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
