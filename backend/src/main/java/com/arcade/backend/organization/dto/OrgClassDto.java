package com.arcade.backend.organization.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.time.ZonedDateTime;

@Data
@Builder
public class OrgClassDto {
    private UUID id;
    private UUID organizationId;
    private String name;
    private String description;
    private String academicYear;
    private int studentCount;
    private ZonedDateTime createdAt;
}
