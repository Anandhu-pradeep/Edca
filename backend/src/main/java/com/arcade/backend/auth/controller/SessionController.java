package com.arcade.backend.auth.controller;

import com.arcade.backend.auth.entity.Session;
import com.arcade.backend.auth.repository.SessionRepository;
import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.security.CustomUserDetails;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionRepository sessionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Session>>> getActiveSessions(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Session> sessions = sessionRepository.findAllByUserIdAndIsActiveTrue(userDetails.getId());
        return ResponseEntity.ok(
                ApiResponse.<List<Session>>builder()
                        .status(HttpStatus.OK.value())
                        .code("SESSIONS_RETRIEVED")
                        .message("Active sessions retrieved successfully.")
                        .data(sessions)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        
        if (!session.getUser().getId().equals(userDetails.getId())) {
            throw new SecurityException("You do not have permission to revoke this session.");
        }

        session.setActive(false);
        sessionRepository.save(session);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.OK.value())
                        .code("SESSION_REVOKED")
                        .message("Session revoked successfully.")
                        .build()
        );
    }
}
