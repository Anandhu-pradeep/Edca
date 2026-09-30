package com.arcade.backend.organization.controller;

import com.arcade.backend.organization.dto.OrganizationRequestCreateDto;
import com.arcade.backend.organization.dto.OrganizationRequestResponseDto;
import com.arcade.backend.organization.service.OrganizationRequestService;
import com.arcade.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organization-requests")
@RequiredArgsConstructor
public class OrganizationRequestController {

    private final OrganizationRequestService requestService;

    @PostMapping
    public ResponseEntity<OrganizationRequestResponseDto> createRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody OrganizationRequestCreateDto dto) {
        return ResponseEntity.ok(requestService.createRequest(userDetails.getId(), dto));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<OrganizationRequestResponseDto>> getMyRequests(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(requestService.getUserRequests(userDetails.getId()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<OrganizationRequestResponseDto>> getPendingRequests() {
        return ResponseEntity.ok(requestService.getPendingRequests());
    }

    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> approveRequest(@PathVariable UUID requestId) {
        requestService.approveRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> rejectRequest(@PathVariable UUID requestId) {
        requestService.rejectRequest(requestId);
        return ResponseEntity.ok().build();
    }
}
