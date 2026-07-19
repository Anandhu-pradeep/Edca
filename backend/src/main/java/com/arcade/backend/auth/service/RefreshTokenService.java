package com.arcade.backend.auth.service;

import com.arcade.backend.audit.service.AuditService;
import com.arcade.backend.auth.entity.RefreshToken;
import com.arcade.backend.auth.entity.Session;
import com.arcade.backend.auth.repository.RefreshTokenRepository;
import com.arcade.backend.auth.repository.SessionRepository;
import com.arcade.backend.user.User;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SessionRepository sessionRepository;
    private final AuditService auditService;

    @Value("${application.security.refresh-token.expiration}")
    private long refreshTokenExpirationMs;

    @Transactional
    public String createRefreshToken(User user, UUID familyId, String ipAddress) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashedToken)
                .familyId(familyId)
                .expiresAt(ZonedDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional
    public void revokeTokenFamily(UUID familyId, String reason, String ipAddress) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByFamilyId(familyId);
        if (!tokens.isEmpty()) {
            User user = tokens.get(0).getUser();
            for (RefreshToken token : tokens) {
                token.setRevoked(true);
            }
            refreshTokenRepository.saveAll(tokens);
            
            // Revoke active sessions for this family
            List<Session> sessions = sessionRepository.findAllByRefreshTokenFamilyId(familyId);
            for (Session session : sessions) {
                session.setActive(false);
            }
            sessionRepository.saveAll(sessions);

            auditService.logSecurityEvent(user, "TOKEN_FAMILY_REVOKED", reason, ipAddress);
        }
    }

    @Transactional
    public RefreshToken verifyAndRotate(String rawToken, String ipAddress) {
        String hashedToken = hashToken(rawToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.isRevoked()) {
            // REUSE DETECTED!
            log.warn("Refresh token reuse detected for family {}", token.getFamilyId());
            revokeTokenFamily(token.getFamilyId(), "Refresh Token Reuse Detected", ipAddress);
            throw new SecurityException("Refresh token reuse detected. All sessions revoked.");
        }

        if (token.getExpiresAt().isBefore(ZonedDateTime.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new IllegalArgumentException("Refresh token expired");
        }

        // Token is valid. Rotate it.
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        return token;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
