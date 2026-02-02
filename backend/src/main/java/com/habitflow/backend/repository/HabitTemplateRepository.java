package com.habitflow.backend.repository;

import com.habitflow.backend.model.HabitTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitTemplateRepository extends MongoRepository<HabitTemplate, String> {
    List<HabitTemplate> findByUserId(String userId);

    void deleteByUserId(String userId);
}
