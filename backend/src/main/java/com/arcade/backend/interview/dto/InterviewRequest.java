package com.arcade.backend.interview.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.time.ZonedDateTime;

@Data
public class InterviewRequest {
    @NotBlank(message = "Role is required")
    private String role;
    private ZonedDateTime scheduledAt;
}
