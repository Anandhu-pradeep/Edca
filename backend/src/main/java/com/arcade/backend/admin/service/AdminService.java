package com.arcade.backend.admin.service;

import com.arcade.backend.auth.service.AuthService;
import com.arcade.backend.role.Role;
import com.arcade.backend.role.RoleRepository;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import com.arcade.backend.user.dto.UserDto;
import java.util.List;
import java.util.UUID;
import com.arcade.backend.admin.dto.PolicyRequest;
import com.arcade.backend.admin.dto.PolicyDto;
import com.arcade.backend.admin.dto.PermissionDto;
import com.arcade.backend.role.Permission;
import com.arcade.backend.role.PermissionRepository;
import java.util.ArrayList;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PermissionRepository permissionRepository;
  private final AuthService authService;

  @Transactional(readOnly = true)
  public List<UserDto> getAllUsers() {
    return userRepository.findAll().stream()
        .map(authService::mapToUserDto)
        .collect(java.util.stream.Collectors.toList());
  }

  @Transactional
  public UserDto grantRole(UUID userId, String roleName) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    Role roleToGrant = roleRepository.findByName(roleName)
        .orElseThrow(() -> new IllegalArgumentException("Role not found"));

    user.getRoles().add(roleToGrant);
    userRepository.save(user);

    return authService.mapToUserDto(user);
  }

  @Transactional
  public UserDto revokeRole(UUID userId, String roleName) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    Role roleToRevoke = roleRepository.findByName(roleName)
        .orElseThrow(() -> new IllegalArgumentException("Role not found"));
        
    // Prevent removing the last super admin
    if ("ROLE_SUPER_ADMIN".equals(roleName)) {
      long superAdminCount = getSuperAdminCount();
      if (superAdminCount <= 1) {
        throw new IllegalStateException("Cannot revoke the last Super Admin role.");
      }
    }

    user.getRoles().remove(roleToRevoke);
    userRepository.save(user);

    return authService.mapToUserDto(user);
  }

  @Transactional
  public void deleteUser(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    // Check if user is a super admin
    boolean isSuperAdmin = user.getRoles().stream()
        .anyMatch(role -> "ROLE_SUPER_ADMIN".equals(role.getName()));

    if (isSuperAdmin) {
      long superAdminCount = getSuperAdminCount();
      if (superAdminCount <= 1) {
        throw new IllegalStateException("Cannot delete the last Super Admin account.");
      }
    }

    userRepository.delete(user);
  }

  private long getSuperAdminCount() {
    return userRepository.findAll().stream()
        .filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName())))
        .count();
  }

  @Transactional
  public PolicyDto createPolicy(PolicyRequest request) {
    if (roleRepository.findByName(request.getName()).isPresent()) {
      throw new IllegalArgumentException("Policy with this name already exists");
    }

    Set<Permission> permissions = request.getPermissions().stream()
        .map(permName -> permissionRepository.findByName(permName)
            .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + permName)))
        .collect(java.util.stream.Collectors.toSet());

    Role role = Role.builder()
        .name(request.getName())
        .description(request.getDescription())
        .permissions(permissions)
        .build();

    roleRepository.save(role);

    return PolicyDto.builder()
        .id(role.getId())
        .name(role.getName())
        .description(role.getDescription())
        .permissions(role.getPermissions().stream().map(Permission::getName).collect(java.util.stream.Collectors.toList()))
        .build();
  }

  @Transactional
  public PolicyDto updatePolicy(Long policyId, PolicyRequest request) {
    Role role = roleRepository.findById(policyId)
        .orElseThrow(() -> new IllegalArgumentException("Policy not found"));

    if (role.getName().startsWith("ROLE_")) {
      throw new IllegalArgumentException("Cannot modify built-in roles");
    }

    if (!role.getName().equals(request.getName()) && roleRepository.findByName(request.getName()).isPresent()) {
      throw new IllegalArgumentException("Policy with this name already exists");
    }

    Set<Permission> permissions = request.getPermissions().stream()
        .map(permName -> permissionRepository.findByName(permName)
            .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + permName)))
        .collect(java.util.stream.Collectors.toSet());

    role.setName(request.getName());
    role.setDescription(request.getDescription());
    role.setPermissions(permissions);

    roleRepository.save(role);

    return PolicyDto.builder()
        .id(role.getId())
        .name(role.getName())
        .description(role.getDescription())
        .permissions(role.getPermissions().stream().map(Permission::getName).collect(java.util.stream.Collectors.toList()))
        .build();
  }

  @Transactional(readOnly = true)
  public List<PolicyDto> getAllPolicies() {
    return roleRepository.findAll().stream()
        .filter(role -> !role.getName().startsWith("ROLE_")) // Only custom policies
        .map(role -> PolicyDto.builder()
            .id(role.getId())
            .name(role.getName())
            .description(role.getDescription())
            .permissions(role.getPermissions().stream().map(Permission::getName).collect(java.util.stream.Collectors.toList()))
            .build())
        .collect(java.util.stream.Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<PermissionDto> getAllPermissions() {
    return permissionRepository.findAll().stream()
        .map(perm -> PermissionDto.builder()
            .id(perm.getId())
            .name(perm.getName())
            .description(perm.getDescription())
            .build())
        .collect(java.util.stream.Collectors.toList());
  }
}
