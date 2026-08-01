package com.arcade.backend.auth.service;

import com.arcade.backend.audit.service.AuditService;
import com.arcade.backend.auth.dto.AuthResponse;
import com.arcade.backend.auth.dto.LoginRequest;
import com.arcade.backend.auth.dto.RegisterRequest;
import com.arcade.backend.auth.entity.PreRegistrationOtp;
import com.arcade.backend.auth.entity.RefreshToken;
import com.arcade.backend.auth.repository.PreRegistrationOtpRepository;
import com.arcade.backend.role.Role;
import com.arcade.backend.role.RoleRepository;
import com.arcade.backend.security.CustomUserDetails;
import com.arcade.backend.security.jwt.JwtService;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import com.arcade.backend.user.dto.UserDto;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final RefreshTokenService refreshTokenService;
  private final SessionService sessionService;
  private final AuditService auditService;
  private final PreRegistrationOtpRepository preRegistrationOtpRepo;
  private final PasswordPolicyValidator passwordPolicyValidator;

  @Transactional
  public AuthResponse register(RegisterRequest request, String ipAddress, String userAgent) {
    passwordPolicyValidator.validate(request.getPassword());
    String email = request.getEmail() != null ? request.getEmail().trim() : "";
    if (userRepository.existsByEmail(email)) {
      throw new IllegalArgumentException("Email already in use");
    }

    PreRegistrationOtp otpEntity =
        preRegistrationOtpRepo
            .findByEmail(email)
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        "Email has not been verified. Please verify your email first."));

    if (!otpEntity.isVerified()) {
      throw new IllegalArgumentException("Email verification incomplete.");
    }

    Role userRole =
        roleRepository
            .findByName("ROLE_USER")
            .orElseGet(
                () ->
                    roleRepository.save(
                        Role.builder()
                            .name("ROLE_USER")
                            .description("Standard user role")
                            .build()));

    User user =
        User.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(email)
            .password(passwordEncoder.encode(request.getPassword()))
            .isEmailVerified(true) // Already verified via PreRegistrationOtp
            .roles(new HashSet<>())
            .build();

    user.getRoles().add(userRole);
    userRepository.save(user);

    preRegistrationOtpRepo.delete(otpEntity);

    auditService.logSecurityEvent(
        user, "REGISTER_SUCCESS", "User registered successfully", ipAddress);

    // Optional: you could auto-login the user and return tokens here if desired.
    // For now, we return empty tokens since we might require explicit login.
    return AuthResponse.builder().accessToken("").build();
  }

  @Transactional
  public Object[] login(LoginRequest request, String ipAddress, String userAgent) {
    String email = request.getEmail() != null ? request.getEmail().trim() : "";
    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(
                () -> {
                  auditService.logSecurityEvent(
                      null, "LOGIN_FAILED", "User not found: " + email, ipAddress);
                  return new IllegalArgumentException("Invalid email or password");
                });

    if (user.isLocked()) {
      if (user.getLockTime() != null
          && user.getLockTime().plusMinutes(15).isBefore(ZonedDateTime.now())) {
        user.setLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);
        auditService.logSecurityEvent(
            user,
            "ACCOUNT_UNLOCKED",
            "Account automatically unlocked after 15-minute cooldown",
            ipAddress);
      } else {
        auditService.logSecurityEvent(
            user, "LOGIN_BLOCKED", "Account is locked due to multiple failed attempts", ipAddress);
        throw new SecurityException(
            "Account is temporarily locked due to multiple failed attempts. Please try again after 15 minutes.");
      }
    }

    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(email, request.getPassword()));
    } catch (org.springframework.security.authentication.BadCredentialsException e) {
      user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
      if (user.getFailedLoginAttempts() >= 5) {
        user.setLocked(true);
        user.setLockTime(ZonedDateTime.now());
        auditService.logSecurityEvent(
            user,
            "ACCOUNT_LOCKED",
            "Account locked due to 5 consecutive failed login attempts",
            ipAddress);
      }
      userRepository.save(user);
      if (user.isLocked()) {
        throw new SecurityException(
            "Account is temporarily locked due to multiple failed attempts. Please try again after 15 minutes.");
      }
      auditService.logSecurityEvent(user, "LOGIN_FAILED", "Invalid password", ipAddress);
      throw new IllegalArgumentException("Invalid email or password");
    } catch (Exception e) {
      log.error("Authentication error for email [{}]: {}", email, e.getMessage(), e);
      throw new IllegalArgumentException(
          "Authentication error: "
              + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
    }

    // Reset failed attempts on success
    user.setFailedLoginAttempts(0);
    userRepository.save(user);

    CustomUserDetails userDetails = new CustomUserDetails(user);
    String accessToken = jwtService.generateToken(userDetails);

    UUID familyId = UUID.randomUUID();
    String rawRefreshToken = refreshTokenService.createRefreshToken(user, familyId, ipAddress);

    sessionService.createSession(user, familyId, ipAddress, userAgent);

    auditService.logSecurityEvent(user, "LOGIN_SUCCESS", "User logged in", ipAddress);

    return new Object[] {
      AuthResponse.builder().accessToken(accessToken).user(mapToUserDto(user)).build(),
      rawRefreshToken
    };
  }

  @Transactional
  public Object[] refresh(String rawRefreshToken, String ipAddress, String userAgent) {
    RefreshToken validToken = refreshTokenService.verifyAndRotate(rawRefreshToken, ipAddress);
    User user = validToken.getUser();

    CustomUserDetails userDetails = new CustomUserDetails(user);
    String newAccessToken = jwtService.generateToken(userDetails);
    String newRawRefreshToken =
        refreshTokenService.createRefreshToken(user, validToken.getFamilyId(), ipAddress);

    auditService.logSecurityEvent(user, "TOKEN_REFRESHED", "Access token refreshed", ipAddress);

    return new Object[] {
      AuthResponse.builder().accessToken(newAccessToken).user(mapToUserDto(user)).build(),
      newRawRefreshToken
    };
  }

  @Transactional(readOnly = true)
  public boolean isUsernameTaken(String username) {
    if (username == null || username.trim().isEmpty()) return false;
    return userRepository.existsByUsername(username.trim().toLowerCase());
  }

  @Transactional
  public void setUsername(String email, String username) {
    if (email == null || username == null) return;
    userRepository
        .findByEmail(email.trim().toLowerCase())
        .ifPresent(
            user -> {
              user.setUsername(username.trim().toLowerCase());
              userRepository.save(user);
            });
  }

  public UserDto mapToUserDto(User user) {
    return UserDto.builder()
        .id(user.getId() != null ? user.getId().toString() : "")
        .email(user.getEmail())
        .username(user.getUsername())
        .firstName(user.getFirstName() != null ? user.getFirstName() : "Anandhu")
        .lastName(user.getLastName() != null ? user.getLastName() : "Pradeep")
        .avatar(user.getAvatar())
        .banner(user.getUserTheme() != null ? user.getUserTheme().getBanner() : null)
        .customThemeBg(user.getUserTheme() != null ? user.getUserTheme().getCustomThemeBg() : null)
        .customTextColor(user.getUserTheme() != null ? user.getUserTheme().getCustomTextColor() : null)
        .authProvider(user.getAuthProvider())
        .roles(
            user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).toList()
                : List.<String>of())
        .permissions(List.<String>of())
        .isOnboarded(user.isOnboarded())
        .phone(user.getPhone())
        .location(user.getLocation())
        .gender(user.getGender())
        .college(user.getCollege())
        .degree(user.getDegree())
        .gradYear(user.getGradYear())
        .targetRole(user.getTargetRole())
        .experienceLevel(user.getExperienceLevel())
        .techStack(user.getTechStack() != null ? user.getTechStack().stream().toList() : List.<String>of())
        .resumeName(user.getResumeName())
        .build();
  }
}
