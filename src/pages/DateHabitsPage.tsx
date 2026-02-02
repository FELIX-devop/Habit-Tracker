import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, Loader2, Trash2, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
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

    const selectedDate = date ? new Date(date) : new Date();
    const dateStr = selectedDate.toISOString().split('T')[0];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const isPast = selectedDate < today && dateStr !== todayStr;
    const isToday = dateStr === todayStr;
    const isFuture = selectedDate > today;

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

    const toggleHabit = async (id: string) => {
        // Only allow toggling for today
        if (!isToday) {
            if (isPast) {
                alert("Past dates are read-only. You cannot mark habits as complete for past dates.");
            } else {
                alert("You cannot mark habits as complete for future dates.");
            }
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

    const completedCount = habits.filter(h => h.logs[dateStr]).length;
    const totalCount = habits.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="p-8 h-full flex flex-col max-w-4xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/calendar')}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-neutral-400" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        {isToday && "Today - You can mark habits as complete"}
                        {isPast && "Past date - View only, cannot mark as complete"}
                        {isFuture && "Future date - You can plan habits"}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl p-4">
                    <div className="text-blue-400 text-sm font-medium mb-1">Total Habits</div>
                    <div className="text-2xl font-bold text-white">{totalCount}</div>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-xl p-4">
                    <div className="text-green-400 text-sm font-medium mb-1">Completed</div>
                    <div className="text-2xl font-bold text-white">{completedCount}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-xl p-4">
                    <div className="text-purple-400 text-sm font-medium mb-1">Progress</div>
                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => setAdding(true)}
                    className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl hover:from-blue-600/30 hover:to-blue-800/30 transition-all"
                >
                    <Plus className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">Add Habit</span>
                </button>
                <button
                    onClick={() => navigate('/calendar')}
                    className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-xl hover:from-purple-600/30 hover:to-purple-800/30 transition-all"
                >
                    <CalendarIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">Change Date</span>
                </button>
            </div>

            {/* Habits List */}
            <div className="bg-[var(--color-habit-card)] rounded-2xl border border-[var(--color-habit-border)] shadow-2xl overflow-hidden flex-1">
                <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar max-h-full">
                    {habits.map((habit) => {
                        const isChecked = !!habit.logs?.[dateStr];
                        const canToggle = isToday;

                        return (
                            <div
                                key={habit.id}
                                className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all group"
                            >
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    disabled={!canToggle}
                                    className={twMerge(
                                        "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 flex-shrink-0",
                                        isChecked
                                            ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                            : "border-neutral-700 bg-neutral-800/30",
                                        canToggle ? "hover:border-neutral-500 hover:bg-neutral-800 cursor-pointer" : "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <Check className={clsx(
                                        "w-4 h-4 text-white transition-all duration-300",
                                        isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                    )} strokeWidth={3} />
                                </button>
                                <span className="flex-1 text-neutral-200 font-medium">{habit.title}</span>
                                <button
                                    onClick={() => deleteHabit(habit.id, habit.title)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-500 p-1 rounded hover:bg-red-500/10"
                                    title="Delete habit"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}

                    {/* New Habit Input */}
                    {adding && (
                        <div className="p-4 bg-neutral-900/50 rounded-xl border border-blue-500 animate-in fade-in slide-in-from-top-2">
                            <form onSubmit={addHabit}>
                                <input
                                    autoFocus
                                    className="bg-neutral-800 text-white px-3 py-2 rounded w-full border border-blue-500 outline-none"
                                    placeholder="Habit Name..."
                                    value={newHabitName}
                                    onChange={e => setNewHabitName(e.target.value)}
                                    onBlur={() => !newHabitName && setAdding(false)}
                                />
                            </form>
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
