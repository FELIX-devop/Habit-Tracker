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
        
        // 1. Weekly Data (Last 7 days)
        List<AnalyticsResponse.DailyData> weeklyData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        // Start from 6 days ago
        LocalDate startOfWeek = today.minusDays(6);
        
        int totalHabits = habits.size();
        int totalOpportunities = 0;
        int totalCompleted = 0;

        for (int i = 0; i < 7; i++) {
            LocalDate date = startOfWeek.plusDays(i);
            String dateStr = date.toString();
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            
            int dailyCount = 0;
            for (Habit habit : habits) {
                if (habit.getLogs().getOrDefault(dateStr, false)) {
                    dailyCount++;
                    totalCompleted++;
                }
            }
            if (totalHabits > 0) {
                 totalOpportunities += totalHabits;
            }

            weeklyData.add(AnalyticsResponse.DailyData.builder()
                    .name(dayName)
                    .value(dailyCount)
                    .build());
        }

        // 2. Streak Trend (Same data but maybe structured differently? 
        // For line chart "Streak Trend", usually shows accumulated streak? 
        // Or just consistency over time. I'll reuse weekly logs for now.)
        
        // 3. Current Streak (Global - at least 1 habit done per day)
        int currentStreak = calculateStreak(habits, today);

        // 4. Consistency
        double consistency = totalOpportunities == 0 ? 0 : ((double) totalCompleted / totalOpportunities) * 100;

        return AnalyticsResponse.builder()
                .weeklyData(weeklyData)
                .steakTrend(weeklyData) // Reuse for now
                .currentStreak(currentStreak)
                .totalCompleted(totalCompleted)
                .consistency(Math.round(consistency * 10.0) / 10.0)
                .build();
    }

    private int calculateStreak(List<Habit> habits, LocalDate today) {
        int streak = 0;
        LocalDate date = today;
        
        // If today has 0 completions, check if we should count yesterday (did user break streak today or just hasn't done it yet?)
        // Usually, if today is incomplete, streak stands from yesterday.
        // But let's check consecutive days backwards.
        
        if (hasCompletionOnDate(habits, date)) {
            streak++;
        } else {
             // If today is empty, streak doesn't reset until tomorrow. 
             // But for calculation, we check yesterday.
             // If yesterday is empty, streak is 0.
        }
        
        date = date.minusDays(1);
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
