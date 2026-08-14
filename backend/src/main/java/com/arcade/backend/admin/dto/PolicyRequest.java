package com.arcade.backend.admin.dto;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyRequest {
  private String name;
  private String description;
  private List<String> permissions; // e.g. ["READ_USERS", "MANAGE_POLICIES"]
}
