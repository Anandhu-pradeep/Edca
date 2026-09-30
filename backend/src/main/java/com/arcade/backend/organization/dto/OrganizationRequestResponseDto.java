package com.arcade.backend.organization.dto;

import com.arcade.backend.organization.enums.RequestStatus;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class OrganizationRequestResponseDto {
    private UUID id;
    private String orgName;
    private String orgType;
    private String description;
    private String officialEmail;
    private String emailDomain;
    private Integer expectedStudents;
    private String contactInfo;
    private String reason;
    private String supportingInfo;
    private RequestStatus status;
    private UUID requesterId;
    private String requesterName;
    private ZonedDateTime createdAt;
}
