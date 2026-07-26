package com.arcade.backend.security;

import com.arcade.backend.user.User;
import java.util.Collection;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

  private final User user;

  public java.util.UUID getId() {
    return user.getId();
  }

  public User getUser() {
    return user;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    java.util.Set<GrantedAuthority> authorities = new java.util.HashSet<>();
    if (user.getRoles() != null) {
      for (com.arcade.backend.role.Role role : user.getRoles()) {
        if (role.getName() != null) {
          authorities.add(new SimpleGrantedAuthority(role.getName()));
        }
        if (role.getPermissions() != null) {
          for (com.arcade.backend.role.Permission perm : role.getPermissions()) {
            if (perm != null && perm.getName() != null) {
              authorities.add(new SimpleGrantedAuthority(perm.getName()));
            }
          }
        }
      }
    }
    return authorities;
  }

  @Override
  public String getPassword() {
    return user.getPassword();
  }

  @Override
  public String getUsername() {
    return user.getEmail();
  }

  @Override
  public boolean isAccountNonExpired() {
    return true; // Implement if needed
  }

  @Override
  public boolean isAccountNonLocked() {
    return !user.isLocked();
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true; // Implement if needed
  }

  @Override
  public boolean isEnabled() {
    return user.isEmailVerified();
  }
}
