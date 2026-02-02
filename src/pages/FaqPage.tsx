import { useState } from 'react';
import { ChevronDown, HelpCircle, Target, Zap, Shield, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const FAQ_ITEMS = [
    {
        question: "How does the streak system work?",
        answer: "A streak is calculated based on consecutive days of habit completion. If you miss a day, the streak resets to zero. Consistency is key to building long-term habits!",
        icon: Zap,
        color: "text-amber-500"
    },
    {
        question: "Can I edit logs for past dates?",
        answer: "Currently, logs are read-only for past dates to ensure the integrity of your habit tracking history. You focus on winning 'Today'!",
        icon: Target,
        color: "text-indigo-500"
    },
    {
        question: "How is the Overall Score calculated?",
        answer: "Your Overall Score (Consistency) is the percentage of completed tasks relative to the total possible tasks across all your active habits.",
        icon: Sparkles,
        color: "text-violet-500"
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we use industry-standard encryption for your data and passwords. Your personal information is never shared with third parties.",
        icon: Shield,
        color: "text-emerald-500"
    }
];

function FaqItem({ item }: { item: typeof FAQ_ITEMS[0] }) {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = item.icon;

    return (
        <div className="premium-card overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--surface-muted)] transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={clsx("p-2 rounded-xl bg-[var(--surface-muted)]", item.color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">{item.question}</span>
                </div>
                <ChevronDown className={clsx("w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <div className={clsx(
                "overflow-hidden transition-all duration-300 bg-[var(--surface-muted)]/50",
                isOpen ? "max-h-40 p-6 pt-0 border-t border-[var(--border)]" : "max-h-0"
            )}>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium pt-4">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

export default function FaqPage() {
    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 custom-scrollbar pb-24">
            <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mx-auto mb-6">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Frequently Asked Questions</h1>
                <p className="text-[var(--text-secondary)]">Everything you need to know about HabitFlow.</p>
            </div>

            <div className="space-y-4">
                {FAQ_ITEMS.map((item, i) => (
                    <FaqItem key={i} item={item} />
                ))}
            </div>

            <div className="mt-12 p-8 premium-card bg-gradient-to-br from-indigo-500/10 to-transparent text-center">
                <h3 className="font-bold text-[var(--text-primary)] mb-2">Still have questions?</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6 font-medium">We're here to help you on your journey.</p>
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
                    Contact Support
                </button>
            </div>
        </div>
    );
}
