package com.habitflow.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AnalyticsResponse {
    private List<DailyData> weeklyData;
    private List<DailyData> steakTrend;
    private double consistency;
    private int currentStreak;
    private int totalCompleted;

    @Data
    @Builder
    public static class DailyData {
        private String name; // "Mon", "Tue" or Date
        private int value;   // Count
    }
}
