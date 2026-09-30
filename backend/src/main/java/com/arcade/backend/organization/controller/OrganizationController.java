package com.arcade.backend.organization.controller;

import com.arcade.backend.organization.dto.MyOrganizationDto;
import com.arcade.backend.organization.service.OrganizationService;
import com.arcade.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/my")
    public ResponseEntity<List<MyOrganizationDto>> getMyOrganizations(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(organizationService.getMyOrganizations(userDetails.getId()));
    }

    @GetMapping("/{organizationId}/members")
    public ResponseEntity<List<com.arcade.backend.organization.dto.OrgMemberDto>> getOrganizationMembers(
            @PathVariable java.util.UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // TODO: Validate that userDetails.getId() is a member
        return ResponseEntity.ok(organizationService.getOrganizationMembers(organizationId));
    }

    @PostMapping("/{organizationId}/members/invite")
    public ResponseEntity<Void> inviteMember(
            @PathVariable java.util.UUID organizationId,
            @jakarta.validation.Valid @RequestBody com.arcade.backend.organization.dto.InviteMemberRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // TODO: Validate that userDetails.getId() is an admin
        organizationService.inviteMember(organizationId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{organizationId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable java.util.UUID organizationId,
            @PathVariable java.util.UUID userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // TODO: Validate that userDetails.getId() is an admin
        organizationService.removeMember(organizationId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{organizationId}/request-deletion")
    public ResponseEntity<Void> requestOrganizationDeletion(
            @PathVariable java.util.UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        organizationService.requestOrganizationDeletion(organizationId, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
