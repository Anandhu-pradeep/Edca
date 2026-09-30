package com.arcade.backend.organization.dto;

import com.arcade.backend.organization.enums.OrgRoleType;
import lombok.Data;
import java.util.UUID;

@Data
public class MyOrganizationDto {
    private UUID organizationId;
    private String name;
    private String type;
    private OrgRoleType role;
}
