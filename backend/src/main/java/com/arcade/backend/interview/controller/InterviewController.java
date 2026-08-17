package com.arcade.backend.interview.controller;

import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.interview.dto.DashboardStatsDto;
import com.arcade.backend.interview.dto.InterviewDto;
import com.arcade.backend.interview.dto.InterviewRequest;
import com.arcade.backend.interview.service.InterviewService;
import com.arcade.backend.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.arcade.backend.user.User;
import java.io.PrintWriter;
import java.io.StringWriter;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        
        DashboardStatsDto stats = interviewService.getDashboardStats(userDetails.getUser().getId());
        
        return ResponseEntity.ok(
                ApiResponse.<DashboardStatsDto>builder()
                        .status(HttpStatus.OK.value())
                        .code("STATS_RETRIEVED")
                        .message("Dashboard stats retrieved successfully.")
                        .data(stats)
                        .path(request.getRequestURI())
                        .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewDto>> createInterview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody InterviewRequest interviewRequest,
            HttpServletRequest request) {
        
        InterviewDto interview = interviewService.createInterview(userDetails.getUser().getId(), interviewRequest);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<InterviewDto>builder()
                        .status(HttpStatus.CREATED.value())
                        .code("INTERVIEW_CREATED")
                        .message("Interview created successfully.")
                        .data(interview)
                        .path(request.getRequestURI())
                        .build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<InterviewDto>> completeInterview(
            @PathVariable UUID id,
            @RequestParam String grade,
            @RequestParam(required = false) String feedback,
            @RequestParam(required = false, defaultValue = "30") Integer durationMinutes,
            HttpServletRequest request) {
        
        InterviewDto interview = interviewService.completeInterview(id, grade, feedback, durationMinutes);
        
        return ResponseEntity.ok(
                ApiResponse.<InterviewDto>builder()
                        .status(HttpStatus.OK.value())
                        .code("INTERVIEW_COMPLETED")
                        .message("Interview completed successfully.")
                        .data(interview)
                        .path(request.getRequestURI())
                        .build());
    }
    @GetMapping("/test-create")
    public ResponseEntity<String> testCreate() {
        try {
            User firstUser = interviewService.getUserRepository().findAll().get(0);
            InterviewRequest req = new InterviewRequest();
            req.setRole("Test Role");
            req.setScheduledAt(java.time.ZonedDateTime.now());
            interviewService.createInterview(firstUser.getId(), req);
            return ResponseEntity.ok("Success!");
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            return ResponseEntity.status(500).body(sw.toString());
        }
    }
}
