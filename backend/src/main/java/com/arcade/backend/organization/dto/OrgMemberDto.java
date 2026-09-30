package com.arcade.backend.organization.dto;

import com.arcade.backend.organization.enums.OrgRoleType;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.time.ZonedDateTime;

@Data
@Builder
public class OrgMemberDto {
    private UUID membershipId;
    private UUID userId;
    private String name;
    private String email;
    private OrgRoleType role;
    private boolean isActive;
    private ZonedDateTime joinedAt;
}
