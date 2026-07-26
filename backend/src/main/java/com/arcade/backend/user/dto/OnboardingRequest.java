package com.arcade.backend.user.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OnboardingRequest {
  private String username;
  private String avatar;
  private String phone;
  private String location;
  private String gender;
  private String college;
  private String degree;
  private String gradYear;
  private String targetRole;
  private String experienceLevel;
  private List<String> techStack;
  private String resumeName;
}
