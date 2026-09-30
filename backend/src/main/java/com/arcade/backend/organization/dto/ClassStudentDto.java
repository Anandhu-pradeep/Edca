package com.arcade.backend.organization.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.time.ZonedDateTime;

@Data
@Builder
public class ClassStudentDto {
    private UUID membershipId;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private ZonedDateTime joinedAt;
}
