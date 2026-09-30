package com.arcade.backend.organization.controller;

import com.arcade.backend.organization.service.OrganizationService;
import com.arcade.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/invitations")
@RequiredArgsConstructor
public class OrganizationInvitationController {

    private final OrganizationService organizationService;

    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<Void> acceptInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        organizationService.acceptInvitation(invitationId, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable UUID invitationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        organizationService.rejectInvitation(invitationId, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
