package com.habitflow.backend.service;

import com.habitflow.backend.dto.AnalyticsResponse;
import com.habitflow.backend.model.Habit;
import com.habitflow.backend.model.User;
import com.habitflow.backend.repository.HabitRepository;
import com.habitflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    public AnalyticsResponse getAnalytics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Habit> habits = habitRepository.findByUserId(user.getId());
        LocalDate today = LocalDate.now();

        // Edge case: No habits
        if (habits.isEmpty()) {
            return createEmptyResponse();
        }

        // 1. LAST 7 DAYS ACTIVITY (BAR CHART)
        List<AnalyticsResponse.DailyData> weeklyActivity = new ArrayList<>();
        LocalDate startOfActivity = today.minusDays(6);
        for (int i = 0; i < 7; i++) {
            LocalDate date = startOfActivity.plusDays(i);
            String dateStr = date.toString();
            int count = 0;
            for (Habit h : habits) {
                if (h.getLogs().getOrDefault(dateStr, false)) {
                    count++;
                }
            }
            weeklyActivity.add(new AnalyticsResponse.DailyData(
                    date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    count));
        }

        // 2. HABIT PERFORMANCE (30 DAYS RANGE)
        List<AnalyticsResponse.HabitStat> habitStats = new ArrayList<>();
        List<HabitCalculation> calcs = new ArrayList<>();

        LocalDate thirtyDaysAgo = today.minusDays(29);

        for (Habit habit : habits) {
            HabitCalculation calc = calculateForHabit(habit, thirtyDaysAgo, today);
            if (calc.totalDays > 0) {
                calcs.add(calc);
                habitStats.add(AnalyticsResponse.HabitStat.builder()
                        .id(habit.getId())
                        .title(habit.getTitle())
                        .completedCount(calc.completedDays)
                        .completionRate(Math.round(calc.completionRate * 10.0) / 10.0)
                        .trend(determineTrend(calc.completionRate, calc.totalDays))
                        .build());
            }
        }

        // Edge case: No applicable habits in range
        if (calcs.isEmpty()) {
            return createEmptyResponse();
        }

        // 3. MOST COMPLETED HABIT
        // Formula: MAX(completedDays). Tie: higher completionRate, then most recent
        // activity.
        HabitCalculation bestHabit = calcs.stream()
                .max(Comparator.comparingInt((HabitCalculation c) -> c.completedDays)
                        .thenComparingDouble(c -> c.completionRate)
                        .thenComparing(c -> c.lastActivityDate != null ? c.lastActivityDate : LocalDate.MIN))
                .orElse(null);

        // 4. MOST MISSED HABIT
        // Formula: MAX(missedDays).
        HabitCalculation worstHabit = calcs.stream()
                .max(Comparator.comparingInt((HabitCalculation c) -> c.missedDays)
                        .thenComparingDouble(c -> -c.completionRate)) // Secondary: lower completion rate
                .orElse(null);

        String mostCompletedStr = bestHabit != null ? bestHabit.title : "None";
        String mostMissedStr = "None 🎉";
        if (worstHabit != null && worstHabit.missedDays > 0) {
            mostMissedStr = worstHabit.title;
        }

        // 5. WEEKLY & MONTHLY SUMMARIES
        // Formula: (sum of completedDays) / (sum of totalDays) * 100
        AnalyticsResponse.SummaryStats weeklySummary = calculateOverallSummary(habits, today.minusDays(6), today);
        AnalyticsResponse.SummaryStats monthlySummary = calculateOverallSummary(habits, today.minusDays(29), today);

        // 6. GLOBAL STATS
        int currentStreak = calculateStreak(habits, today);
        int totalCompletedOverall = habits.stream()
                .mapToInt(h -> (int) h.getLogs().values().stream().filter(v -> v).count()).sum();

        return AnalyticsResponse.builder()
                .weeklyData(weeklyActivity)
                .steakTrend(weeklyActivity) // Reusing weekly data for trend visual
                .currentStreak(currentStreak)
                .totalCompleted(totalCompletedOverall)
                .consistency(weeklySummary.getPercentage())
                .habitStats(habitStats)
                .mostCompletedHabit(mostCompletedStr)
                .mostMissedHabit(mostMissedStr)
                .weeklySummary(weeklySummary)
                .monthlySummary(monthlySummary)
                .build();
    }

    private AnalyticsResponse createEmptyResponse() {
        AnalyticsResponse.SummaryStats zeroSummary = new AnalyticsResponse.SummaryStats(0, 0, 0);
        return AnalyticsResponse.builder()
                .weeklyData(new ArrayList<>())
                .steakTrend(new ArrayList<>())
                .habitStats(new ArrayList<>())
                .mostCompletedHabit("No data yet")
                .mostMissedHabit("--")
                .weeklySummary(zeroSummary)
                .monthlySummary(zeroSummary)
                .build();
    }

    private HabitCalculation calculateForHabit(Habit habit, LocalDate start, LocalDate end) {
        LocalDate creationDate = habit.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        LocalDate calcStart = creationDate.isAfter(start) ? creationDate : start;

        int totalDays = 0;
        int completedDays = 0;
        LocalDate lastActivity = null;

        for (LocalDate d = calcStart; !d.isAfter(end); d = d.plusDays(1)) {
            totalDays++;
            if (habit.getLogs().getOrDefault(d.toString(), false)) {
                completedDays++;
                lastActivity = d;
            }
        }

        double rate = totalDays == 0 ? 0 : ((double) completedDays / totalDays) * 100;
        return new HabitCalculation(habit.getTitle(), totalDays, completedDays, rate, lastActivity);
    }

    private String determineTrend(double rate, int totalDays) {
        if (totalDays < 3)
            return "Insufficient Data";
        if (rate < 60)
            return "Needs Focus";
        if (rate <= 85)
            return "Stable";
        return "Excellent";
    }

    private AnalyticsResponse.SummaryStats calculateOverallSummary(List<Habit> habits, LocalDate start, LocalDate end) {
        int totalPossible = 0;
        int totalDone = 0;

        for (Habit h : habits) {
            LocalDate creationDate = h.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            LocalDate effectiveStart = creationDate.isAfter(start) ? creationDate : start;

            for (LocalDate d = effectiveStart; !d.isAfter(end); d = d.plusDays(1)) {
                totalPossible++;
                if (h.getLogs().getOrDefault(d.toString(), false)) {
                    totalDone++;
                }
            }
        }

        double percentage = totalPossible == 0 ? 0 : ((double) totalDone / totalPossible) * 100;
        return new AnalyticsResponse.SummaryStats(totalPossible, totalDone, Math.round(percentage * 10.0) / 10.0);
    }

    private static class HabitCalculation {
        String title;
        int totalDays;
        int completedDays;
        int missedDays;
        double completionRate;
        LocalDate lastActivityDate;

        HabitCalculation(String title, int totalDays, int completedDays, double rate, LocalDate lastActivity) {
            this.title = title;
            this.totalDays = totalDays;
            this.completedDays = completedDays;
            this.missedDays = totalDays - completedDays;
            this.completionRate = rate;
            this.lastActivityDate = lastActivity;
        }
    }

    // Reuse existing helper methods for streak
    private int calculateStreak(List<Habit> habits, LocalDate today) {
        int streak = 0;
        LocalDate date = today;
        if (!hasCompletionOnDate(habits, date))
            date = date.minusDays(1);
        while (hasCompletionOnDate(habits, date)) {
            streak++;
            date = date.minusDays(1);
        }
        return streak;
    }

    private boolean hasCompletionOnDate(List<Habit> habits, LocalDate date) {
        String dateStr = date.toString();
        return habits.stream().anyMatch(h -> h.getLogs().getOrDefault(dateStr, false));
    }
}
