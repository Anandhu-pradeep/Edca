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
import java.util.HashSet;
import java.util.Optional;
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

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress, String userAgent) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        PreRegistrationOtp otpEntity = preRegistrationOtpRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email has not been verified. Please verify your email first."));

        if (!otpEntity.isVerified()) {
            throw new IllegalArgumentException("Email verification incomplete.");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("Default role not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isEmailVerified(true) // Already verified via PreRegistrationOtp
                .roles(new HashSet<>())
                .build();
        
        user.getRoles().add(userRole);
        userRepository.save(user);

        preRegistrationOtpRepo.delete(otpEntity);

        auditService.logSecurityEvent(user, "REGISTER_SUCCESS", "User registered successfully", ipAddress);

        // Optional: you could auto-login the user and return tokens here if desired.
        // For now, we return empty tokens since we might require explicit login.
        return AuthResponse.builder().accessToken("").build();
    }

    @Transactional
    public Object[] login(LoginRequest request, String ipAddress, String userAgent) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    auditService.logSecurityEvent(null, "LOGIN_FAILED", "User not found: " + request.getEmail(), ipAddress);
                    return new IllegalArgumentException("Invalid email or password");
                });

        if (user.isLocked()) {
            auditService.logSecurityEvent(user, "LOGIN_BLOCKED", "Account is locked", ipAddress);
            throw new SecurityException("Account is locked due to multiple failed attempts");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLocked(true);
                // Also set lockTime
            }
            userRepository.save(user);
            auditService.logSecurityEvent(user, "LOGIN_FAILED", "Invalid password", ipAddress);
            throw new IllegalArgumentException("Invalid email or password");
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

        return new Object[]{ AuthResponse.builder().accessToken(accessToken).build(), rawRefreshToken };
    }

    @Transactional
    public Object[] refresh(String rawRefreshToken, String ipAddress, String userAgent) {
        RefreshToken validToken = refreshTokenService.verifyAndRotate(rawRefreshToken, ipAddress);
        User user = validToken.getUser();

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String newAccessToken = jwtService.generateToken(userDetails);
        String newRawRefreshToken = refreshTokenService.createRefreshToken(user, validToken.getFamilyId(), ipAddress);

        auditService.logSecurityEvent(user, "TOKEN_REFRESHED", "Access token refreshed", ipAddress);

        return new Object[]{ AuthResponse.builder().accessToken(newAccessToken).build(), newRawRefreshToken };
    }
}
