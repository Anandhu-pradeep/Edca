package com.arcade.backend.user.controller;

import com.arcade.backend.auth.service.AuthService;
import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.security.CustomUserDetails;
import com.arcade.backend.user.User;
import com.arcade.backend.user.dto.UserDto;
import com.arcade.backend.user.dto.OnboardingRequest;
import com.arcade.backend.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

  private final AuthService authService;
  private final UserService userService;

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(
      @AuthenticationPrincipal CustomUserDetails userDetails, HttpServletRequest servletRequest) {
    User user = userDetails.getUser();
    UserDto userDto = authService.mapToUserDto(user);
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("USER_RETRIEVED")
            .message("User profile retrieved successfully.")
            .data(userDto)
            .path(servletRequest.getRequestURI())
            .build());
  }

  @PutMapping("/onboarding")
  public ResponseEntity<ApiResponse<UserDto>> completeOnboarding(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @RequestBody OnboardingRequest request,
      HttpServletRequest servletRequest) {
    User user = userDetails.getUser();
    UserDto updatedUserDto = userService.updateOnboardingProfile(user.getId(), request);
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("ONBOARDING_COMPLETED")
            .message("User onboarding completed successfully.")
            .data(updatedUserDto)
            .path(servletRequest.getRequestURI())
            .build());
  }
}
