package com.arcade.backend.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ConsumeInterviewRequest {
    @NotNull
    private UUID interviewId;
}
