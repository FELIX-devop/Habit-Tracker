package com.habitflow.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@Document(collection = "habits")
public class Habit {
    @Id
    private String id;

    private String userId; // Reference to User ID

    private String title;

    @CreatedDate
    private Instant createdAt;

    // Key: YYYY-MM-DD, Value: true/false
    private Map<String, Boolean> logs = new HashMap<>();

    public Habit(String userId, String title) {
        this.userId = userId;
        this.title = title;
    }
}
