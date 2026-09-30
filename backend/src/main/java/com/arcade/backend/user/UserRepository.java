package com.arcade.backend.user;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  java.util.List<User> findByRoles_Name(String roleName);
}
