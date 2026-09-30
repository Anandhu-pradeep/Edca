package com.arcade.backend.organization.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateClassRequest {
    @NotBlank(message = "Class name is required")
    private String name;
    private String description;
    private String academicYear;
}
