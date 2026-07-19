package com.arcade.backend.audit.controller;

import com.arcade.backend.audit.entity.AuditLog;
import com.arcade.backend.audit.repository.AuditLogRepository;
import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.security.CustomUserDetails;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/security/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<AuditLog> logs = auditLogRepository.findAllByUserIdOrderByCreatedAtDesc(userDetails.getId());
        
        return ResponseEntity.ok(
                ApiResponse.<List<AuditLog>>builder()
                        .status(HttpStatus.OK.value())
                        .code("AUDIT_LOGS_RETRIEVED")
                        .message("Audit logs retrieved successfully.")
                        .data(logs)
                        .build()
        );
    }
}
