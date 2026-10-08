package com.arcade.backend.organization.controller;

import com.arcade.backend.organization.service.OrgInterviewService;
import com.arcade.backend.security.CustomUserDetails;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/interviews")
@RequiredArgsConstructor
public class OrgInterviewController {

    private final OrgInterviewService orgInterviewService;
    private final UserRepository userRepository;
    private final com.arcade.backend.organization.service.OrganizationService organizationService;

    @PostMapping("/schedule/class/{classId}")
    public ResponseEntity<Void> scheduleClassInterviews(
            @PathVariable UUID organizationId,
            @PathVariable UUID classId,
            @RequestBody ScheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgAdmin(organizationId, userDetails.getId());

        // Ensure user exists
        User interviewer = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        orgInterviewService.scheduleClassInterviews(organizationId, classId, request.getRole(), request.getScheduledAt(), interviewer);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-assigned")
    public ResponseEntity<java.util.List<com.arcade.backend.organization.dto.StudentAssignedInterviewDto>> getMyAssignedInterviews(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgMember(organizationId, userDetails.getId());
        return ResponseEntity.ok(orgInterviewService.getMyAssignedInterviews(organizationId, userDetails.getId()));
    }

    @Data
    public static class ScheduleRequest {
        private String role;
        private java.time.ZonedDateTime scheduledAt;
    }
}
