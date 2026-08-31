package com.arcade.backend.user.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
  private String id;
  private String email;
  private String username;
  private String firstName;
  private String lastName;
  private String avatar;
  private String banner;
  private String customThemeBg;
  private String customTextColor;
  private String authProvider;
  private List<String> roles;
  private List<String> permissions;
  @JsonProperty("isOnboarded")
  private boolean isOnboarded;
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
