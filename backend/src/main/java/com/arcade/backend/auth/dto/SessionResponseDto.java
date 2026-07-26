package com.arcade.backend.auth.dto;

import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionResponseDto {
  private UUID id;
  private String ipAddress;
  private String device;
  private String browser;
  private String operatingSystem;
  private String country;
  private ZonedDateTime loginTime;
  private ZonedDateTime lastActivity;
  private boolean isActive;
}
