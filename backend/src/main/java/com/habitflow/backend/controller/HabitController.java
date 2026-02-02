package com.habitflow.backend.controller;

import com.habitflow.backend.dto.HabitRequest;
import com.habitflow.backend.dto.UpdateHabitRequest;
import com.habitflow.backend.model.Habit;
import com.habitflow.backend.service.HabitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @PostMapping
    public ResponseEntity<Habit> createHabit(@RequestBody HabitRequest request, Authentication authentication) {
        return ResponseEntity.ok(habitService.createHabit(authentication.getName(), request.getTitle()));
    }

    @GetMapping
    public ResponseEntity<List<Habit>> getHabits(Authentication authentication) {
        return ResponseEntity.ok(habitService.getUserHabits(authentication.getName()));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggleHabit(@PathVariable String id, @RequestParam String date,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(habitService.toggleHabit(id, authentication.getName(), date));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable String id, Authentication authentication) {
        try {
            habitService.deleteHabit(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHabit(@PathVariable String id, @RequestBody UpdateHabitRequest request,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(habitService.updateHabit(id, authentication.getName(), request.getTitle()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
