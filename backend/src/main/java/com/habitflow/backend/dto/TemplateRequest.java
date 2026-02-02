package com.habitflow.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class TemplateRequest {
    private String name;
    private List<String> habitTitles;
}
