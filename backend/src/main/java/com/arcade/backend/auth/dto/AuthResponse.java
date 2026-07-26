package com.arcade.backend.auth.dto;

import com.arcade.backend.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
  private String accessToken;
  private UserDto user;
  // Note: Refresh token is returned via HttpOnly Cookie, not in response body
}
