import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import api from '../api/api';
import { Loader2 } from 'lucide-react';

interface DailyData {
    name: string;
    value: number;
}
interface HabitStat {
    id: string;
    title: string;
    completionRate: number;
    completedCount: number;
}
interface SummaryStats {
    totalPossible: number;
    totalDone: number;
    percentage: number;
}
interface AnalyticsData {
    weeklyData: DailyData[];
    steakTrend: DailyData[];
    consistency: number;
    currentStreak: number;
    totalCompleted: number;
    habitStats: HabitStat[];
    mostCompletedHabit: string;
    mostMissedHabit: string;
    weeklySummary: SummaryStats;
    monthlySummary: SummaryStats;
}

const COLORS = ['#3B82F6', '#2A2A2A'];

const Card = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-[var(--color-habit-card)] border border-[var(--color-habit-border)] p-6 rounded-2xl flex flex-col ${className}`}>
        <h3 className="text-sm font-medium text-neutral-400 mb-6 uppercase tracking-wider">{title}</h3>
        <div className="flex-1 w-full">
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
        <div className="p-8 h-full overflow-y-auto max-w-6xl mx-auto animate-in fade-in duration-500 custom-scrollbar pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white tracking-tight">Analytics</h1>
                <p className="text-neutral-500 mt-1">Insights into your progress.</p>
            </div>

            {/* Quick Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-900/20 to-neutral-900 border border-blue-900/30 rounded-2xl">
                    <h4 className="text-blue-400 text-xs font-medium mb-1 uppercase tracking-wider">Most Completed</h4>
                    <p className="text-xl font-bold text-white truncate">{data.mostCompletedHabit}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-red-900/20 to-neutral-900 border border-red-900/30 rounded-2xl">
                    <h4 className="text-red-400 text-xs font-medium mb-1 uppercase tracking-wider">Most Missed</h4>
                    <p className="text-xl font-bold text-white truncate">{data.mostMissedHabit}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-neutral-900 border border-emerald-900/30 rounded-2xl">
                    <h4 className="text-emerald-400 text-xs font-medium mb-1 uppercase tracking-wider">Weekly Pct</h4>
                    <p className="text-3xl font-bold text-white">{data.weeklySummary.percentage}%</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-neutral-900 border border-purple-900/30 rounded-2xl">
                    <h4 className="text-purple-400 text-xs font-medium mb-1 uppercase tracking-wider">Monthly Pct</h4>
                    <p className="text-3xl font-bold text-white">{data.monthlySummary.percentage}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Weekly Completion Bar Chart */}
                <Card title="Last 7 Days Activity" className="lg:col-span-2">
                    <div className="h-[300px]">
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
                    </div>
                </Card>

                {/* Consistency Pie Chart */}
                <Card title="Overall Consistency">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={consistencyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {consistencyData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#E5E5E5' }} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="24" fontWeight="600">
                                    {data.consistency}%
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Habit Stats Table */}
            <Card title="Habit Performance (Last 30 Days)">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wider">
                                <th className="pb-4 font-medium">Habit</th>
                                <th className="pb-4 font-medium">Completion Rate</th>
                                <th className="pb-4 font-medium">Total Done</th>
                                <th className="pb-4 font-medium text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {data.habitStats.map((stat) => (
                                <tr key={stat.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="py-4 font-medium text-neutral-200">{stat.title}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 max-w-[100px] h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${stat.completionRate > 70 ? 'bg-emerald-500' : stat.completionRate > 40 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                    style={{ width: `${stat.completionRate}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-neutral-300">{stat.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-neutral-400">{stat.completedCount} times</td>
                                    <td className="py-4 text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${stat.completionRate > 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {stat.completionRate > 50 ? 'Stable' : 'Needs Focus'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
