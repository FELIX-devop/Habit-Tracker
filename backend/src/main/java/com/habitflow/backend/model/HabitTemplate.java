package com.habitflow.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "habit_templates")
public class HabitTemplate {
    @Id
    private String id;
    private String userId;
    private String name;
    private List<String> habitTitles;

    public HabitTemplate(String userId, String name, List<String> habitTitles) {
        this.userId = userId;
        this.name = name;
        this.habitTitles = habitTitles;
    }
}
