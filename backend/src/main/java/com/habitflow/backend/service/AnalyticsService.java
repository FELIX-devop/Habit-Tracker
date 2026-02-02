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

        // 1. Weekly Chart Data (Last 7 days)
        List<AnalyticsResponse.DailyData> weeklyData = new ArrayList<>();
        LocalDate startOfWeek = today.minusDays(6);

        for (int i = 0; i < 7; i++) {
            LocalDate date = startOfWeek.plusDays(i);
            String dateStr = date.toString();
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            int dailyCount = 0;
            for (Habit habit : habits) {
                if (habit.getLogs().getOrDefault(dateStr, false)) {
                    dailyCount++;
                }
            }
            weeklyData.add(AnalyticsResponse.DailyData.builder()
                    .name(dayName)
                    .value(dailyCount)
                    .build());
        }

        // 2. Habit Stats & Best/Worst
        List<AnalyticsResponse.HabitStat> habitStats = new ArrayList<>();
        String mostCompleted = "None";
        String mostMissed = "None";
        int maxCompleted = -1;
        int minCompleted = Integer.MAX_VALUE;

        // We'll calculate stats based on the last 30 days for each habit
        LocalDate thirtyDaysAgo = today.minusDays(29);

        for (Habit habit : habits) {
            int completedCount = 0;
            int totalPossible = 0;

            // Check logs from creation date or 30 days ago, whichever is later
            LocalDate createdDate = habit.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            LocalDate calculationStart = createdDate.isAfter(thirtyDaysAgo) ? createdDate : thirtyDaysAgo;

            for (LocalDate d = calculationStart; !d.isAfter(today); d = d.plusDays(1)) {
                totalPossible++;
                if (habit.getLogs().getOrDefault(d.toString(), false)) {
                    completedCount++;
                }
            }

            double rate = totalPossible == 0 ? 0 : ((double) completedCount / totalPossible) * 100;
            rate = Math.round(rate * 10.0) / 10.0;

            habitStats.add(AnalyticsResponse.HabitStat.builder()
                    .id(habit.getId())
                    .title(habit.getTitle())
                    .completedCount(completedCount)
                    .completionRate(rate)
                    .build());

            if (completedCount > maxCompleted) {
                maxCompleted = completedCount;
                mostCompleted = habit.getTitle();
            }
            if (completedCount < minCompleted) {
                minCompleted = completedCount;
                mostMissed = habit.getTitle();
            }
        }

        if (habits.isEmpty()) {
            mostCompleted = "N/A";
            mostMissed = "N/A";
        }

        // 3. Weekly & Monthly Summary
        AnalyticsResponse.SummaryStats weeklySummary = calculateSummary(habits, today, 7);
        AnalyticsResponse.SummaryStats monthlySummary = calculateSummary(habits, today, 30);

        // 4. Global Stats
        int currentStreak = calculateStreak(habits, today);
        int totalCompleted = habits.stream().mapToInt(h -> (int) h.getLogs().values().stream().filter(v -> v).count())
                .sum();

        return AnalyticsResponse.builder()
                .weeklyData(weeklyData)
                .steakTrend(weeklyData)
                .currentStreak(currentStreak)
                .totalCompleted(totalCompleted)
                .consistency(weeklySummary.getPercentage())
                .habitStats(habitStats)
                .mostCompletedHabit(mostCompleted)
                .mostMissedHabit(mostMissed)
                .weeklySummary(weeklySummary)
                .monthlySummary(monthlySummary)
                .build();
    }

    private AnalyticsResponse.SummaryStats calculateSummary(List<Habit> habits, LocalDate today, int days) {
        int totalPossible = 0;
        int totalDone = 0;

        for (int i = 0; i < days; i++) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.toString();
            for (Habit habit : habits) {
                // Only count days since habit was created
                LocalDate createdDate = habit.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                if (!date.isBefore(createdDate)) {
                    totalPossible++;
                    if (habit.getLogs().getOrDefault(dateStr, false)) {
                        totalDone++;
                    }
                }
            }
        }

        double percentage = totalPossible == 0 ? 0 : ((double) totalDone / totalPossible) * 100;
        return AnalyticsResponse.SummaryStats.builder()
                .totalPossible(totalPossible)
                .totalDone(totalDone)
                .percentage(Math.round(percentage * 10.0) / 10.0)
                .build();
    }

    private int calculateStreak(List<Habit> habits, LocalDate today) {
        int streak = 0;
        LocalDate date = today;

        // If today is empty, we check yesterday to see if streak is still alive
        if (!hasCompletionOnDate(habits, date)) {
            date = date.minusDays(1);
        }

        while (hasCompletionOnDate(habits, date)) {
            streak++;
            date = date.minusDays(1);
        }
        return streak;
    }

    private boolean hasCompletionOnDate(List<Habit> habits, LocalDate date) {
        String dateStr = date.toString();
        for (Habit h : habits) {
            if (h.getLogs().getOrDefault(dateStr, false)) {
                return true;
            }
        }
        return false;
    }
}
