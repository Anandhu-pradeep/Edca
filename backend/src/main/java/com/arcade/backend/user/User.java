package com.arcade.backend.user;

import com.arcade.backend.common.entity.BaseEntity;
import com.arcade.backend.role.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, unique = true, length = 255)
  private String email;

  @Column(name = "username", unique = true, length = 50)
  private String username;

  @JsonIgnore
  @Column(length = 255)
  private String password;

  @Column(name = "auth_provider", length = 50)
  @Builder.Default
  private String authProvider = "LOCAL";

  @JsonIgnore
  @Column(name = "auth_provider_id", length = 255)
  private String authProviderId;

  @Column(name = "first_name", length = 100)
  private String firstName;

  @Column(name = "last_name", length = 100)
  private String lastName;

  @Column(name = "avatar", columnDefinition = "TEXT")
  private String avatar;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private UserTheme userTheme;

  @Column(name = "is_email_verified", nullable = false)
  @Builder.Default
  private boolean isEmailVerified = false;

  @JsonIgnore
  @Column(name = "is_locked", nullable = false)
  @Builder.Default
  private boolean isLocked = false;

  @JsonIgnore
  @Column(name = "failed_login_attempts", nullable = false)
  @Builder.Default
  private int failedLoginAttempts = 0;

  @JsonIgnore
  @Column(name = "lock_time")
  private ZonedDateTime lockTime;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  @Builder.Default
  private Set<Role> roles = new HashSet<>();

  @Column(name = "is_onboarded", nullable = false)
  @Builder.Default
  private boolean isOnboarded = false;

  @Column(name = "phone", length = 30)
  private String phone;

  @Column(name = "location", length = 150)
  private String location;

  @Column(name = "gender", length = 30)
  private String gender;

  @Column(name = "college", length = 200)
  private String college;

  @Column(name = "degree", length = 150)
  private String degree;

  @Column(name = "grad_year", length = 20)
  private String gradYear;

  @Column(name = "target_role", length = 150)
  private String targetRole;

  @Column(name = "experience_level", length = 50)
  private String experienceLevel;

  @Column(name = "resume_name", length = 255)
  private String resumeName;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_tech_stack", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "skill")
  @Builder.Default
  private Set<String> techStack = new HashSet<>();


}
