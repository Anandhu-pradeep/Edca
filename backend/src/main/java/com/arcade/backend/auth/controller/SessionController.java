package com.arcade.backend.auth.controller;

import com.arcade.backend.auth.dto.SessionResponseDto;
import com.arcade.backend.auth.entity.Session;
import com.arcade.backend.auth.repository.SessionRepository;
import com.arcade.backend.auth.service.RefreshTokenService;
import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

  private final SessionRepository sessionRepository;
  private final RefreshTokenService refreshTokenService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<SessionResponseDto>>> getActiveSessions(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    List<Session> sessions = sessionRepository.findAllByUserIdAndIsActiveTrue(userDetails.getId());
    List<SessionResponseDto> dtoList =
        sessions.stream()
            .map(
                s ->
                    SessionResponseDto.builder()
                        .id(s.getId())
                        .ipAddress(s.getIpAddress())
                        .device(s.getDevice())
                        .browser(s.getBrowser())
                        .operatingSystem(s.getOperatingSystem())
                        .country(s.getCountry())
                        .loginTime(s.getLoginTime())
                        .lastActivity(s.getLastActivity())
                        .isActive(s.isActive())
                        .build())
            .toList();
    return ResponseEntity.ok(
        ApiResponse.<List<SessionResponseDto>>builder()
            .status(HttpStatus.OK.value())
            .code("SESSIONS_RETRIEVED")
            .message("Active sessions retrieved successfully.")
            .data(dtoList)
            .build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> revokeSession(
      @PathVariable UUID id,
      @AuthenticationPrincipal CustomUserDetails userDetails,
      HttpServletRequest request) {
    Session session =
        sessionRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Session not found"));

    if (!session.getUser().getId().equals(userDetails.getId())) {
      throw new SecurityException("You do not have permission to revoke this session.");
    }

    if (session.getRefreshTokenFamilyId() != null) {
      refreshTokenService.revokeTokenFamily(
          session.getRefreshTokenFamilyId(),
          "User revoked session via dashboard",
          request.getRemoteAddr());
    } else {
      session.setActive(false);
      sessionRepository.save(session);
    }

    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("SESSION_REVOKED")
            .message("Session revoked successfully.")
            .build());
  }
}
