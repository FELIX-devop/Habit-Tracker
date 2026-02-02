package com.habitflow.backend.service;

import com.habitflow.backend.model.Habit;
import com.habitflow.backend.model.HabitTemplate;
import com.habitflow.backend.model.User;
import com.habitflow.backend.repository.HabitRepository;
import com.habitflow.backend.repository.HabitTemplateRepository;
import com.habitflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final HabitTemplateRepository templateRepository;
    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public HabitTemplate createTemplate(String email, String name, List<String> habitTitles) {
        User user = getUserByEmail(email);
        HabitTemplate template = new HabitTemplate(user.getId(), name, habitTitles);
        return templateRepository.save(template);
    }

    public List<HabitTemplate> getUserTemplates(String email) {
        User user = getUserByEmail(email);
        return templateRepository.findByUserId(user.getId());
    }

    public void deleteTemplate(String id, String email) {
        User user = getUserByEmail(email);
        HabitTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        templateRepository.delete(template);
    }

    public List<Habit> applyTemplate(String id, String email) {
        User user = getUserByEmail(email);
        HabitTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        List<Habit> existingHabits = habitRepository.findByUserId(user.getId());
        Set<String> existingTitles = existingHabits.stream()
                .map(Habit::getTitle)
                .collect(Collectors.toSet());

        List<Habit> newlyCreated = new ArrayList<>();
        for (String title : template.getHabitTitles()) {
            if (!existingTitles.contains(title)) {
                Habit newHabit = new Habit(user.getId(), title);
                newHabit.setCreatedAt(Instant.now());
                newlyCreated.add(habitRepository.save(newHabit));
            }
        }

        List<Habit> result = new ArrayList<>(existingHabits);
        result.addAll(newlyCreated);
        return result;
    }
}
