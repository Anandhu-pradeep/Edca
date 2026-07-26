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

  @Override
  public void run(String... args) {
    initRole("ROLE_USER", "Standard user role");
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
}
