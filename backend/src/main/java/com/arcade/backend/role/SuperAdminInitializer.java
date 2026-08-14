package com.arcade.backend.role;

import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Order(2) // Ensures this runs after RoleInitializer which should be default Order or Order(1)
@RequiredArgsConstructor
public class SuperAdminInitializer implements CommandLineRunner {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional
  public void run(String... args) {
    String superAdminEmail = "superadmin@example.com";
    
    if (!userRepository.existsByEmail(superAdminEmail)) {
      log.info("Super admin not found. Creating default super admin user.");
      
      Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
          .orElseThrow(() -> new IllegalStateException("ROLE_SUPER_ADMIN not found. Make sure RoleInitializer runs first."));
          
      User superAdmin = User.builder()
          .email(superAdminEmail)
          .username("superadmin")
          .password(passwordEncoder.encode("password"))
          .firstName("System")
          .lastName("SuperAdmin")
          .isEmailVerified(true)
          .isOnboarded(true)
          .build();
          
      superAdmin.getRoles().add(superAdminRole);
      
      userRepository.save(superAdmin);
      log.info("Default super admin created with email: {}", superAdminEmail);
    }
  }
}
