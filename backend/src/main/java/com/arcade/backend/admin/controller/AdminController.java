package com.arcade.backend.admin.controller;

import com.arcade.backend.admin.service.AdminService;
import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.user.dto.UserDto;
import java.util.List;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.arcade.backend.admin.dto.PolicyRequest;
import com.arcade.backend.admin.dto.PolicyDto;
import com.arcade.backend.admin.dto.PermissionDto;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

  private final AdminService adminService;

  @GetMapping("/users")
  @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
  public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(HttpServletRequest request) {
    List<UserDto> users = adminService.getAllUsers();
    return ResponseEntity.ok(
        ApiResponse.<List<UserDto>>builder()
            .status(HttpStatus.OK.value())
            .code("USERS_RETRIEVED")
            .message("All users retrieved successfully.")
            .data(users)
            .path(request.getRequestURI())
            .build());
  }

  @PostMapping("/users/{userId}/superadmin")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<UserDto>> makeSuperAdmin(
      @PathVariable UUID userId, HttpServletRequest request) {
    UserDto user = adminService.grantRole(userId, "ROLE_SUPER_ADMIN");
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("SUPER_ADMIN_GRANTED")
            .message("Super Admin role granted successfully.")
            .data(user)
            .path(request.getRequestURI())
            .build());
  }

  @PostMapping("/users/{userId}/admin")
  @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
  public ResponseEntity<ApiResponse<UserDto>> makeAdmin(
      @PathVariable UUID userId, HttpServletRequest request) {
    UserDto user = adminService.grantRole(userId, "ROLE_ADMIN");
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("ADMIN_GRANTED")
            .message("Admin role granted successfully.")
            .data(user)
            .path(request.getRequestURI())
            .build());
  }

  @DeleteMapping("/users/{userId}/superadmin")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<UserDto>> revokeSuperAdmin(
      @PathVariable UUID userId, HttpServletRequest request) {
    UserDto user = adminService.revokeRole(userId, "ROLE_SUPER_ADMIN");
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("SUPER_ADMIN_REVOKED")
            .message("Super Admin role revoked successfully.")
            .data(user)
            .path(request.getRequestURI())
            .build());
  }
  
  @DeleteMapping("/users/{userId}/admin")
  @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
  public ResponseEntity<ApiResponse<UserDto>> revokeAdmin(
      @PathVariable UUID userId, HttpServletRequest request) {
    UserDto user = adminService.revokeRole(userId, "ROLE_ADMIN");
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("ADMIN_REVOKED")
            .message("Admin role revoked successfully.")
            .data(user)
            .path(request.getRequestURI())
            .build());
  }

  @DeleteMapping("/users/{userId}")
  @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteUser(
      @PathVariable UUID userId, HttpServletRequest request) {
    adminService.deleteUser(userId);
    return ResponseEntity.ok(
        ApiResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .code("USER_DELETED")
            .message("User deleted successfully.")
            .data(null)
            .path(request.getRequestURI())
            .build());
  }

  @PostMapping("/policies")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PolicyDto>> createPolicy(
      @RequestBody PolicyRequest request, HttpServletRequest httpRequest) {
    PolicyDto policy = adminService.createPolicy(request);
    return ResponseEntity.ok(
        ApiResponse.<PolicyDto>builder()
            .status(HttpStatus.OK.value())
            .code("POLICY_CREATED")
            .message("Custom policy created successfully.")
            .data(policy)
            .path(httpRequest.getRequestURI())
            .build());
  }

  @PutMapping("/policies/{policyId}")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<PolicyDto>> updatePolicy(
      @PathVariable Long policyId, @Valid @RequestBody PolicyRequest request, HttpServletRequest httpRequest) {
    PolicyDto policy = adminService.updatePolicy(policyId, request);
    return ResponseEntity.ok(
        ApiResponse.<PolicyDto>builder()
            .status(HttpStatus.OK.value())
            .code("POLICY_UPDATED")
            .message("Policy updated successfully.")
            .data(policy)
            .path(httpRequest.getRequestURI())
            .build());
  }

  @GetMapping("/policies")
  @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('MANAGE_POLICIES')")
  public ResponseEntity<ApiResponse<List<PolicyDto>>> getAllPolicies(HttpServletRequest request) {
    List<PolicyDto> policies = adminService.getAllPolicies();
    return ResponseEntity.ok(
        ApiResponse.<List<PolicyDto>>builder()
            .status(HttpStatus.OK.value())
            .code("POLICIES_RETRIEVED")
            .message("Policies retrieved successfully.")
            .data(policies)
            .path(request.getRequestURI())
            .build());
  }

  @GetMapping("/permissions")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissions(HttpServletRequest request) {
    List<PermissionDto> permissions = adminService.getAllPermissions();
    return ResponseEntity.ok(
        ApiResponse.<List<PermissionDto>>builder()
            .status(HttpStatus.OK.value())
            .code("PERMISSIONS_RETRIEVED")
            .message("Permissions retrieved successfully.")
            .data(permissions)
            .path(request.getRequestURI())
            .build());
  }

  @PostMapping("/users/{userId}/policies/{policyName}")
  @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('MANAGE_POLICIES')")
  public ResponseEntity<ApiResponse<UserDto>> grantPolicy(
      @PathVariable UUID userId, @PathVariable String policyName, HttpServletRequest request, Authentication authentication) {
      
    // Users with MANAGE_POLICIES cannot modify themselves
    com.arcade.backend.security.CustomUserDetails userDetails = 
        (com.arcade.backend.security.CustomUserDetails) authentication.getPrincipal();
    
    if (!authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN")) &&
        userDetails.getUser().getId().equals(userId)) {
      throw new SecurityException("You cannot assign policies to yourself.");
    }
      
    UserDto user = adminService.grantRole(userId, policyName);
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("POLICY_GRANTED")
            .message("Policy granted successfully.")
            .data(user)
            .path(request.getRequestURI())
            .build());
  }

  @DeleteMapping("/users/{userId}/policies/{policyName}")
  @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('MANAGE_POLICIES')")
  public ResponseEntity<ApiResponse<UserDto>> revokePolicy(
      @PathVariable UUID userId, @PathVariable String policyName, HttpServletRequest request, Authentication authentication) {
      
    // Users with MANAGE_POLICIES cannot modify themselves
    com.arcade.backend.security.CustomUserDetails userDetails = 
        (com.arcade.backend.security.CustomUserDetails) authentication.getPrincipal();
    
    if (!authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN")) &&
        userDetails.getUser().getId().equals(userId)) {
      throw new SecurityException("You cannot revoke policies from yourself.");
    }
    
    UserDto user = adminService.revokeRole(userId, policyName);
    return ResponseEntity.ok(
        ApiResponse.<UserDto>builder()
            .status(HttpStatus.OK.value())
            .code("POLICY_REVOKED")
            .message("Policy revoked successfully.")
            .data(user)
            .path(request.getRequestURI())
            .build());
  }
}
