package com.arcade.backend.organization.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrganizationRequestCreateDto {

    @NotBlank(message = "Organization name is required")
    private String orgName;

    @NotBlank(message = "Organization type is required")
    private String orgType;

    private String description;

    @Email(message = "Valid official email is required")
    @NotBlank(message = "Official email is required")
    private String officialEmail;

    @NotBlank(message = "Email domain is required")
    private String emailDomain;

    @NotNull(message = "Expected number of students is required")
    private Integer expectedStudents;

    @NotBlank(message = "Contact information is required")
    private String contactInfo;

    @NotBlank(message = "Reason for request is required")
    private String reason;

    private String supportingInfo;
}
