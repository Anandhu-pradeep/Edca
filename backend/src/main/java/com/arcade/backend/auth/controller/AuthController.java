package com.arcade.backend.auth.controller;

import com.arcade.backend.audit.service.AuditService;
import com.arcade.backend.auth.dto.AuthResponse;
import com.arcade.backend.auth.dto.ChangePasswordRequest;
import com.arcade.backend.auth.dto.LoginRequest;
import com.arcade.backend.auth.dto.RegisterRequest;
import com.arcade.backend.auth.service.AccountRecoveryService;
import com.arcade.backend.auth.service.AuthService;
import com.arcade.backend.auth.service.RefreshTokenService;
import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final AccountRecoveryService recoveryService;
  private final RefreshTokenService refreshTokenService;
  private final AuditService auditService;

  @Value("${app.cookie.secure:true}")
  private boolean cookieSecure;

  @PostMapping("/change-password")
  public ResponseEntity<ApiResponse<Void>> changePassword(
      @Valid @RequestBody ChangePasswordRequest body,
      @AuthenticationPrincipal CustomUserDetails userDetails,
      HttpServletRequest servletRequest) {
    if (userDetails == null) {
      throw new SecurityException("Full authentication is required to access this resource.");
    }
    recoveryService.changePasswordWithOldPassword(
        userDetails.getUser(),
        body.getOldPassword(),
        body.getNewPassword(),
        getClientIp(servletRequest));

    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("CHANGE_PASSWORD_SUCCESS")
            .message("Password changed successfully.")
            .path(servletRequest.getRequestURI())
            .build());
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<AuthResponse>> register(
      @Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
    String ipAddress = getClientIp(servletRequest);
    String userAgent = servletRequest.getHeader(HttpHeaders.USER_AGENT);

    AuthResponse response = authService.register(request, ipAddress, userAgent);

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            ApiResponse.<AuthResponse>builder()
                .status(HttpStatus.CREATED.value())
                .code("REGISTER_SUCCESS")
                .message("Registration successful.")
                .data(response)
                .path(servletRequest.getRequestURI())
                .build());
  }

  @PostMapping("/register/send-otp")
  public ResponseEntity<ApiResponse<Void>> sendRegistrationOtp(
      @RequestBody Map<String, String> body, HttpServletRequest servletRequest) {
    String email = body.get("email");
    recoveryService.sendRegistrationOtp(email, getClientIp(servletRequest));

    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("SEND_OTP_SUCCESS")
            .message(
                "If the email is eligible for registration, a verification notice has been sent.")
            .path(servletRequest.getRequestURI())
            .build());
  }

  @PostMapping("/register/verify-otp")
  public ResponseEntity<ApiResponse<Void>> verifyRegistrationOtp(
      @RequestBody Map<String, String> body, HttpServletRequest servletRequest) {
    String email = body.get("email");
    String otp = body.get("otp");
    recoveryService.verifyRegistrationOtp(email, otp, getClientIp(servletRequest));

    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("VERIFY_OTP_SUCCESS")
            .message("OTP verified successfully.")
            .path(servletRequest.getRequestURI())
            .build());
  }

  @GetMapping("/check-username")
  public ResponseEntity<ApiResponse<Boolean>> checkUsername(
      @RequestParam String username, HttpServletRequest servletRequest) {
    boolean taken = authService.isUsernameTaken(username);
    return ResponseEntity.ok(
        ApiResponse.<Boolean>builder()
            .status(HttpStatus.OK.value())
            .code("CHECK_USERNAME_SUCCESS")
            .message(taken ? "Username is taken" : "Username is available")
            .data(taken)
            .path(servletRequest.getRequestURI())
            .build());
  }

  @PostMapping("/set-username")
  public ResponseEntity<ApiResponse<Void>> setUsername(
      @RequestBody Map<String, String> body,
      @AuthenticationPrincipal CustomUserDetails userDetails,
      HttpServletRequest servletRequest) {
    String email = body.get("email");
    String username = body.get("username");
    String targetEmail =
        (email != null && !email.isBlank())
            ? email
            : (userDetails != null ? userDetails.getUsername() : null);

    if (userDetails == null
        || targetEmail == null
        || !userDetails.getUsername().equalsIgnoreCase(targetEmail)) {
      throw new SecurityException(
          "You do not have permission to modify the username for this account.");
    }

    authService.setUsername(targetEmail, username);
    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("SET_USERNAME_SUCCESS")
            .message("Username set successfully.")
            .path(servletRequest.getRequestURI())
            .build());
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthResponse>> login(
      @Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
    String ipAddress = getClientIp(servletRequest);
    String userAgent = servletRequest.getHeader(HttpHeaders.USER_AGENT);

    Object[] result = authService.login(request, ipAddress, userAgent);
    AuthResponse response = (AuthResponse) result[0];
    String rawRefreshToken = (String) result[1];

    ResponseCookie cookie = createRefreshTokenCookie(rawRefreshToken);

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(
            ApiResponse.<AuthResponse>builder()
                .status(HttpStatus.OK.value())
                .code("LOGIN_SUCCESS")
                .message("Successfully logged in.")
                .data(response)
                .path(servletRequest.getRequestURI())
                .build());
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<AuthResponse>> refresh(
      @CookieValue(name = "refresh_token", required = false) String refreshToken,
      HttpServletRequest servletRequest) {
    if (refreshToken == null || refreshToken.isBlank()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(
              ApiResponse.<AuthResponse>builder()
                  .status(HttpStatus.UNAUTHORIZED.value())
                  .code("UNAUTHORIZED")
                  .message("Refresh token missing.")
                  .path(servletRequest.getRequestURI())
                  .build());
    }

    String ipAddress = getClientIp(servletRequest);
    String userAgent = servletRequest.getHeader(HttpHeaders.USER_AGENT);

    Object[] result = authService.refresh(refreshToken, ipAddress, userAgent);
    AuthResponse response = (AuthResponse) result[0];
    String newRawRefreshToken = (String) result[1];

    ResponseCookie cookie = createRefreshTokenCookie(newRawRefreshToken);

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(
            ApiResponse.<AuthResponse>builder()
                .status(HttpStatus.OK.value())
                .code("REFRESH_SUCCESS")
                .message("Token refreshed successfully.")
                .data(response)
                .path(servletRequest.getRequestURI())
                .build());
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      @CookieValue(name = "refresh_token", required = false) String refreshToken,
      @AuthenticationPrincipal CustomUserDetails userDetails,
      HttpServletRequest servletRequest) {
    String ipAddress = getClientIp(servletRequest);
    if (refreshToken != null && !refreshToken.isEmpty()) {
      refreshTokenService.revokeToken(refreshToken, ipAddress);
    }
    if (userDetails != null && userDetails.getUser() != null) {
      auditService.logSecurityEvent(
          userDetails.getUser(), "LOGOUT_SUCCESS", "User logged out securely", ipAddress);
    }

    ResponseCookie cookie =
        ResponseCookie.from("refresh_token", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Strict")
            .path("/api/v1/auth")
            .maxAge(0)
            .build();

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(
            ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .code("LOGOUT_SUCCESS")
                .message("Logged out successfully.")
                .path(servletRequest.getRequestURI())
                .build());
  }

  @PostMapping("/verify-email")
  public ResponseEntity<ApiResponse<Void>> verifyEmail(
      @RequestBody Map<String, String> body, HttpServletRequest servletRequest) {
    String email = body.get("email");
    String otp = body.get("otp");
    recoveryService.verifyEmail(email, otp, getClientIp(servletRequest));

    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("VERIFY_SUCCESS")
            .message("Email verified successfully.")
            .path(servletRequest.getRequestURI())
            .build());
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<ApiResponse<Void>> forgotPassword(
      @RequestBody Map<String, String> body, HttpServletRequest servletRequest) {
    String email = body.get("email");
    recoveryService.generatePasswordResetToken(email, getClientIp(servletRequest));

    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("FORGOT_PASSWORD_SUCCESS")
            .message("If an account exists, a reset link has been sent.")
            .path(servletRequest.getRequestURI())
            .build());
  }

  @PostMapping("/reset-password")
  public ResponseEntity<ApiResponse<Void>> resetPassword(
      @RequestBody Map<String, String> body, HttpServletRequest servletRequest) {
    String token = body.get("token");
    String newPassword = body.get("newPassword");
    recoveryService.resetPassword(token, newPassword, getClientIp(servletRequest));

    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("RESET_PASSWORD_SUCCESS")
            .message("Password reset successfully.")
            .path(servletRequest.getRequestURI())
            .build());
  }

  private ResponseCookie createRefreshTokenCookie(String token) {
    return ResponseCookie.from("refresh_token", token)
        .httpOnly(true)
        .secure(cookieSecure)
        .sameSite("Strict")
        .path("/api/v1/auth")
        .maxAge(30 * 24 * 60 * 60) // 30 days
        .build();
  }

  private String getClientIp(HttpServletRequest request) {
    String xfHeader = request.getHeader("X-Forwarded-For");
    if (xfHeader == null) {
      return request.getRemoteAddr();
    }
    return xfHeader.split(",")[0];
  }
}
