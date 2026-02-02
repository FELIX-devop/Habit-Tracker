package com.habitflow.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
}
