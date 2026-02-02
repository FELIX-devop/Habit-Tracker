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

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 custom-scrollbar pb-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-2">Routines</h1>
                    <p className="text-[var(--text-secondary)] text-base sm:text-lg">Group your habits into powerful templates.</p>
                </div>
                {!creating && (
                    <button
                        onClick={() => setCreating(true)}
                        className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:opacity-90 transition-all text-sm font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Create Template
                    </button>
                )}
            </div>

            {creating && (
                <div className="premium-card glass p-6 sm:p-8 mb-12 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">System Configuration</h3>
                        <button onClick={() => setCreating(false)} className="p-2 hover:bg-[var(--surface-hover)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">Routine Identifier</label>
                            <input
                                autoFocus
                                className="w-full bg-[var(--surface-muted)] text-[var(--text-primary)] px-5 py-3 rounded-xl border border-[var(--border)] focus:border-indigo-500 outline-none transition-all placeholder:text-[var(--text-secondary)] font-bold"
                                placeholder="e.g. Deep Work Session"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-4 uppercase tracking-[0.2em]">Habit Payload</label>
                            <div className="space-y-3">
                                {newHabits.map((habit, index) => (
                                    <div key={index} className="flex gap-3 animate-in slide-in-from-left-2" style={{ animationDelay: `${index * 50}ms` }}>
                                        <input
                                            className="flex-1 bg-[var(--surface-muted)] text-[var(--text-primary)] px-5 py-3 rounded-xl border border-[var(--border)] focus:border-indigo-400 outline-none transition-all placeholder:text-[var(--text-secondary)]"
                                            placeholder={`Index ${index + 1}`}
                                            value={habit}
                                            onChange={e => handleHabitChange(index, e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleRemoveHabitField(index)}
                                            className="p-3 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddHabitField}
                                    className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-secondary)] font-bold text-sm hover:border-indigo-500/30 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Protocol
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={saveTemplate}
                            className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/20"
                        >
                            <Save className="w-5 h-5" />
                            Deploy Template
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="premium-card glass p-6 group relative overflow-hidden">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors truncate">{template.name}</h3>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{template.habitTitles.length} Instructions</p>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteTemplate(template.id)}
                                className="p-2 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {template.habitTitles.map((title, i) => (
                                <div key={i} className="flex items-center gap-3 text-[var(--text-secondary)] text-sm font-bold bg-[var(--surface-muted)] p-3 rounded-xl border border-[var(--border)]">
                                    <span className="text-indigo-500 font-black text-[10px]">0{i + 1}</span>
                                    <span className="truncate">{title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {!loading && templates.length === 0 && !creating && (
                    <div className="col-span-full py-32 flex flex-col items-center gap-6 text-[var(--text-secondary)]">
                        <div className="w-20 h-20 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center opacity-20">
                            <Layers className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-[var(--text-primary)] mb-1">Archive Empty</p>
                            <p className="text-sm font-medium">Create your first routine to optimize your flow.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
}
