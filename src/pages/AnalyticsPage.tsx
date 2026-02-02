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
    trend: string;
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


const Card = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`premium-card p-4 sm:p-6 flex flex-col ${className}`}>
        <h3 className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-4 sm:mb-6 uppercase tracking-[0.2em]">{title}</h3>
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

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    if (!data) return <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">No analytics data found</div>;

    const consistencyData = [
        { name: 'Completed', value: data.consistency },
        { name: 'Missed', value: 100 - data.consistency }
    ];

    // Using computed styles for charts since Recharts can't read CSS variables directly for all props
    const isLight = document.documentElement.classList.contains('light');
    const chartColors = {
        primary: '#6366F1',
        muted: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        text: isLight ? '#64748B' : '#71717A',
        tooltipBg: isLight ? '#FFFFFF' : '#151518',
        tooltipBorder: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        mainText: isLight ? '#18181B' : '#F4F4F5'
    };

    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 custom-scrollbar pb-24">
            <div className="mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Insights</h1>
                <p className="text-[var(--text-secondary)] text-base sm:text-lg">Track your growth and consistency across time.</p>
            </div>

            {/* Quick Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
                <div className="p-4 sm:p-6 premium-card bg-gradient-to-br from-indigo-500/10 to-transparent">
                    <h4 className="text-indigo-500 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest">Most Completed</h4>
                    <p className="text-base sm:text-xl font-bold text-[var(--text-primary)] truncate">{data.mostCompletedHabit}</p>
                </div>
                <div className="p-4 sm:p-6 premium-card bg-gradient-to-br from-rose-500/10 to-transparent">
                    <h4 className="text-rose-500 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest">Most Missed</h4>
                    <p className="text-base sm:text-xl font-bold text-[var(--text-primary)] truncate">{data.mostMissedHabit}</p>
                </div>
                <div className="p-4 sm:p-6 premium-card bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <h4 className="text-emerald-500 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest">Weekly Avg</h4>
                    <p className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">{data.weeklySummary.percentage}%</p>
                </div>
                <div className="p-4 sm:p-6 premium-card bg-gradient-to-br from-violet-500/10 to-transparent">
                    <h4 className="text-violet-500 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-widest">Monthly Avg</h4>
                    <p className="text-2xl sm:text-4xl font-black text-[var(--text-primary)]">{data.monthlySummary.percentage}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 sm:mb-12">
                {/* Weekly Completion Bar Chart */}
                <Card title="Activity (7 Days)" className="lg:col-span-2">
                    <div className="h-[250px] sm:h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.muted} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 11 }} dy={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: '12px', border: '1px solid' }}
                                    itemStyle={{ color: chartColors.mainText }}
                                    cursor={{ fill: chartColors.muted, radius: 8 }}
                                />
                                <Bar dataKey="value" fill={chartColors.primary} radius={[6, 6, 0, 0]} animationDuration={1500} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Consistency Pie Chart */}
                <Card title="Overall Score">
                    <div className="h-[250px] sm:h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={consistencyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="75%"
                                    outerRadius="95%"
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="cell-0" fill={chartColors.primary} />
                                    <Cell key="cell-1" fill={chartColors.muted} />
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: '12px' }} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                    <tspan x="50%" dy="-0.5em" fill={chartColors.text} fontSize="12" fontWeight="500" className="uppercase tracking-widest">Score</tspan>
                                    <tspan x="50%" dy="1.5em" fill={chartColors.mainText} fontSize="36" fontWeight="800">{data.consistency}%</tspan>
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Habit Stats Table */}
            <Card title="Performance Leaderboard">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[500px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold">
                                <th className="pb-6">Habit</th>
                                <th className="pb-6">Reliability Ratio</th>
                                <th className="pb-6">Total Done</th>
                                <th className="pb-6 text-right">Momentum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {data.habitStats.map((stat) => (
                                <tr key={stat.id} className="group transition-colors hover:bg-[var(--surface-muted)]">
                                    <td className="py-6 pr-4">
                                        <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">
                                            {stat.title}
                                        </span>
                                    </td>
                                    <td className="py-6 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 sm:w-32 h-2.5 bg-[var(--surface-muted)] rounded-full overflow-hidden border border-[var(--border)]">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${stat.trend === 'Excellent' ? 'bg-emerald-500' :
                                                        stat.trend === 'Stable' ? 'bg-indigo-500' :
                                                            stat.trend === 'Needs Focus' ? 'bg-rose-500' : 'bg-neutral-600'
                                                        }`}
                                                    style={{ width: `${stat.completionRate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-[var(--text-secondary)]">{stat.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td className="py-6 text-sm text-[var(--text-secondary)] font-bold">{stat.completedCount}</td>
                                    <td className="py-6 text-right">
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${stat.trend === 'Excellent' ? 'bg-emerald-500/10 text-emerald-500' :
                                            stat.trend === 'Stable' ? 'bg-indigo-500/10 text-indigo-500' :
                                                stat.trend === 'Needs Focus' ? 'bg-rose-500/10 text-rose-500' :
                                                    'bg-neutral-500/10 text-neutral-500'
                                            }`}>
                                            {stat.trend}
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
