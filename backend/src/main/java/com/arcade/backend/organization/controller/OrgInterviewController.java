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

    @PostMapping("/schedule/class/{classId}")
    public ResponseEntity<Void> scheduleClassInterviews(
            @PathVariable UUID organizationId,
            @PathVariable UUID classId,
            @RequestBody ScheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        // Ensure user exists
        User interviewer = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        orgInterviewService.scheduleClassInterviews(organizationId, classId, request.getRole(), interviewer);
        
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ScheduleRequest {
        private String role;
    }
}
