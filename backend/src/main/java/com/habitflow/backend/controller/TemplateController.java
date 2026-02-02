package com.habitflow.backend.controller;

import com.habitflow.backend.dto.TemplateRequest;
import com.habitflow.backend.model.HabitTemplate;
import com.habitflow.backend.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping
    public ResponseEntity<HabitTemplate> createTemplate(@RequestBody TemplateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                templateService.createTemplate(authentication.getName(), request.getName(), request.getHabitTitles()));
    }

    @GetMapping
    public ResponseEntity<List<HabitTemplate>> getTemplates(Authentication authentication) {
        return ResponseEntity.ok(templateService.getUserTemplates(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable String id, Authentication authentication) {
        try {
            templateService.deleteTemplate(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyTemplate(@PathVariable String id, Authentication authentication) {
        try {
            return ResponseEntity.ok(templateService.applyTemplate(id, authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
