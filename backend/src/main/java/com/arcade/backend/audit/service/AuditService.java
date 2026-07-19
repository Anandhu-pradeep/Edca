package com.arcade.backend.audit.service;

import com.arcade.backend.audit.entity.AuditLog;
import com.arcade.backend.audit.repository.AuditLogRepository;
import com.arcade.backend.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logSecurityEvent(User user, String action, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
            log.info("Security Event: Action={}, User={}, Details={}, IP={}", action, (user != null ? user.getEmail() : "Anonymous"), details, ipAddress);
        } catch (Exception e) {
            log.error("Failed to save audit log for action: {}", action, e);
        }
    }
}
