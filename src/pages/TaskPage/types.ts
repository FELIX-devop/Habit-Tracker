export interface Habit {
    id: string;
    title: string;
    logs: Record<string, boolean>;
}

export interface TaskPageProps {
    habits: Habit[];
    loading: boolean;
    adding: boolean;
    newHabitName: string;
    onToggleHabit: (id: string, dateObj: Date) => Promise<void>;
    onAddHabit: (e?: React.FormEvent) => Promise<void>;
    onDeleteHabit: (id: string, title: string) => Promise<void>;
    onSetAdding: (val: boolean) => void;
    onSetNewHabitName: (val: string) => void;
    onNavigate: (path: string) => void;
    DAYS: Date[];
    TODAY_STR: string;
    getLocalDateString: (d: Date) => string;
}
