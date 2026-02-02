package com.habitflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private List<DailyData> weeklyData;
    private List<DailyData> steakTrend;
    private int currentStreak;
    private int totalCompleted;
    private double consistency;

    // New fields
    private List<HabitStat> habitStats;
    private String mostCompletedHabit;
    private String mostMissedHabit;
    private SummaryStats weeklySummary;
    private SummaryStats monthlySummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyData {
        private String name;
        private int value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HabitStat {
        private String id;
        private String title;
        private double completionRate;
        private int completedCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStats {
        private int totalPossible;
        private int totalDone;
        private double percentage;
    }
}
