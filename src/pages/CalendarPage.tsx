import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft, Search, Layers } from 'lucide-react';
import clsx from 'clsx';

export default function CalendarPage() {
    const navigate = useNavigate();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    // Note: View-only constants removed to prevent staleness. Logic moved inside component.

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentYear, currentMonth, day);
        navigate(`/habits/${getLocalDateString(selectedDate)}`);
    };

    const handleGoToDate = () => {
        const dateInput = prompt("Enter date (YYYY-MM-DD):", getLocalDateString(today));
        if (dateInput) {
            try {
                const [y, m, d] = dateInput.split('-').map(Number);
                const date = new Date(y, m - 1, d);
                if (isNaN(date.getTime())) {
                    alert("Invalid date format");
                    return;
                }
                navigate(`/habits/${dateInput}`);
            } catch (e) {
                alert("Invalid date format");
            }
        }
    };

    const daysCount = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);
    // Adjust startDay for Monday-first calendar (0=Sunday, 1=Monday, ..., 6=Saturday)
    // If startDay is Sunday (0), it should be 6 blanks for Monday start.
    // Otherwise, it's startDay - 1 blanks.
    const blanks = Array.from({ length: startDay === 0 ? 6 : startDay - 1 }, (_, i) => i);

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/tasks')}
                        className="p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">Calendar</h1>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium">Navigate your habit history.</p>
                    </div>
                </div>
                <button
                    onClick={handleGoToDate}
                    className="px-6 py-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-sm font-bold text-[var(--text-primary)] flex items-center justify-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    Jump to Date
                </button>
            </div>

            {/* Calendar Container */}
            <div className="premium-card glass flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Month Navigation */}
                <div className="p-4 sm:p-6 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--surface-muted)]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] whitespace-nowrap">
                            {monthNames[currentMonth]} <span className="text-[var(--text-secondary)] font-medium leading-none ml-1">{currentYear}</span>
                        </h2>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-[var(--text-primary)] flex justify-center">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }} className="flex-1 sm:flex-none px-5 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-[10px] uppercase tracking-widest font-black text-indigo-500">
                            Today
                        </button>
                        <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-[var(--text-primary)] flex justify-center">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Weekday Names */}
                <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-muted)]">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="p-2 sm:p-4 text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] sm:tracking-[0.2em] border-r border-[var(--border)] last:border-0">
                            <span className="hidden sm:inline">{d}</span>
                            <span className="sm:hidden">{d[0]}</span>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 h-full">
                        {blanks.map(i => (
                            <div key={`blank-${i}`} className="aspect-square sm:aspect-auto sm:min-h-[120px] p-4 border-r border-b border-[var(--border)] bg-[var(--surface-muted)] opacity-50" />
                        ))}
                        {days.map(day => {
                            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={clsx(
                                        "aspect-square sm:aspect-auto sm:min-h-[120px] p-2 sm:p-4 border-r border-b border-[var(--border)] text-left transition-all relative group flex flex-col gap-1",
                                        "hover:bg-indigo-500/5 last:border-r-0 focus:outline-none touch-manipulation",
                                        isToday ? "bg-indigo-500/[0.05]" : ""
                                    )}
                                >
                                    <span className={clsx(
                                        "text-base sm:text-lg font-black transition-colors",
                                        isToday ? "text-indigo-500" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                                    )}>
                                        {day}
                                    </span>
                                    {isToday && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                                    )}
                                    <div className="mt-auto flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]" />
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Search className="w-3.5 h-3.5 text-indigo-500" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <button
                    onClick={() => navigate(`/habits/${getLocalDateString(today)}`)}
                    className="p-6 premium-card bg-gradient-to-br from-indigo-500/10 to-transparent flex items-center gap-6 group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <CalendarIcon className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                        <div className="text-lg font-black text-[var(--text-primary)] mb-0.5 group-hover:text-indigo-500 transition-colors">Go to Today</div>
                        <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest text-[10px]">Active Protocol</div>
                    </div>
                </button>
                <div className="p-6 premium-card flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                        <div className="text-lg font-black text-[var(--text-primary)] mb-0.5">{daysCount} Days</div>
                        <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest text-[10px]">{monthNames[currentMonth]} {currentYear}</div>
                    </div>
                </div>
            </div>

        </div>
    );
}
