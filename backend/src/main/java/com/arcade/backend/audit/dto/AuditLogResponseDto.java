package com.arcade.backend.audit.dto;

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
public class AuditLogResponseDto {
  private UUID id;
  private String action;
  private String details;
  private String ipAddress;
  private ZonedDateTime createdAt;
}
