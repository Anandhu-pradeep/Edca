package com.arcade.backend.role;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoleInitializer implements CommandLineRunner {

  private final RoleRepository roleRepository;
  private final PermissionRepository permissionRepository;

  @Override
  public void run(String... args) {
    initPermission("READ_USERS", "Can view all users in Audience");
    initPermission("MANAGE_POLICIES", "Can assign users to existing policies");
    initPermission("MANAGE_ORG_REQUESTS", "Can approve or reject organization requests");
    initPermission("MANAGE_CREDITS", "Can generate redeem codes for free credits");

    initRole("ROLE_USER", "Standard user role");
    initRole("ROLE_ORGANIZATION", "Organization account role");
    initRole("ROLE_ADMIN", "Administrator role");
    initRole("ROLE_SUPER_ADMIN", "Super administrator role");
  }

  private void initRole(String roleName, String description) {
    if (roleRepository.findByName(roleName).isEmpty()) {
      Role role = Role.builder().name(roleName).description(description).build();
      roleRepository.save(role);
      log.info("Initialized missing role: {}", roleName);
    }
  }

  private void initPermission(String permName, String description) {
    if (permissionRepository.findByName(permName).isEmpty()) {
      Permission perm = Permission.builder().name(permName).description(description).build();
      permissionRepository.save(perm);
      log.info("Initialized missing permission: {}", permName);
    }
  }
}
