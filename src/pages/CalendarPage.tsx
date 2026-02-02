import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const navigate = useNavigate();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

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

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentYear, currentMonth, day);
        const dateStr = selectedDate.toISOString().split('T')[0];
        navigate(`/habits/${dateStr}`);
    };

    const handleGoToDate = () => {
        const dateInput = prompt("Enter date (YYYY-MM-DD):", today.toISOString().split('T')[0]);
        if (dateInput) {
            try {
                const date = new Date(dateInput);
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

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;
        const isFuture = date > today;

        days.push(
            <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={clsx(
                    "aspect-square rounded-lg flex items-center justify-center font-medium transition-all relative group",
                    isToday && "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105",
                    !isToday && "hover:bg-neutral-800 text-neutral-300 hover:scale-105",
                    isPast && "text-neutral-600",
                    isFuture && "text-neutral-400"
                )}
            >
                {day}
                {isToday && (
                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white" />
                )}
            </button>
        );
    }

    return (
        <div className="p-8 h-full overflow-y-auto max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white tracking-tight">Calendar</h1>
                <p className="text-neutral-500 mt-1">Select a date to view and manage habits</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => navigate(`/habits/${today.toISOString().split('T')[0]}`)}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl hover:from-blue-600/30 hover:to-blue-800/30 transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="text-white font-medium">Today's Habits</div>
                        <div className="text-blue-300 text-sm">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    </div>
                </button>

                <button
                    onClick={handleGoToDate}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-xl hover:from-purple-600/30 hover:to-purple-800/30 transition-all group"
                >
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="text-white font-medium">Go To Date</div>
                        <div className="text-purple-300 text-sm">Jump to specific date</div>
                    </div>
                </button>
            </div>

            {/* Calendar */}
            <div className="bg-[var(--color-habit-card)] border border-[var(--color-habit-border)] rounded-2xl p-6 shadow-2xl">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-neutral-400" />
                    </button>
                    <h2 className="text-xl font-semibold text-white">
                        {MONTHS[currentMonth]} {currentYear}
                    </h2>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neutral-800" />
                    <span>Other Days</span>
                </div>
            </div>
        </div>
    );
}
