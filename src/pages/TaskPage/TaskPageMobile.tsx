import React from 'react';
import { Plus, Check, Loader2, Trash2, Calendar, Layers } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TaskPageProps } from './types';

export const TaskPageMobile: React.FC<TaskPageProps> = ({
    habits,
    loading,
    adding,
    newHabitName,
    onToggleHabit,
    onAddHabit,
    onDeleteHabit,
    onSetAdding,
    onSetNewHabitName,
    onNavigate,
    DAYS,
    TODAY_STR,
    getLocalDateString
}) => {
    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium animate-pulse">Syncing...</p>
        </div>
    );

    // Filter to show only today and maybe yesterday/tomorrow in a smaller view, 
    // but for simplicity in this demo, let's just show habits in a list with a toggle for today.

    return (
        <div className="p-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Mobile Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Daily Focus</h1>
                <p className="text-[var(--text-secondary)] text-sm">Tap habits to complete today.</p>
            </div>

            {/* Quick Actions (Compact) */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => onNavigate('/templates')}
                    className="flex-1 p-3 premium-card flex items-center gap-3 glass"
                >
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Templates</span>
                </button>
                <button
                    onClick={() => onNavigate('/calendar')}
                    className="flex-1 p-3 premium-card flex items-center gap-3 glass"
                >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Calendar</span>
                </button>
            </div>

            {/* Habits List (Mobile Optimized) */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                {habits.map((habit) => {
                    const todayDateObj = DAYS.find(d => d.toDateString() === TODAY_STR) || new Date();
                    const dateStrKey = getLocalDateString(todayDateObj);
                    const isChecked = !!habit.logs?.[dateStrKey];

                    return (
                        <div key={habit.id} className="p-4 premium-card glass flex items-center justify-between group">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[var(--text-primary)] text-sm">{habit.title}</span>
                                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Today</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onDeleteHabit(habit.id, habit.title)}
                                    className="p-2 text-[var(--text-secondary)] hover:text-rose-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onToggleHabit(habit.id, todayDateObj)}
                                    className={twMerge(
                                        "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
                                        isChecked
                                            ? "bg-[var(--accent)] border-[var(--accent)] shadow-lg"
                                            : "border-[var(--border)] bg-[var(--surface-muted)]"
                                    )}
                                >
                                    <Check className={clsx(
                                        "w-6 h-6 text-white transition-all",
                                        isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                    )} strokeWidth={4} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {habits.length === 0 && !adding && (
                    <div className="py-12 flex flex-col items-center gap-4 text-[var(--text-secondary)] italic text-sm">
                        <Plus className="w-6 h-6 opacity-20" />
                        <p>No habits set for today.</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button (Mobile Feel) */}
            <button
                onClick={() => onSetAdding(true)}
                className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--accent)] text-white shadow-2xl flex items-center justify-center z-50 animate-bounce"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Inline Editor (Mobile) */}
            {adding && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end">
                    <div className="w-full bg-[var(--surface)] p-6 rounded-t-3xl animate-in slide-in-from-bottom-full duration-300">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">New Habit</h2>
                        <form onSubmit={onAddHabit} className="flex flex-col gap-4">
                            <input
                                autoFocus
                                className="bg-[var(--surface-muted)] text-[var(--text-primary)] px-5 py-4 rounded-xl w-full border border-[var(--border)] outline-none font-bold"
                                placeholder="E.g. Drink 2L Water"
                                value={newHabitName}
                                onChange={e => onSetNewHabitName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => onSetAdding(false)}
                                    className="flex-1 py-4 glass rounded-xl font-bold text-[var(--text-primary)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-[var(--accent)] rounded-xl text-white font-bold"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
