import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Save, X, Layers } from 'lucide-react';
import api from '../api/api';

interface HabitTemplate {
    id: string;
    name: string;
    habitTitles: string[];
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<HabitTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newHabits, setNewHabits] = useState<string[]>(['']);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await api.get<HabitTemplate[]>('/templates');
            setTemplates(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabitField = () => {
        setNewHabits([...newHabits, '']);
    };

    const handleHabitChange = (index: number, value: string) => {
        const updated = [...newHabits];
        updated[index] = value;
        setNewHabits(updated);
    };

    const handleRemoveHabitField = (index: number) => {
        setNewHabits(newHabits.filter((_, i) => i !== index));
    };

    const saveTemplate = async () => {
        if (!newName.trim() || newHabits.filter(h => h.trim()).length === 0) {
            alert("Please provide a name and at least one habit");
            return;
        }

        try {
            const res = await api.post<HabitTemplate>('/templates', {
                name: newName,
                habitTitles: newHabits.filter(h => h.trim())
            });
            setTemplates([...templates, res.data]);
            setCreating(false);
            setNewName('');
            setNewHabits(['']);
        } catch (e) {
            alert("Failed to save template");
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await api.delete(`/templates/${id}`);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (e) {
            alert("Failed to delete template");
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center text-neutral-500"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 h-full overflow-y-auto max-w-4xl mx-auto animate-in fade-in duration-500 custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">Habit Templates</h1>
                    <p className="text-neutral-500 mt-1">Group your habits into reusable routines</p>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-medium text-sm shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Template</span>
                </button>
            </div>

            {creating && (
                <div className="bg-neutral-900 border border-blue-500/50 rounded-2xl p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-white">New Template</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCreating(false)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Template Name</label>
                            <input
                                autoFocus
                                className="w-full bg-neutral-800 text-white px-4 py-2 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. Morning Routine"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Habits</label>
                            <div className="space-y-2">
                                {newHabits.map((habit, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Habit ${index + 1}`}
                                            value={habit}
                                            onChange={e => handleHabitChange(index, e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleRemoveHabitField(index)}
                                            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddHabitField}
                                    className="w-full py-2 border-2 border-dashed border-neutral-800 rounded-xl text-neutral-500 hover:border-neutral-700 hover:text-neutral-400 transition-all"
                                >
                                    + Add another habit
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={saveTemplate}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-600/20"
                        >
                            <Save className="w-5 h-5" />
                            Save Template
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-[var(--color-habit-card)] border border-[var(--color-habit-border)] rounded-2xl p-6 group hover:border-blue-500/30 transition-all shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                            </div>
                            <button
                                onClick={() => deleteTemplate(template.id)}
                                className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {template.habitTitles.map((title, i) => (
                                <div key={i} className="flex items-center gap-2 text-neutral-400 text-sm">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    {title}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {!loading && templates.length === 0 && !creating && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-700">
                            <Layers className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-medium text-neutral-400">No templates yet</h3>
                        <p className="text-neutral-600 mt-1 max-w-xs mx-auto">Create routines like 'Workout' or 'Work Focus' to add multiple habits at once.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
