package com.arcade.backend.auth.service;

import com.arcade.backend.audit.service.AuditService;
import com.arcade.backend.auth.entity.EmailVerificationToken;
import com.arcade.backend.auth.entity.PasswordHistory;
import com.arcade.backend.auth.entity.PasswordResetToken;
import com.arcade.backend.auth.entity.PreRegistrationOtp;
import com.arcade.backend.auth.repository.EmailVerificationTokenRepository;
import com.arcade.backend.auth.repository.PasswordHistoryRepository;
import com.arcade.backend.auth.repository.PasswordResetTokenRepository;
import com.arcade.backend.auth.repository.PreRegistrationOtpRepository;
import com.arcade.backend.common.service.EmailService;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountRecoveryService {

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private final UserRepository userRepository;
  private final EmailVerificationTokenRepository emailTokenRepo;
  private final PasswordResetTokenRepository resetTokenRepo;
  private final PreRegistrationOtpRepository preRegistrationOtpRepo;
  private final PasswordHistoryRepository historyRepo;
  private final PasswordEncoder passwordEncoder;
  private final PasswordPolicyValidator passwordPolicyValidator;
  private final AuditService auditService;
  private final EmailService emailService;
  private final RateLimitingService rateLimitingService;

  @Transactional
  public void generateEmailVerificationToken(User user, String ipAddress) {
    rateLimitingService.enforceRateLimit("VERIFY_EMAIL:" + user.getEmail().toLowerCase());
    rateLimitingService.enforceRateLimit("VERIFY_IP:" + ipAddress);

    // Delete any existing tokens for this user before generating a new one
    emailTokenRepo.findByUser(user).ifPresent(emailTokenRepo::delete);

    String rawOtp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
    String hashedOtp = passwordEncoder.encode(rawOtp);

    EmailVerificationToken token =
        EmailVerificationToken.builder()
            .user(user)
            .tokenHash(hashedOtp)
            .expiresAt(ZonedDateTime.now().plusMinutes(15))
            .build();
    emailTokenRepo.save(token);

    String subject = "Verify your EDCA Account";
    String body =
        "Hello "
            + user.getFirstName()
            + ",\n\n"
            + "Please verify your email address by entering this 6-digit code:\n\n"
            + rawOtp
            + "\n\n"
            + "This code will expire in 15 minutes. If you did not request this, please ignore this email.";
    emailService.sendEmail(user.getEmail(), subject, body);

    auditService.logSecurityEvent(
        user, "EMAIL_VERIFICATION_SENT", "Verification OTP sent", ipAddress);
  }

  @Transactional
  public void verifyEmail(String email, String rawOtp, String ipAddress) {
    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(
                () -> {
                  auditService.logSecurityEvent(
                      null,
                      "VERIFY_EMAIL_FAILED",
                      "User not found for email verification: " + email,
                      ipAddress);
                  return new IllegalArgumentException("User not found");
                });

    EmailVerificationToken token =
        emailTokenRepo
            .findByUser(user)
            .orElseThrow(
                () -> {
                  auditService.logSecurityEvent(
                      user, "VERIFY_EMAIL_FAILED", "No pending verification found", ipAddress);
                  return new IllegalArgumentException("No pending verification found");
                });

    if (token.getExpiresAt().isBefore(ZonedDateTime.now())) {
      emailTokenRepo.delete(token);
      auditService.logSecurityEvent(
          user, "VERIFY_EMAIL_FAILED", "Verification OTP expired", ipAddress);
      throw new IllegalArgumentException("OTP has expired");
    }

    if (!passwordEncoder.matches(rawOtp, token.getTokenHash())) {
      auditService.logSecurityEvent(
          user, "VERIFY_EMAIL_FAILED", "Invalid verification OTP entered", ipAddress);
      throw new IllegalArgumentException("Invalid OTP");
    }

    user.setEmailVerified(true);
    userRepository.save(user);

    emailTokenRepo.delete(token);
    auditService.logSecurityEvent(
        user, "EMAIL_VERIFIED", "Email successfully verified via OTP", ipAddress);
  }

  @Transactional
  public void generatePasswordResetToken(String email, String ipAddress) {
    if (email != null && !email.trim().isEmpty()) {
      rateLimitingService.enforceRateLimit("RESET_EMAIL:" + email.trim().toLowerCase());
    }
    rateLimitingService.enforceRateLimit("RESET_IP:" + ipAddress);

    Optional<User> userOpt = userRepository.findByEmail(email);
    if (userOpt.isPresent()) {
      User user = userOpt.get();
      String rawToken = UUID.randomUUID().toString();
      String hashedToken = hashToken(rawToken);

      PasswordResetToken token =
          PasswordResetToken.builder()
              .user(user)
              .tokenHash(hashedToken)
              .expiresAt(ZonedDateTime.now().plusHours(1))
              .build();
      resetTokenRepo.save(token);

      String resetLink = "http://localhost:3000/reset-password?token=" + rawToken;
      String subject = "EDCA Password Reset Request";
      String body =
          "Hello "
              + user.getFirstName()
              + ",\n\n"
              + "We received a request to reset your password. Click the link below to securely reset it:\n\n"
              + resetLink
              + "\n\n"
              + "This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email. Your password will not change.";
      emailService.sendEmail(user.getEmail(), subject, body);

      auditService.logSecurityEvent(
          user, "PASSWORD_RESET_REQUESTED", "Password reset email sent", ipAddress);
    } else {
      // Perform dummy token hashing to mitigate timing-based user enumeration attacks
      hashToken(UUID.randomUUID().toString());
      auditService.logSecurityEvent(
          null,
          "PASSWORD_RESET_REQUESTED",
          "Password reset requested for non-existent email: " + email,
          ipAddress);
    }
  }

  @Transactional
  public void resetPassword(String rawToken, String newPassword, String ipAddress) {
    String hashedToken = hashToken(rawToken);
    PasswordResetToken token =
        resetTokenRepo
            .findByTokenHash(hashedToken)
            .orElseThrow(
                () -> {
                  auditService.logSecurityEvent(
                      null,
                      "PASSWORD_RESET_FAILED",
                      "Invalid password reset token presented",
                      ipAddress);
                  return new IllegalArgumentException("Invalid reset token");
                });

    if (token.getExpiresAt().isBefore(ZonedDateTime.now())) {
      resetTokenRepo.delete(token);
      auditService.logSecurityEvent(
          token.getUser(), "PASSWORD_RESET_FAILED", "Expired password reset token used", ipAddress);
      throw new IllegalArgumentException("Reset token expired");
    }

    User user = token.getUser();
    changePassword(user, newPassword, ipAddress);

    resetTokenRepo.delete(token);
    auditService.logSecurityEvent(
        user, "PASSWORD_RESET_SUCCESS", "Password reset successfully via token", ipAddress);
  }

  @Transactional
  public void changePasswordWithOldPassword(
      User user, String oldPassword, String newPassword, String ipAddress) {
    if (user.getPassword() != null && !passwordEncoder.matches(oldPassword, user.getPassword())) {
      auditService.logSecurityEvent(
          user, "PASSWORD_CHANGE_FAILED", "Incorrect current password entered", ipAddress);
      throw new IllegalArgumentException("Incorrect current password");
    }
    if (user.getPassword() != null && passwordEncoder.matches(newPassword, user.getPassword())) {
      auditService.logSecurityEvent(
          user, "PASSWORD_CHANGE_FAILED", "New password identical to current password", ipAddress);
      throw new IllegalArgumentException(
          "New password must be different from the current password");
    }
    changePassword(user, newPassword, ipAddress);
  }

  @Transactional
  public void changePassword(User user, String newPassword, String ipAddress) {
    passwordPolicyValidator.validate(newPassword);

    // Check password history (prevent reuse of last 5 passwords)
    List<PasswordHistory> pastPasswords =
        historyRepo.findTop5ByUserIdOrderByCreatedAtDesc(user.getId());
    for (PasswordHistory history : pastPasswords) {
      if (passwordEncoder.matches(newPassword, history.getPasswordHash())) {
        throw new IllegalArgumentException("Cannot reuse any of your last 5 passwords");
      }
    }

    String hashedNewPassword = passwordEncoder.encode(newPassword);
    user.setPassword(hashedNewPassword);
    userRepository.save(user);

    PasswordHistory newHistory =
        PasswordHistory.builder().user(user).passwordHash(hashedNewPassword).build();
    historyRepo.save(newHistory);

    auditService.logSecurityEvent(user, "PASSWORD_CHANGED", "Password was changed", ipAddress);
  }

  private String hashToken(String token) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(token.getBytes());
      return Base64.getEncoder().encodeToString(hash);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("SHA-256 error", e);
    }
  }

  @Transactional
  public void sendRegistrationOtp(String email, String ipAddress) {
    if (email != null && !email.trim().isEmpty()) {
      rateLimitingService.enforceRateLimit("REG_EMAIL:" + email.trim().toLowerCase());
    }
    rateLimitingService.enforceRateLimit("REG_IP:" + ipAddress);

    Optional<User> existingUserOpt = userRepository.findByEmail(email);
    if (existingUserOpt.isPresent()) {
      User existingUser = existingUserOpt.get();
      String subject = "EDCA Registration Notice";
      String body =
          "Hello "
              + existingUser.getFirstName()
              + ",\n\n"
              + "We received a request to register a new account with your email address on EDCA.\n\n"
              + "Since an account is already registered with this email, no new verification code was generated.\n\n"
              + "If you forgot your password, please use the password reset feature on our login page.";
      emailService.sendEmail(email, subject, body);
      auditService.logSecurityEvent(
          existingUser,
          "REGISTRATION_ATTEMPT_EXISTING",
          "Registration OTP requested for existing account",
          ipAddress);
      return;
    }

    PreRegistrationOtp otpEntity =
        preRegistrationOtpRepo.findByEmail(email).orElse(new PreRegistrationOtp());

    String rawOtp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
    String hashedOtp = passwordEncoder.encode(rawOtp);

    otpEntity.setEmail(email);
    otpEntity.setOtpHash(hashedOtp);
    otpEntity.setVerified(false);
    otpEntity.setExpiresAt(ZonedDateTime.now().plusMinutes(15));

    preRegistrationOtpRepo.save(otpEntity);

    String subject = "Your Registration Verification Code";
    String body =
        "Hello,\n\n"
            + "Please use the following 6-digit code to continue your registration:\n\n"
            + rawOtp
            + "\n\n"
            + "This code will expire in 15 minutes.";
    emailService.sendEmail(email, subject, body);
  }

  @Transactional
  public void verifyRegistrationOtp(String email, String rawOtp, String ipAddress) {
    PreRegistrationOtp otpEntity =
        preRegistrationOtpRepo
            .findByEmail(email)
            .orElseThrow(
                () -> {
                  auditService.logSecurityEvent(
                      null,
                      "VERIFY_OTP_FAILED",
                      "No pending registration found for email: " + email,
                      ipAddress);
                  return new IllegalArgumentException(
                      "No pending registration found for this email");
                });

    if (otpEntity.getExpiresAt().isBefore(ZonedDateTime.now())) {
      preRegistrationOtpRepo.delete(otpEntity);
      auditService.logSecurityEvent(
          null, "VERIFY_OTP_FAILED", "Expired OTP used for email: " + email, ipAddress);
      throw new IllegalArgumentException("OTP has expired");
    }

    if (!passwordEncoder.matches(rawOtp, otpEntity.getOtpHash())) {
      auditService.logSecurityEvent(
          null, "VERIFY_OTP_FAILED", "Invalid OTP entered for email: " + email, ipAddress);
      throw new IllegalArgumentException("Invalid OTP");
    }

    otpEntity.setVerified(true);
    preRegistrationOtpRepo.save(otpEntity);
    auditService.logSecurityEvent(
        null, "VERIFY_OTP_SUCCESS", "Registration OTP verified for email: " + email, ipAddress);
  }
}
