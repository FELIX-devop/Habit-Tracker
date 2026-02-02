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
        <div className="p-4 sm:p-8 min-h-full flex flex-col max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40 sm:pb-24 space-y-8 sm:space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
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
                    className="w-full sm:w-auto px-6 py-4 sm:py-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-sm font-bold text-[var(--text-primary)] flex items-center justify-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    Jump to Date
                </button>
            </div>

            {/* Calendar Container */}
            <div className="premium-card glass sm:flex-1 flex flex-col min-h-fit sm:min-h-0 relative z-10">
                {/* Month Navigation */}
                <div className="p-5 sm:p-6 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-6 bg-[var(--surface-muted)]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl sm:text-2xl font-black text-[var(--text-primary)] whitespace-nowrap">
                            {monthNames[currentMonth]} <span className="text-[var(--text-secondary)] font-medium leading-none ml-1">{currentYear}</span>
                        </h2>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-4 sm:p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-[var(--text-primary)] flex justify-center items-center">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                const n = new Date();
                                setCurrentMonth(n.getMonth());
                                setCurrentYear(n.getFullYear());
                            }}
                            className="flex-[1.5] sm:flex-none px-6 py-3 sm:py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-xs sm:text-[10px] uppercase tracking-widest font-black text-indigo-500"
                        >
                            Today
                        </button>
                        <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-4 sm:p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all text-[var(--text-primary)] flex justify-center items-center">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Weekday Names */}
                <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="py-3 sm:py-4 text-center text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-r border-[var(--border)] last:border-0">
                            <span className="hidden sm:inline">{d}</span>
                            <span className="sm:hidden">{d[0]}</span>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="sm:flex-1 sm:overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 sm:h-full border-b border-[var(--border)] sm:border-b-0">
                        {blanks.map(i => (
                            <div key={`blank-${i}`} className="aspect-square sm:aspect-auto sm:min-h-[120px] border-r border-b border-[var(--border)] bg-[var(--surface-muted)]/20" />
                        ))}
                        {days.map(day => {
                            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={clsx(
                                        "aspect-square sm:aspect-auto sm:min-h-[120px] p-2 sm:p-4 border-r border-b border-[var(--border)] text-left transition-all relative group flex flex-col gap-1 items-center sm:items-start justify-center sm:justify-start",
                                        "hover:bg-indigo-500/5 last:border-r-0 focus:outline-none touch-manipulation sm:bg-transparent",
                                        isToday ? "bg-indigo-500/[0.08]" : "bg-[var(--surface)] sm:bg-transparent"
                                    )}
                                >
                                    <span className={clsx(
                                        "text-sm sm:text-lg font-black transition-colors w-7 h-7 sm:w-auto sm:h-auto flex items-center justify-center rounded-full sm:rounded-none",
                                        isToday ? "bg-indigo-500 text-white sm:bg-transparent sm:text-indigo-500" : "text-[var(--text-primary)] sm:text-[var(--text-secondary)] sm:group-hover:text-[var(--text-primary)]"
                                    )}>
                                        {day}
                                    </span>
                                    {isToday && (
                                        <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                                    )}
                                    <div className="mt-auto hidden sm:flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]" />
                                    </div>
                                    <div className="sm:hidden flex gap-0.5 mt-1">
                                        <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
                                    </div>
                                    <div className="absolute top-4 right-4 hidden sm:flex opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 sm:mt-8 pb-10 sm:pb-0">
                <button
                    onClick={() => navigate(`/habits/${getLocalDateString(new Date())}`)}
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
