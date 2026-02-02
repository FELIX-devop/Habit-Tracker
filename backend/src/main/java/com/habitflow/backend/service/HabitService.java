package com.habitflow.backend.service;

import com.habitflow.backend.model.Habit;
import com.habitflow.backend.model.User;
import com.habitflow.backend.repository.HabitRepository;
import com.habitflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Habit createHabit(String email, String title) {
        User user = getUserByEmail(email);
        Habit habit = new Habit(user.getId(), title);
        habit.setCreatedAt(Instant.now());
        return habitRepository.save(habit);
    }

    public List<Habit> getUserHabits(String email) {
        User user = getUserByEmail(email);
        return habitRepository.findByUserId(user.getId());
    }

    public Habit toggleHabit(String habitId, String email, String dateStr) {
        // 1. Validate Date Format
        LocalDate requestDate;
        try {
            requestDate = LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
        }

        // 2. Strict Date Validation
        LocalDate today = LocalDate.now();

        if (requestDate.isAfter(today)) {
            throw new IllegalArgumentException("Cannot update future dates!");
        }

        if (!requestDate.isEqual(today)) {
            throw new IllegalArgumentException(
                    "You can only update the status for TODAY (" + today + "). Past dates are read-only.");
        }

        // 3. Fetch & Update
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        User user = getUserByEmail(email);

        if (!habit.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to habit");
        }

        Boolean currentStatus = habit.getLogs().getOrDefault(dateStr, false);
        habit.getLogs().put(dateStr, !currentStatus);

        return habitRepository.save(habit);
    }

    public void deleteHabit(String habitId, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        User user = getUserByEmail(email);

        if (!habit.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to habit");
        }

        habitRepository.delete(habit);
    }

    public Habit updateHabit(String habitId, String email, String newTitle) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        User user = getUserByEmail(email);

        if (!habit.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to habit");
        }

        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("Habit title cannot be empty");
        }

        habit.setTitle(newTitle.trim());
        return habitRepository.save(habit);
    }
}
