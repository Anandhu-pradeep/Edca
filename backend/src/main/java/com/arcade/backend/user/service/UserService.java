package com.arcade.backend.user.service;

import com.arcade.backend.auth.service.AuthService;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import com.arcade.backend.user.UserTheme;
import com.arcade.backend.user.dto.OnboardingRequest;
import com.arcade.backend.user.dto.UserDto;
import java.util.HashSet;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final AuthService authService;

  @Transactional
  public UserDto updateOnboardingProfile(UUID userId, OnboardingRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

    if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
      user.setUsername(request.getUsername().trim().toLowerCase());
    }
    if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
    
    if (request.getBanner() != null || request.getCustomThemeBg() != null || request.getCustomTextColor() != null) {
      if (user.getUserTheme() == null) {
        UserTheme theme = new UserTheme();
        theme.setUser(user);
        user.setUserTheme(theme);
      }
      if (request.getBanner() != null) {
        user.getUserTheme().setBanner(request.getBanner().isEmpty() ? null : request.getBanner());
      }
      if (request.getCustomThemeBg() != null) {
        user.getUserTheme().setCustomThemeBg(request.getCustomThemeBg().isEmpty() ? null : request.getCustomThemeBg());
      }
      if (request.getCustomTextColor() != null) {
        user.getUserTheme().setCustomTextColor(request.getCustomTextColor().isEmpty() ? null : request.getCustomTextColor());
      }
    }

    if (request.getPhone() != null) user.setPhone(request.getPhone());
    if (request.getLocation() != null) user.setLocation(request.getLocation());
    if (request.getGender() != null) user.setGender(request.getGender());
    if (request.getCollege() != null) user.setCollege(request.getCollege());
    if (request.getDegree() != null) user.setDegree(request.getDegree());
    if (request.getGradYear() != null) user.setGradYear(request.getGradYear());
    if (request.getTargetRole() != null) user.setTargetRole(request.getTargetRole());
    if (request.getExperienceLevel() != null) user.setExperienceLevel(request.getExperienceLevel());
    if (request.getResumeName() != null) user.setResumeName(request.getResumeName());
    if (request.getTechStack() != null) {
      user.setTechStack(new HashSet<>(request.getTechStack()));
    }

    user.setOnboarded(true);
    user = userRepository.save(user);

    return authService.mapToUserDto(user);
  }

  public UserDto getUserByUsername(String usernameOrEmail) {
    User user;
    if (usernameOrEmail.contains("@")) {
      user = userRepository.findByEmail(usernameOrEmail)
          .orElseThrow(() -> new RuntimeException("User not found with email: " + usernameOrEmail));
    } else {
      user = userRepository.findByUsername(usernameOrEmail)
          .orElseThrow(() -> new RuntimeException("User not found with username: " + usernameOrEmail));
    }
    return authService.mapToUserDto(user);
  }

  @Transactional
  public void deleteAccount(UUID userId) {
    if (!userRepository.existsById(userId)) {
      throw new RuntimeException("User not found with ID: " + userId);
    }
    userRepository.deleteById(userId);
  }
}
