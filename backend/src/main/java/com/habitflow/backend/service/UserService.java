package com.habitflow.backend.service;

import com.habitflow.backend.model.User;
import com.habitflow.backend.repository.UserRepository;
import com.habitflow.backend.repository.HabitRepository;
import com.habitflow.backend.repository.HabitTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitTemplateRepository habitTemplateRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUser(String email, User updatedUser) {
        return userRepository.findByEmail(email).map(user -> {
            if (updatedUser.getName() != null)
                user.setName(updatedUser.getName());
            if (updatedUser.getUsername() != null)
                user.setUsername(updatedUser.getUsername());
            if (updatedUser.getAge() != null)
                user.setAge(updatedUser.getAge());
            if (updatedUser.getHeight() != null)
                user.setHeight(updatedUser.getHeight());
            if (updatedUser.getWeight() != null)
                user.setWeight(updatedUser.getWeight());
            if (updatedUser.getProfilePicture() != null)
                user.setProfilePicture(updatedUser.getProfilePicture());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void deleteUserData(String email) {
        habitRepository.deleteByUserId(email);
        habitTemplateRepository.deleteByUserId(email);
        // Add tasks deletion if there is a task repository
    }

    @Transactional
    public void deleteUser(String email) {
        deleteUserData(email);
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
    }
}
