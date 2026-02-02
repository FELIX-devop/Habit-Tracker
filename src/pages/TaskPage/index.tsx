import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { TaskPageDesktop } from './TaskPageDesktop';
import { TaskPageMobile } from './TaskPageMobile';
import type { Habit } from './types';

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

const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Note: TODAY_ISO is now calculated inside the component to prevent staleness

export default function TaskPage() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');

    // Calculate today's date on every render/action to avoid midnight bugs
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toDateString();

    // Get weekly days inside component to ensure they refresh at midnight
    const daysOfWeek = getDaysOfWeek();

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await api.get<Habit[]>('/habits');
            setHabits(res.data);
        } finally {
            setLoading(false);
        }
    };

    const toggleHabit = async (id: string, dateObj: Date) => {
        const dateStrKey = getLocalDateString(dateObj);

        // Freshly calculate "today" to avoid midnight staleness
        const nowFresh = new Date();
        const todayFresh = new Date(nowFresh.getFullYear(), nowFresh.getMonth(), nowFresh.getDate());
        const todayISOFresh = getLocalDateString(todayFresh);

        if (dateStrKey > todayISOFresh) {
            alert("Cannot update future dates!");
            return;
        }
        if (dateStrKey !== todayISOFresh) {
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

    const sharedProps = {
        habits,
        loading,
        adding,
        newHabitName,
        onToggleHabit: toggleHabit,
        onAddHabit: addHabit,
        onDeleteHabit: deleteHabit,
        onSetAdding: setAdding,
        onSetNewHabitName: setNewHabitName,
        onNavigate: navigate,
        DAYS: daysOfWeek,
        TODAY_STR: todayStr,
        getLocalDateString
    };

    return isMobile ? <TaskPageMobile {...sharedProps} /> : <TaskPageDesktop {...sharedProps} />;
}
