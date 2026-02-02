package com.habitflow.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String username;

    private String password;
    private String name;
    private String age;
    private String height;
    private String weight;
    private String profilePicture;

    @CreatedDate
    private Instant createdAt;

    public User(String email, String password) {
        this.email = email;
        this.password = password;
        this.username = email.split("@")[0]; // Default username
    }
}
