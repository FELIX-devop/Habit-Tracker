package com.habitflow.backend.controller;

import com.habitflow.backend.model.User;
import com.habitflow.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        return userService.findByEmail(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody User user, Authentication authentication) {
        return ResponseEntity.ok(userService.updateUser(authentication.getName(), user));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        userService.deleteUser(authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me/data")
    public ResponseEntity<Void> deleteData(Authentication authentication) {
        userService.deleteUserData(authentication.getName());
        return ResponseEntity.ok().build();
    }
}
