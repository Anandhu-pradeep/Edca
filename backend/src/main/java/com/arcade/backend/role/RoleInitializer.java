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
    initPermission("user_read", "Can view all users, orgs, admins (Audience section)");
    initPermission("user_delete", "Admin can delete account, but no right to delete superadmins or admins");
    initPermission("org_manage", "Can approve or reject the org request");
    initPermission("redeemcode_manage", "Can generate the redeem code");
    initPermission("role_manage", "Can assign policy to other user to admins");

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
