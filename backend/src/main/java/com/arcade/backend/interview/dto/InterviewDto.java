package com.arcade.backend.interview.dto;

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
public class InterviewDto {
    private UUID id;
    private String roomId;
    private UUID interviewerId;
    private UUID intervieweeId;
    private String role;
    private ZonedDateTime scheduledAt;
    private ZonedDateTime startedAt;
    private ZonedDateTime endedAt;
    private Integer durationMinutes;
    private String status;
    private String grade;
    private String feedback;
    private ZonedDateTime createdAt;
}
