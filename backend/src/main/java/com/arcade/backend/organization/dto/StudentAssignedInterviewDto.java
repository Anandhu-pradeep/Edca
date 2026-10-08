package com.arcade.backend.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignedInterviewDto {
    private UUID assignmentId;
    private UUID interviewId;
    private String roomId;
    private String role;
    private String className;
    private String status;
    private ZonedDateTime scheduledAt;
    private String grade;
    private Integer durationMinutes;
}
