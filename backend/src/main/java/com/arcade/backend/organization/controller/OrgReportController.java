package com.arcade.backend.organization.controller;

import com.arcade.backend.organization.dto.OrgReportDto;
import com.arcade.backend.organization.service.OrgReportService;
import com.arcade.backend.organization.service.OrganizationService;
import com.arcade.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/reports")
@RequiredArgsConstructor
public class OrgReportController {

    private final OrgReportService orgReportService;
    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<OrgReportDto> getReports(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgMember(organizationId, userDetails.getId());
        return ResponseEntity.ok(orgReportService.getOrganizationReport(organizationId));
    }
}
