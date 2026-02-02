import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import api from '../api/api';
import { Loader2 } from 'lucide-react';

interface DailyData {
    name: string;
    value: number;
}
interface AnalyticsData {
    weeklyData: DailyData[];
    steakTrend: DailyData[];
    consistency: number;
    currentStreak: number;
    totalCompleted: number;
}

const COLORS = ['#3B82F6', '#2A2A2A'];

const Card = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-[var(--color-habit-card)] border border-[var(--color-habit-border)] p-6 rounded-2xl flex flex-col ${className}`}>
        <h3 className="text-sm font-medium text-neutral-400 mb-6 uppercase tracking-wider">{title}</h3>
        <div className="flex-1 w-full min-h-[200px]">
            {children}
        </div>
    </div>
);

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get<AnalyticsData>('/analytics');
                setData(res.data);
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) return <div className="h-full flex items-center justify-center text-neutral-500"><Loader2 className="animate-spin" /></div>;
    if (!data) return <div className="h-full flex items-center justify-center text-neutral-500">No data available</div>;

    const consistencyData = [
        { name: 'Completed', value: data.consistency },
        { name: 'Missed', value: 100 - data.consistency }
    ];

    return (
        <div className="p-8 h-full overflow-y-auto max-w-6xl mx-auto animate-in fade-in duration-500 custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white tracking-tight">Analytics</h1>
                <p className="text-neutral-500 mt-1">Insights into your progress.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Weekly Completion */}
                <Card title="Weekly Completion">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} dy={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }}
                                itemStyle={{ color: '#E5E5E5' }}
                                cursor={{ fill: '#333', opacity: 0.2 }}
                            />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} animationDuration={1000} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Streak Trend (Using Weekly Data as placeholder for trend since backend reuses it currently) */}
                <Card title="Activity Trend">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.steakTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} dy={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }}
                                itemStyle={{ color: '#E5E5E5' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} animationDuration={1000} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Consistency */}
                <Card title="Consistency Rate">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={consistencyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {consistencyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#E5E5E5' }} />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="24" fontWeight="600">
                                {data.consistency}%
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Summary Stat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="p-6 bg-gradient-to-br from-blue-900/20 to-neutral-900 border border-blue-900/30 rounded-2xl">
                    <h4 className="text-blue-400 text-sm font-medium mb-1">Total Habits Completed</h4>
                    <p className="text-3xl font-bold text-white">{data.totalCompleted}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-neutral-900 border border-emerald-900/30 rounded-2xl">
                    <h4 className="text-emerald-400 text-sm font-medium mb-1">Current Streak</h4>
                    <p className="text-3xl font-bold text-white">{data.currentStreak} Days</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-neutral-900 border border-purple-900/30 rounded-2xl">
                    <h4 className="text-purple-400 text-sm font-medium mb-1">Consistency</h4>
                    <p className="text-3xl font-bold text-white">{data.consistency}%</p>
                </div>
            </div>
        </div>
    );
}
